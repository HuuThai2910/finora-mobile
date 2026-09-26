import { useRef } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  type CompositeNavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import type { MarketStackParamList, TabParamList } from '@/navigation/types';
import { Radius, SoftShadow, Spacing } from '@/theme';
import type { LoanApplication } from '@/types/loan';
import {
  LOAN_STEP_GUTTER,
  LoanStepBackdrop,
  LoanStepHeader,
  useProduct,
  usePurposes,
} from '@/features/products';
import { useApplyForm } from '../hook/useApplyForm';
import type { ApplicationFormErrors } from '../schemas/applicationForm';
import ApplyFormConsent from '../components/ApplyFormConsent';
import ApplyFormCreditFields from '../components/ApplyFormCreditFields';
import ApplyFormInputRow from '../components/ApplyFormInputRow';
import ApplyFormIntro from '../components/ApplyFormIntro';
import ApplyFormNote from '../components/ApplyFormNote';
import ApplyFormSection from '../components/ApplyFormSection';
import ApplyFormSelectRow from '../components/ApplyFormSelectRow';
import ApplyFormSubmitBar from '../components/ApplyFormSubmitBar';
import LoanSelectionSummary from '../components/LoanSelectionSummary';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<MarketStackParamList, 'ApplyForm'>,
  BottomTabNavigationProp<TabParamList>
>;

type SectionKey = 'purpose' | 'plan' | 'credit' | 'consent';

/** Lỗi theo đúng thứ tự từ trên xuống của form, kèm nhóm chứa nó để cuộn tới. */
const ERROR_ORDER: readonly { key: keyof ApplicationFormErrors; section: SectionKey }[] = [
  { key: 'purpose', section: 'purpose' },
  { key: 'purposeDetail', section: 'plan' },
  { key: 'income', section: 'credit' },
  { key: 'debt', section: 'credit' },
  { key: 'employment', section: 'credit' },
  { key: 'home', section: 'credit' },
  { key: 'accepted', section: 'consent' },
];

