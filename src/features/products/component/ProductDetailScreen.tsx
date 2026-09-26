import { useRef } from 'react';
import { AccessibilityInfo, Platform, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '@/theme';
import type { MarketStackParamList } from '@/navigation/types';
import { LOAN_STEP_GUTTER } from '../constant';
import { useProduct } from '../hook/useProducts';
import { useLoanSelection, type LoanSelectionField } from '../hooks/useLoanSelection';
import { toLoanTermsView } from '../mappers/loanSelection';
import DisbursementDateField from '../components/DisbursementDateField';
import LoanAmountField from '../components/LoanAmountField';
import LoanPrimaryButton from '../components/LoanPrimaryButton';
import LoanProductIntro from '../components/LoanProductIntro';
import LoanSelectionStatus from '../components/LoanSelectionStatus';
import LoanStepBackdrop from '../components/LoanStepBackdrop';
import LoanStepFooter from '../components/LoanStepFooter';
import LoanStepHeader from '../components/LoanStepHeader';
import LoanStepNote from '../components/LoanStepNote';
import LoanTermField from '../components/LoanTermField';
import LoanTermsCard from '../components/LoanTermsCard';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'ProductDetail'>;

/**
 * Bước 1/3 "Nhập khoản vay" (mockup 26/09/2026): chọn số tiền, kỳ hạn và ngày
 * giải ngân dự kiến một lần; hai bước sau chỉ đọc lại đúng bốn giá trị qua params.
 */
export default function ProductDetailScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<MarketStackParamList, 'ProductDetail'>>();
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = useProduct(route.params.productId);
  const selection = useLoanSelection(data);

  // Giữ thứ tự ưu tiên của màn cũ: có lỗi thì báo lỗi kèm thử lại, kể cả khi còn
  // bản cũ trong cache, thay vì cho nhập trên điều khoản có thể đã lỗi thời.
  const product = !loading && !error ? data : undefined;
  const terms = product ? toLoanTermsView(product) : null;

  // Vị trí hai trường có thể sai trong vùng cuộn, để bấm "Tiếp tục" mà sai thì
  // cuộn tới đúng trường (trường số tiền có thể đã trôi khỏi màn).
  const scrollRef = useRef<ScrollView>(null);
  const fieldOffsets = useRef<Record<LoanSelectionField, number>>({ amount: 0, date: 0 });
  const trackField = (field: LoanSelectionField) => (event: LayoutChangeEvent) => {
    fieldOffsets.current[field] = event.nativeEvent.layout.y;
  };

  const goBack = () => (nav.canGoBack() ? nav.goBack() : nav.navigate('Products'));

  const onContinue = () => {
    const result = selection.submit();
    if (!result) return;
    if (!result.ok) {
      const y = Math.max(0, fieldOffsets.current[result.field] - Spacing.xl);
      scrollRef.current?.scrollTo({ y, animated: true });
      // Android/web tự đọc dòng lỗi nhờ `accessibilityLiveRegion`; iOS không có cơ chế
      // đó nên đọc thành tiếng ở đây (đọc cả hai nơi thì Android bị đọc hai lần).
      if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(result.message);
      return;
    }
    nav.navigate('Schedule', result.params);
  };

  return (
    <LoanStepBackdrop>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.sm }]}
        keyboardShouldPersistTaps="handled"
        // Trên web, "on-drag" của react-native-web bỏ focus ở MỌI lần cuộn, kể cả khi
        // trình duyệt tự cuộn ô vừa chạm (ngày giải ngân ở cuối màn) lên cho thấy;
        // bàn phím vừa mở đã đóng. Chỉ bật trên máy thật, nơi nó chỉ chạy khi người dùng kéo.
        keyboardDismissMode={Platform.OS === 'web' ? 'none' : 'on-drag'}
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <LoanStepHeader title="Nhập khoản vay" step={1} total={3} onBack={goBack} />

        {product && terms ? (
          <>
            <View style={styles.section}>
              <LoanProductIntro name={product.name} repaymentLabel={terms.repaymentLabel} />
              <LoanTermsCard items={terms.items} />
            </View>

            <View style={styles.section} onLayout={trackField('amount')}>
              <LoanAmountField
                amount={selection.amount}
                minAmount={product.minAmount}
                maxAmount={product.maxAmount}
                error={selection.amountError}
                onChange={selection.changeAmount}
              />
            </View>

            <View style={styles.section}>
              <LoanTermField
                termMonths={selection.termMonths}
                minTermMonths={product.minTermMonths}
                maxTermMonths={product.maxTermMonths}
                onChange={selection.changeTermMonths}
              />
            </View>

            <View style={styles.section} onLayout={trackField('date')}>
              <DisbursementDateField
                value={selection.disbursementDate}
                error={selection.dateError}
                onChange={selection.changeDisbursementDate}
              />
            </View>

            {/* Lời công bố lãi suất lấy nguyên văn `rateNotice` của backend. */}
            <View style={styles.note}>
              <LoanStepNote>{product.rateNotice}</LoanStepNote>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <LoanSelectionStatus error={error} onRetry={reload} />
          </View>
        )}
      </ScrollView>

      {/* Lỗi thì thẻ lỗi đã có nút "Thử lại"; nút "Tiếp tục" bị khoá sẽ chỉ gây rối. */}
      {error ? null : (
        <LoanStepFooter>
          <LoanPrimaryButton label="Tiếp tục" onPress={onContinue} disabled={!product} />
        </LoanStepFooter>
      )}
    </LoanStepBackdrop>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: LOAN_STEP_GUTTER, paddingBottom: Spacing.xxl },
  section: { marginTop: Spacing.xxl },
  note: { marginTop: Spacing.xl },
});
