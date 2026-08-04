import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, Checkbox, Field, InfoNote, SectionLabel, SegmentGroup } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatVND } from '@/utils/format';
import { useProducts, usePurposes, termOptions, REPAYMENT_METHOD_LABEL } from '@/features/products';
import type { MarketStackParamList } from '@/navigation/types';
import type { CreateLoanApplicationRequest } from '@/types/loan';
import {
  APPLY_STEPS,
  EDUCATION_LEVEL_OPTIONS,
  HOME_OWNERSHIP_OPTIONS,
  PRICING_DISCLOSURE_TEXT,
  PRICING_DISCLOSURE_VERSION,
} from '../constant';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'ApplyForm'>;

/** Chỉ giữ chữ số; ô tiền cho phép gõ dấu chấm phân cách cho dễ đọc. */
const digits = (s: string) => Number(s.replace(/\D/g, ''));

/** `expectedDisbursementDate` phải là hôm nay hoặc tương lai (`@FutureOrPresent`). */
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Màn 13 — tạo hồ sơ vay, bước 1/2.
 *
 * Các trường ở đây bám đúng `CreateLoanApplicationRequest` của `finora-loan`:
 * loanProductId · requestedAmount · requestedTermMonths · purposeCode ·
 * purposeDetail · declaredMonthlyIncome · employmentLengthMonths ·
 * educationLevel · homeOwnership · monthlyDebtObligations ·
 * expectedDisbursementDate · pricingDisclosureVersion · pricingDisclosureAccepted.
 */
