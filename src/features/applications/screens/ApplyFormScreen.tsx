import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import {
  useNavigation,
  useRoute,
  type CompositeNavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { FormStepProgress, PHeader, Screen } from '@/components/phone';
import { Button, Checkbox, Field, InfoNote, SectionLabel, SegmentGroup } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { generateIdempotencyKey } from '@/lib/api';
import type { MarketStackParamList, TabParamList } from '@/navigation/types';
import { Spacing, Text_ } from '@/theme';
import { useProduct, usePurposes } from '@/features/products';
import {
  EDUCATION_LEVEL_OPTIONS,
  HOME_OWNERSHIP_OPTIONS,
  PRICING_DISCLOSURE_TEXT,
  PRICING_DISCLOSURE_VERSION,
} from '../constant';
import { useCreateApplicationMutation } from '../api/applicationApi';
import LoanSelectionSummary from '../components/LoanSelectionSummary';
import {
  buildApplicationRequest,
  type ApplicationFormErrors,
  type ApplicationFormValues,
} from '../schemas/applicationForm';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<MarketStackParamList, 'ApplyForm'>,
  BottomTabNavigationProp<TabParamList>
>;

const initialValues: ApplicationFormValues = {
  purposeCode: null,
  purposeDetail: '',
  monthlyIncome: '',
  monthlyDebt: '0',
  employmentMonths: '',
  educationLevel: null,
  homeOwnership: null,
  accepted: false,
};

const ERROR_KEY_BY_FIELD: Partial<Record<keyof ApplicationFormValues, keyof ApplicationFormErrors>> = {
  purposeCode: 'purpose',
  purposeDetail: 'purposeDetail',
  monthlyIncome: 'income',
  monthlyDebt: 'debt',
  employmentMonths: 'employment',
  homeOwnership: 'home',
  accepted: 'accepted',
};

function mutationMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return 'Không thể nộp hồ sơ. Vui lòng kiểm tra kết nối và thử lại.';
}