/** Bước 3/3 — chỉ thu thập hồ sơ tài chính; amount/term từ bước 1 được giữ nguyên và chỉ đọc lại. */
export default function ApplyFormScreen() {
  const navigation = useNavigation<Nav>();
  const params = useRoute<RouteProp<MarketStackParamList, 'ApplyForm'>>().params;
  const insets = useSafeAreaInsets();
  const product = useProduct(params.productId);
  const purposes = usePurposes();
  const form = useApplyForm(params, purposes.data);

  // Vị trí từng nhóm trong vùng cuộn: nút nộp ghim đáy nên khi thiếu thông tin
  // ở nhóm đầu, người dùng không thấy lỗi nếu màn không tự cuộn lên.
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Partial<Record<SectionKey, number>>>({});
  const trackSection = (section: SectionKey) => (event: LayoutChangeEvent) => {
    sectionOffsets.current[section] = event.nativeEvent.layout.y;
  };

  const loading = product.loading || purposes.loading;
  const loadError = product.error ?? purposes.error;
  const reload = () => {
    product.reload();
    purposes.reload();
  };

  const showSubmitted = (created: LoanApplication) =>
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

  const revealFirstError = (errors: ApplicationFormErrors) => {
    const first = ERROR_ORDER.find(({ key }) => errors[key]);
    if (!first) return;
    const y = sectionOffsets.current[first.section];
    if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(0, y - Spacing.xl), animated: true });
    const message = errors[first.key];
    // iOS không có "live region" như Android/web nên đọc lỗi đầu tiên thành tiếng.
    if (message) AccessibilityInfo.announceForAccessibility(message);
  };

  const onSubmit = async () => {
    const outcome = await form.submit();
    if (outcome.status === 'invalid') revealFirstError(outcome.errors);
    if (outcome.status === 'created') showSubmitted(outcome.application);
  };

  const header = (
    <LoanStepHeader title="Xác nhận khoản vay" step={3} total={3} onBack={() => navigation.goBack()} />
  );
  const scrollFrame = [styles.content, { paddingTop: insets.top + Spacing.sm }];

  // Đang tải hoặc lỗi: vẫn giữ đầu màn để người vay quay lại được.
  if (loading || loadError || !product.data) {
    return (
      <LoanStepBackdrop>
        <ScrollView contentContainerStyle={scrollFrame} showsVerticalScrollIndicator={false}>
          {header}
          <View style={styles.status}>
            {loading ? (
              <LoadingScreen cards={4} />
            ) : (
              <View style={styles.errorCard}>
                <ErrorState message={loadError ?? 'Sản phẩm không còn khả dụng.'} onRetry={reload} />
              </View>
            )}
          </View>
        </ScrollView>
      </LoanStepBackdrop>
    );
  }

  const { values, errors, update } = form;

  return (
    <LoanStepBackdrop>
      {/* Như bước 1: iOS tự chừa chỗ bàn phím và cuộn ô đang nhập lên trên bàn phím;
          Android đã co cửa sổ theo bàn phím (`adjustResize`). Trên web không đặt
          "on-drag": react-native-web coi mọi lần cuộn là kéo và bỏ focus ô đang nhập,
          kể cả lần trình duyệt tự cuộn tới ô vừa chạm, nên bàn phím sụp ngay. */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={scrollFrame}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'web' ? 'none' : 'on-drag'}
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        {header}
        <View style={styles.intro}>
          <ApplyFormIntro />
        </View>
        <LoanSelectionSummary
          productName={product.data.name}
          amount={params.amount}
          termMonths={params.termMonths}
          annualInterestRate={product.data.annualInterestRate}
          expectedDisbursementDate={params.expectedDisbursementDate}
        />
        <View style={styles.selectionNote}>
          <ApplyFormNote>
            Số tiền và kỳ hạn đã được chọn ở bước đầu. Nếu muốn thay đổi, hãy quay lại thay vì nhập lại lần nữa.
          </ApplyFormNote>
        </View>

        <ApplyFormSection title="Mục đích vay" onLayout={trackSection('purpose')}>
          <ApplyFormSelectRow
            icon="target"
            label="Mục đích vay"
            required
            options={(purposes.data ?? []).map((item) => ({ value: item.code, label: item.label }))}
            value={values.purposeCode}
            onChange={(value) => update('purposeCode', value)}
            placeholder="Chọn mục đích vay"
            error={errors.purpose}
          />
        </ApplyFormSection>

        <ApplyFormSection title="Phương án sử dụng vốn" onLayout={trackSection('plan')}>
          <ApplyFormInputRow
            icon="fileText"
            label="Phương án sử dụng vốn"
            multiline
            required={form.purposeRequiresDetail}
            value={values.purposeDetail}
            onChangeText={(value) => update('purposeDetail', value)}
            placeholder="Nhập phương án sử dụng vốn"
            helper={form.purposeRequiresDetail ? 'Bắt buộc với mục đích đã chọn' : 'Không bắt buộc · tối đa 500 ký tự'}
            error={errors.purposeDetail}
          />
        </ApplyFormSection>

        <ApplyFormSection title="Thông tin hồ sơ tín dụng" onLayout={trackSection('credit')}>
          <ApplyFormCreditFields values={values} errors={errors} onChange={update} />
        </ApplyFormSection>

        <ApplyFormSection title="Xác nhận trước khi nộp" onLayout={trackSection('consent')}>
          <ApplyFormConsent
            checked={values.accepted}
            onChange={(value) => update('accepted', value)}
            error={errors.accepted}
          />
          <ApplyFormNote>
            Sau khi nộp, hệ thống đánh giá hồ sơ, xác định lãi suất áp dụng và tính lại lịch trả bằng
            hệ thống lõi. Nếu được duyệt, bạn sẽ xem đầy đủ điều khoản mới trước khi chọn ký hoặc từ chối.
          </ApplyFormNote>
        </ApplyFormSection>
      </ScrollView>

      <ApplyFormSubmitBar onPress={onSubmit} submitting={form.submitting} error={form.submitError} />
    </LoanStepBackdrop>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: LOAN_STEP_GUTTER, paddingBottom: Spacing.xxl },
  intro: { marginTop: Spacing.xxl },
  selectionNote: { marginTop: Spacing.lg },
  status: { marginTop: Spacing.xxl },
  errorCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    ...SoftShadow.card,
  },
});