export default function ApplyFormScreen() {
  const nav = useNavigation<Nav>();
  const params = useRoute<RouteProp<MarketStackParamList, 'ApplyForm'>>().params;

  const products = useProducts();
  const purposes = usePurposes();

  const [productId, setProductId] = useState<number | null>(params?.productId ?? null);
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState<number | null>(null);
  const [purposeCode, setPurposeCode] = useState<string | null>(null);
  const [purposeDetail, setPurposeDetail] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyDebt, setMonthlyDebt] = useState('0');
  const [employmentMonths, setEmploymentMonths] = useState('');
  const [educationLevel, setEducationLevel] = useState<string | null>(null);
  const [homeOwnership, setHomeOwnership] = useState<string | null>(null);
  const [disbursementDate, setDisbursementDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return isoDate(d);
  });
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loading = products.loading || purposes.loading;
  const loadError = products.error ?? purposes.error;
  const reload = () => {
    products.reload();
    purposes.reload();
  };

  const product = useMemo(
    () => products.data?.find(p => p.id === productId) ?? null,
    [products.data, productId],
  );
  const purpose = purposes.data?.find(p => p.code === purposeCode) ?? null;

  const validate = (): CreateLoanApplicationRequest | null => {
    const next: Record<string, string> = {};

    if (!product) next.product = 'Chọn sản phẩm vay.';

    const requestedAmount = digits(amount);
    if (!requestedAmount) next.amount = 'Nhập số tiền cần vay.';
    else if (product && (requestedAmount < product.minAmount || requestedAmount > product.maxAmount))
      next.amount = `Sản phẩm này cho vay từ ${formatVND(product.minAmount)} đến ${formatVND(product.maxAmount)}.`;

    if (!term) next.term = 'Chọn kỳ hạn.';

    if (!purposeCode) next.purpose = 'Chọn mục đích vay.';
    else if (purpose?.requiresDetail && !purposeDetail.trim())
      next.purposeDetail = 'Mục đích này bắt buộc mô tả chi tiết.';
    if (purposeDetail.length > 500) next.purposeDetail = 'Tối đa 500 ký tự.';

    const declaredMonthlyIncome = digits(monthlyIncome);
    if (!declaredMonthlyIncome) next.income = 'Nhập thu nhập hàng tháng.';

    const monthlyDebtObligations = digits(monthlyDebt);

    if (!homeOwnership) next.home = 'Chọn tình trạng nhà ở.';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(disbursementDate)) {
      next.date = 'Nhập ngày theo dạng YYYY-MM-DD.';
    } else {
      const today = isoDate(new Date());
      if (disbursementDate < today) next.date = 'Ngày giải ngân không được ở quá khứ.';
    }

    if (!accepted) next.accepted = 'Cần xác nhận đã xem công bố lãi suất.';

    setErrors(next);
    if (Object.keys(next).length > 0 || !product || !term || !purposeCode || !homeOwnership) {
      return null;
    }

    const employment = employmentMonths.trim() === '' ? null : digits(employmentMonths);

    return {
      loanProductId: product.id,
      requestedAmount,
      requestedTermMonths: term,
      purposeCode,
      purposeDetail: purposeDetail.trim() || undefined,
      declaredMonthlyIncome,
      employmentLengthMonths: employment ?? undefined,
      educationLevel: educationLevel ?? undefined,
      homeOwnership,
      monthlyDebtObligations,
      expectedDisbursementDate: disbursementDate,
      pricingDisclosureVersion: PRICING_DISCLOSURE_VERSION,
      pricingDisclosureAccepted: true,
    };
  };

  const onSubmit = () => {
    const draft = validate();
    if (draft) nav.navigate('ScoringResult', { draft });
  };

  if (loading) return <Screen><LoadingScreen cards={3} /></Screen>;
  if (loadError) return <Screen><ErrorState message={loadError} onRetry={reload} /></Screen>;

  return (
    <Screen>
      <PHeader title="Tạo hồ sơ vay" back hint={`bước 1/${APPLY_STEPS}`} />

      <SectionLabel>Khoản vay</SectionLabel>

      <Text style={styles.label}>Sản phẩm vay</Text>
      <SegmentGroup
        label="Chọn sản phẩm vay"
        options={(products.data ?? []).map(p => ({ value: p.id, label: p.name }))}
        value={productId}
        onChange={v => {
          setProductId(v);
          setTerm(null);
        }}
        wrap
        style={styles.segments}
      />
      {errors.product ? <Text style={styles.error}>{errors.product}</Text> : null}

      {product ? (
        <>
          <PItem
            label="Lãi suất"
            value={`${product.annualInterestRate.toString().replace('.', ',')}%/năm`}
            valueTone="brand"
          />
          <PItem
            label="Kiểu tính lãi"
            value={REPAYMENT_METHOD_LABEL[product.repaymentMethod] ?? product.repaymentMethod}
            last
          />
        </>
      ) : null}

      <Field
        label="Số tiền cần vay"
        value={amount}
        onChangeText={setAmount}
        keyboardType="number-pad"
        placeholder={product ? `${formatVND(product.minAmount)} – ${formatVND(product.maxAmount)}` : 'Chọn sản phẩm trước'}
        required
        error={errors.amount}
        style={styles.fieldTop}
      />

      <Text style={styles.label}>Kỳ hạn</Text>
      <SegmentGroup
        label="Chọn kỳ hạn"
        options={product ? termOptions(product.minTermMonths, product.maxTermMonths) : []}
        value={term}
        onChange={setTerm}
        wrap
        style={styles.segments}
      />
      {errors.term ? <Text style={styles.error}>{errors.term}</Text> : null}

      <Text style={styles.label}>Mục đích vay</Text>
      <SegmentGroup
        label="Chọn mục đích vay"
        options={(purposes.data ?? []).map(p => ({ value: p.code, label: p.label }))}
        value={purposeCode}
        onChange={setPurposeCode}
        wrap
        style={styles.segments}
      />
      {errors.purpose ? <Text style={styles.error}>{errors.purpose}</Text> : null}

      <Field
        label="Phương án dùng vốn"
        value={purposeDetail}
        onChangeText={setPurposeDetail}
        multiline
        required={purpose?.requiresDetail}
        error={errors.purposeDetail}
        helper={
          purpose?.requiresDetail
            ? 'Bắt buộc với mục đích này · tối đa 500 ký tự'
            : 'Không bắt buộc · tối đa 500 ký tự'
        }
      />

      <SectionLabel style={styles.section}>Thông tin tài chính</SectionLabel>

      <Field
        label="Thu nhập hàng tháng"
        value={monthlyIncome}
        onChangeText={setMonthlyIncome}
        keyboardType="number-pad"
        required
        error={errors.income}
        helper="Thu nhập tự khai, đơn vị đồng"
      />

      <Field
        label="Nợ phải trả hàng tháng"
        value={monthlyDebt}
        onChangeText={setMonthlyDebt}
        keyboardType="number-pad"
        required
        helper="Tổng các khoản đang phải trả. Không có thì để 0"
      />

      <Text style={styles.label}>Tình trạng nhà ở</Text>
      <SegmentGroup
        label="Chọn tình trạng nhà ở"
        options={HOME_OWNERSHIP_OPTIONS}
        value={homeOwnership}
        onChange={setHomeOwnership}
        wrap
        style={styles.segments}
      />
      {errors.home ? <Text style={styles.error}>{errors.home}</Text> : null}

      <Field
        label="Thâm niên làm việc (tháng)"
        value={employmentMonths}
        onChangeText={setEmploymentMonths}
        keyboardType="number-pad"
        helper="Không bắt buộc. Bỏ trống thì mô hình tự điền bằng giá trị trung vị"
      />

      <Text style={styles.label}>Trình độ học vấn</Text>
      <SegmentGroup
        label="Chọn trình độ học vấn"
        options={EDUCATION_LEVEL_OPTIONS}
        value={educationLevel}
        onChange={setEducationLevel}
        wrap
        style={styles.segments}
      />

      <Field
        label="Ngày giải ngân mong muốn"
        value={disbursementDate}
        onChangeText={setDisbursementDate}
        placeholder="YYYY-MM-DD"
        required
        error={errors.date}
        helper="Hôm nay hoặc sau đó"
      />

      <View style={styles.disclosure}>
        <Checkbox
          checked={accepted}
          onChange={setAccepted}
          label="Xác nhận đã xem công bố lãi suất"
        >
          <Text style={styles.disclosureText}>{PRICING_DISCLOSURE_TEXT}</Text>
        </Checkbox>
        {errors.accepted ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {errors.accepted}
          </Text>
        ) : null}
      </View>

      <InfoNote style={styles.note}>
        {`Phiên bản công bố: ${PRICING_DISCLOSURE_VERSION}. Hồ sơ sẽ được chấm điểm trước khi nộp.`}
      </InfoNote>

      <Button label="Chấm điểm AI →" onPress={onSubmit} style={styles.action} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { ...Text_.microBold, color: Colors.ink2, marginBottom: Spacing.md },
  segments: { marginBottom: Spacing.xl },
  fieldTop: { marginTop: Spacing.xl },
  section: { marginTop: Spacing.xl },
  error: { ...Text_.micro, color: Colors.red, marginTop: -Spacing.lg, marginBottom: Spacing.xl },
  disclosure: { marginBottom: Spacing.lg },
  disclosureText: { ...Text_.micro, color: Colors.ink2 },
  note: { marginBottom: Spacing.xl },
  action: { marginTop: Spacing.md },
});
