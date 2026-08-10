import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { FormStepProgress, PHeader, PItem, Screen } from '@/components/phone';
import { Button, Card, Field, SectionLabel } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatVND } from '@/utils/format';
import type { MarketStackParamList } from '@/navigation/types';
import { defaultDisbursementDate, REPAYMENT_METHOD_LABEL } from '../constant';
import { useProduct } from '../hook/useProducts';
import LoanSelectionControls from '../components/LoanSelectionControls';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'ProductDetail'>;

/** Bước 1/3 — chọn khoản vay một lần; amount/term được truyền xuyên suốt hai bước sau. */
export default function ProductDetailScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<MarketStackParamList, 'ProductDetail'>>();
  const { data, loading, error, reload } = useProduct(route.params.productId);

  const [initializedProductId, setInitializedProductId] = useState<number | null>(null);
  const [amount, setAmount] = useState(0);
  const [term, setTerm] = useState(0);
  const [disbursementDate, setDisbursementDate] = useState(defaultDisbursementDate);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (!data || initializedProductId === data.id) return;
    // Mỗi Product có biên khác nhau nên khởi tạo lại lựa chọn khi người dùng mở Product mới.
    setAmount(Math.min(data.maxAmount, Math.max(data.minAmount, 50_000_000)));
    setTerm(data.minTermMonths);
    setDisbursementDate(defaultDisbursementDate());
    setInitializedProductId(data.id);
  }, [data, initializedProductId]);

  if (loading) return <Screen><LoadingScreen cards={2} /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!data) return null;

  const onContinue = () => {
    if (amount < data.minAmount || amount > data.maxAmount) {
      setAmountError(
        `Số tiền phải nằm trong khoảng ${formatVND(data.minAmount)} – ${formatVND(data.maxAmount)}.`,
      );
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(disbursementDate) || disbursementDate < new Date().toISOString().slice(0, 10)) {
      setDateError('Ngày giải ngân dự kiến phải là hôm nay hoặc một ngày trong tương lai.');
      return;
    }
    setAmountError(null);
    setDateError(null);
    nav.navigate('Schedule', {
      productId: data.id,
      amount,
      termMonths: term,
      expectedDisbursementDate: disbursementDate,
    });
  };

  return (
    <Screen>
      <PHeader title="Nhập khoản vay" back />
      <FormStepProgress current={1} total={3} label="Chọn khoản vay" />

      <Card style={styles.productCard}>
        <View style={styles.head}>
          <View style={styles.title}>
            <Text style={styles.code}>SẢN PHẨM VAY</Text>
            <Text style={styles.name}>{data.name}</Text>
          </View>
          <Text style={styles.secure}>● Khoản vay minh bạch</Text>
        </View>
        <PItem label="Lãi suất" value={`${data.annualInterestRate.toFixed(2).replace('.', ',')}%/năm`} valueTone="up" />
        <PItem label="Kỳ hạn tối đa" value={`${data.maxTermMonths} tháng`} />
        <PItem label="Hạn mức tối đa" value={formatVND(data.maxAmount)} />
        <PItem label="Cách trả" value={REPAYMENT_METHOD_LABEL[data.repaymentMethod] ?? data.repaymentMethod} last />
      </Card>

      <SectionLabel style={styles.section}>THÔNG TIN KHOẢN VAY</SectionLabel>
      <LoanSelectionControls
        amount={amount}
        termMonths={term}
        minAmount={data.minAmount}
        maxAmount={data.maxAmount}
        minTermMonths={data.minTermMonths}
        maxTermMonths={data.maxTermMonths}
        amountError={amountError ?? undefined}
        onAmountChange={(value) => { setAmount(value); setAmountError(null); }}
        onTermChange={setTerm}
      />

      <Field
        label="Ngày giải ngân dự kiến"
        value={disbursementDate}
        onChangeText={(value) => { setDisbursementDate(value); setDateError(null); }}
        placeholder="YYYY-MM-DD"
        helper="Ngày này được dùng để tính lịch trả dự kiến ở bước tiếp theo"
        required
        error={dateError ?? undefined}
        style={styles.dateField}
      />

      <Text style={styles.notice}>{data.rateNotice}</Text>
      <Button label="Tiếp tục →" onPress={onContinue} style={styles.action} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  productCard: { gap: Spacing.sm },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: { flexShrink: 1, gap: 2 },
  name: { ...Text_.heading, color: Colors.ink },
  code: { ...Text_.captionBold, color: Colors.ink3 },
  secure: { ...Text_.captionBold, color: Colors.emerald },
  notice: { ...Text_.micro, color: Colors.ink2, marginTop: Spacing.xl, lineHeight: 22 },
  section: { marginTop: Spacing.section },
  dateField: { marginTop: Spacing.xxl, marginBottom: 0 },
  action: { marginTop: Spacing.xl },
});