/** Bước 3/3 — chỉ thu thập hồ sơ tài chính; amount/term từ bước 1 được giữ nguyên và chỉ đọc lại. */
export default function ApplyFormScreen() {
  const navigation = useNavigation<Nav>();
  const params = useRoute<RouteProp<MarketStackParamList, 'ApplyForm'>>().params;
  const product = useProduct(params.productId);
  const purposes = usePurposes();
  const [createApplication, createState] = useCreateApplicationMutation();
  const idempotencyKey = useRef(generateIdempotencyKey());
  const [values, setValues] = useState<ApplicationFormValues>(initialValues);
  const [errors, setErrors] = useState<ApplicationFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedPurpose = purposes.data?.find((item) => item.code === values.purposeCode);
  const loading = product.loading || purposes.loading;
  const loadError = product.error ?? purposes.error;
  const reload = () => {
    product.reload();
    purposes.reload();
  };

  const update = <K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    const errorKey = ERROR_KEY_BY_FIELD[key];
    if (errorKey) setErrors((current) => ({ ...current, [errorKey]: undefined }));
  };

  const submit = async () => {
    const result = buildApplicationRequest(
      {
        productId: params.productId,
        amount: params.amount,
        termMonths: params.termMonths,
        expectedDisbursementDate: params.expectedDisbursementDate,
        pricingDisclosureVersion: PRICING_DISCLOSURE_VERSION,
      },
      values,
      selectedPurpose?.requiresDetail ?? false,
    );
    setErrors(result.errors);
    if (!result.request) return;

    setSubmitError(null);
    try {
      const created = await createApplication({
        body: result.request,
        idempotencyKey: idempotencyKey.current,
      }).unwrap();
      idempotencyKey.current = generateIdempotencyKey();
      Alert.alert(
        'Đã nộp hồ sơ',
        `Mã ${created.applicationNumber}. Hệ thống đang kiểm tra điều kiện và đánh giá hồ sơ.`,
        [
          { text: 'Về sản phẩm', onPress: () => navigation.popToTop() },
          {
            text: 'Xem hồ sơ',
            onPress: () => navigation.navigate('Hồ sơ', {
              screen: 'ApplicationDetail',
              params: { applicationNumber: created.applicationNumber },
            }),
          },
        ],
      );
    } catch (error) {
      // Giữ nguyên key nếu chưa biết backend đã nhận request hay chưa để lần thử lại không tạo hồ sơ trùng.
      setSubmitError(mutationMessage(error));
    }
  };

  if (loading) return <Screen><LoadingScreen cards={4} /></Screen>;
  if (loadError || !product.data) {
    return <Screen><ErrorState message={loadError ?? 'Sản phẩm không còn khả dụng.'} onRetry={reload} /></Screen>;
  }

  return (
    <Screen
      footer={(
        <Button
          label="Nộp hồ sơ"
          variant="emerald"
          onPress={submit}
          loading={createState.isLoading}
        />
      )}
    >
      <PHeader title="Hoàn thiện hồ sơ" back />
      <FormStepProgress current={3} total={3} label="Thông tin người vay" />

      <SectionLabel>KHOẢN VAY ĐÃ CHỌN</SectionLabel>
      <LoanSelectionSummary
        productName={product.data.name}
        amount={params.amount}
        termMonths={params.termMonths}
        annualInterestRate={product.data.annualInterestRate}
        expectedDisbursementDate={params.expectedDisbursementDate}
      />
      <InfoNote style={styles.selectionNote}>
        Số tiền và kỳ hạn đã được chọn ở bước đầu. Nếu muốn thay đổi, hãy quay lại thay vì nhập lại lần nữa.
      </InfoNote>

      <SectionLabel style={styles.section}>MỤC ĐÍCH VAY</SectionLabel>
      <SegmentGroup
        label="Chọn mục đích vay"
        options={(purposes.data ?? []).map((item) => ({ value: item.code, label: item.label }))}
        value={values.purposeCode}
        onChange={(value) => update('purposeCode', value)}
        wrap
        style={styles.segments}
      />
      {errors.purpose ? <Text style={styles.error}>{errors.purpose}</Text> : null}
      <Field
        label="Phương án sử dụng vốn"
        value={values.purposeDetail}
        onChangeText={(value) => update('purposeDetail', value)}
        multiline
        required={selectedPurpose?.requiresDetail}
        error={errors.purposeDetail}
        helper={selectedPurpose?.requiresDetail ? 'Bắt buộc với mục đích đã chọn' : 'Không bắt buộc · tối đa 500 ký tự'}
      />

      <SectionLabel style={styles.section}>THÔNG TIN HỒ SƠ TÍN DỤNG</SectionLabel>
      <Field
        label="Thu nhập hàng tháng"
        value={values.monthlyIncome}
        onChangeText={(value) => update('monthlyIncome', value)}
        keyboardType="number-pad"
        required
        error={errors.income}
        helper="Thông tin tự khai, đơn vị đồng"
      />
      <Field
        label="Nghĩa vụ nợ hàng tháng"
        value={values.monthlyDebt}
        onChangeText={(value) => update('monthlyDebt', value)}
        keyboardType="number-pad"
        required
        error={errors.debt}
        helper="Tổng các khoản phải trả mỗi tháng; không có thì để 0"
      />
      <Field
        label="Thâm niên làm việc (tháng)"
        value={values.employmentMonths}
        onChangeText={(value) => update('employmentMonths', value)}
        keyboardType="number-pad"
        error={errors.employment}
        helper="Không bắt buộc"
      />

      <Text style={styles.label}>Trình độ học vấn</Text>
      <SegmentGroup
        label="Chọn trình độ học vấn"
        options={EDUCATION_LEVEL_OPTIONS}
        value={values.educationLevel}
        onChange={(value) => update('educationLevel', value)}
        wrap
        style={styles.segments}
      />

      <Text style={styles.label}>Tình trạng nhà ở *</Text>
      <SegmentGroup
        label="Chọn tình trạng nhà ở"
        options={HOME_OWNERSHIP_OPTIONS}
        value={values.homeOwnership}
        onChange={(value) => update('homeOwnership', value)}
        wrap
        style={styles.segments}
      />
      {errors.home ? <Text style={styles.error}>{errors.home}</Text> : null}

      <SectionLabel style={styles.section}>XÁC NHẬN TRƯỚC KHI NỘP</SectionLabel>
      <Checkbox
        checked={values.accepted}
        onChange={(value) => update('accepted', value)}
        label="Xác nhận điều khoản khoản vay"
      >
        <Text style={styles.disclosureText}>{PRICING_DISCLOSURE_TEXT}</Text>
      </Checkbox>
      {errors.accepted ? <Text style={styles.checkboxError}>{errors.accepted}</Text> : null}
      <InfoNote tone="info" style={styles.info}>
        Sau khi nộp, hệ thống sẽ tính lại và lưu lịch trả, kiểm tra điều kiện rồi đánh giá hồ sơ để chuyên viên thẩm định.
      </InfoNote>
      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  selectionNote: { marginTop: Spacing.lg },
  section: { marginTop: Spacing.section },
  label: { ...Text_.microBold, color: Colors.ink2, marginBottom: Spacing.md },
  segments: { marginBottom: Spacing.xl },
  error: { ...Text_.micro, color: Colors.red, marginTop: -Spacing.lg, marginBottom: Spacing.xl },
  checkboxError: { ...Text_.micro, color: Colors.red, marginTop: Spacing.md },
  disclosureText: { ...Text_.micro, color: Colors.ink2 },
  info: { marginTop: Spacing.xl },
  submitError: { ...Text_.microBold, color: Colors.red, marginTop: Spacing.xl },
});
