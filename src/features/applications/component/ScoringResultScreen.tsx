import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Spacing, Text_, tabularNums } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, InfoNote, ScoreRing, SectionLabel, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatDong, formatVND } from '@/utils/format';
import { toUserMessage } from '@/lib/api';
import { useProducts, usePurposes } from '@/features/products';
import type { MarketStackParamList } from '@/navigation/types';
import type { CreateLoanApplicationRequest, LoanProductCatalog } from '@/types/loan';
import type { AiHomeOwnership, AiPurpose, CreditScoreRequest } from '@/types/credit';
import { APPLY_STEPS, DECISION_LABEL, DECISION_TONE, toEmpLength } from '../constant';
import { useCreditScore } from '../hook/useApplications';
import { createApplication } from '../api';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'ScoringResult'>;

/**
 * Màn 14 — chấm điểm rồi nộp hồ sơ, bước 2/2.
 *
 * Cần danh mục sản phẩm (lấy lãi suất) và danh sách mục đích (lấy `aiValue`)
 * trước khi dựng được payload cho `finora-ai`, nên phần chấm điểm nằm trong
 * component con để chỉ chạy khi đã đủ dữ liệu.
 */
export default function ScoringResultScreen() {
  const { draft } = useRoute<RouteProp<MarketStackParamList, 'ScoringResult'>>().params;
  const products = useProducts();
  const purposes = usePurposes();

  const loading = products.loading || purposes.loading;
  const error = products.error ?? purposes.error;
  const reload = () => {
    products.reload();
    purposes.reload();
  };

  if (loading) return <Screen><LoadingScreen cards={3} /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;

  const product = products.data?.find(p => p.id === draft.loanProductId);
  const aiValue = purposes.data?.find(p => p.code === draft.purposeCode)?.aiValue;

  if (!product || !aiValue) {
    return (
      <Screen>
        <ErrorState
          message="Không khớp được sản phẩm hoặc mục đích vay với dữ liệu máy chủ."
          hint="Quay lại và chọn lại từ danh sách."
          onRetry={reload}
        />
      </Screen>
    );
  }

  return <Scoring draft={draft} product={product} aiPurpose={aiValue as AiPurpose} />;
}

function Scoring({
  draft,
  product,
  aiPurpose,
}: {
  draft: CreateLoanApplicationRequest;
  product: LoanProductCatalog;
  aiPurpose: AiPurpose;
}) {
  const nav = useNavigation<Nav>();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Schema của `finora-ai` chỉ nhận thu nhập năm, nên phải quy đổi từ thu nhập
  // tháng người dùng khai. `dti` là tỷ lệ phần trăm nợ trên thu nhập.
  const body: CreditScoreRequest = {
    annual_inc: draft.declaredMonthlyIncome * 12,
    loan_amnt: draft.requestedAmount,
    purpose: aiPurpose,
    home_ownership: draft.homeOwnership as AiHomeOwnership,
    term_months: draft.requestedTermMonths,
    int_rate: product.annualInterestRate,
    emp_length: toEmpLength(draft.employmentLengthMonths ?? null),
    dti: Math.round((draft.monthlyDebtObligations / draft.declaredMonthlyIncome) * 1000) / 10,
  };

  const { data, loading, error, reload } = useCreditScore(body);

  const onSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createApplication(draft);
      Alert.alert(
        'Đã nộp hồ sơ',
        `Mã hồ sơ ${created.applicationNumber}. Hệ thống sẽ kiểm tra điều kiện và chấm điểm chính thức.`,
        [{ text: 'Xong', onPress: () => nav.popToTop() }],
      );
    } catch (e) {
      setSubmitError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Screen><LoadingScreen cards={3} /></Screen>;
  if (error) {
    return (
      <Screen>
        <PHeader title="Kết quả chấm điểm" back hint={`bước 2/${APPLY_STEPS}`} />
        <ErrorState message={error} hint="Chưa gọi được dịch vụ chấm điểm." onRetry={reload} />
      </Screen>
    );
  }
  if (!data) return null;

  const rejected = data.decision === 'REJECTED';

  return (
    <Screen>
      <PHeader title="Kết quả chấm điểm" back hint={`bước 2/${APPLY_STEPS}`} />

      <View style={styles.hero}>
        <ScoreRing grade={data.credit_grade} size={111} />
        <Text style={styles.score}>{data.evaluation_score.toFixed(1).replace('.', ',')} / 100</Text>
        <Tag tone={DECISION_TONE[data.decision]}>{DECISION_LABEL[data.decision]}</Tag>
        <Text style={styles.model}>{data.model_version}</Text>
      </View>

      <SectionLabel>Chi tiết đánh giá</SectionLabel>

      <PItem
        label="Xác suất vỡ nợ (PD)"
        value={`${(data.pd_probability * 100).toFixed(2).replace('.', ',')}%`}
      />
      <PItem label="Điểm rủi ro 5C" value={`${data.risk_score} / 100`} />
      <PItem label="Hạng tín dụng" value={data.credit_grade} />
      <PItem label="Hạn mức đề xuất" value={formatDong(data.suggested_limit)} valueTone="brand" last />

      {data.rejection_reason ? (
        <InfoNote tone="warn" style={styles.reason}>
          {data.rejection_reason}
        </InfoNote>
      ) : null}

      <SectionLabel style={styles.section}>Hồ sơ sắp nộp</SectionLabel>

      <PItem label="Sản phẩm" value={product.name} />
      <PItem label="Số tiền" value={formatDong(draft.requestedAmount)} />
      <PItem label="Kỳ hạn" value={`${draft.requestedTermMonths} tháng`} />
      <PItem label="Ngày giải ngân mong muốn" value={draft.expectedDisbursementDate} last />

      {data.suggested_limit < draft.requestedAmount ? (
        <InfoNote tone="warn" style={styles.reason}>
          {`Hạn mức đề xuất (${formatVND(data.suggested_limit)}) thấp hơn số tiền bạn yêu cầu. Hồ sơ vẫn nộp được nhưng nhiều khả năng phải duyệt tay.`}
        </InfoNote>
      ) : null}

      {submitError ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {submitError}
        </Text>
      ) : null}

      <Button
        label="Nộp hồ sơ chờ duyệt"
        variant="emerald"
        onPress={onSubmit}
        loading={submitting}
        style={styles.action}
      />

      {rejected ? (
        <Text style={styles.note}>
          Kết quả này là đánh giá sơ bộ. Bạn vẫn có thể nộp để hệ thống chấm chính thức.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.xl },
  score: { ...Text_.display, color: Colors.ink, ...tabularNums },
  model: { ...Text_.micro, color: Colors.ink3 },
  section: { marginTop: Spacing.xxl },
  reason: { marginTop: Spacing.xl },
  error: { ...Text_.micro, color: Colors.red, marginTop: Spacing.xl },
  action: { marginTop: Spacing.xxl },
  note: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
});
