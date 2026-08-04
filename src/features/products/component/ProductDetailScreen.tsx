import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, Field, SectionLabel, SegmentGroup } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatVND } from '@/utils/format';
import type { MarketStackParamList } from '@/navigation/types';
import { REPAYMENT_METHOD_LABEL, termOptions } from '../constant';
import { useProduct } from '../hook/useProducts';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'ProductDetail'>;

/** Màn 11 — chi tiết sản phẩm và ô tính lãi dự kiến. */
export default function ProductDetailScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<MarketStackParamList, 'ProductDetail'>>();
  const { data, loading, error, reload } = useProduct(route.params.productId);

  const [amount, setAmount] = useState('50.000.000');
  const [term, setTerm] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (loading) return <Screen><LoadingScreen cards={2} /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!data) return null;

  const options = termOptions(data.minTermMonths, data.maxTermMonths);
  const selectedTerm = term ?? options[Math.min(3, options.length - 1)]?.value ?? data.minTermMonths;
  const parsed = Number(amount.replace(/\D/g, ''));

  const onCalculate = () => {
    if (parsed < data.minAmount || parsed > data.maxAmount) {
      setFormError(
        `Số tiền phải nằm trong khoảng ${formatVND(data.minAmount)} – ${formatVND(data.maxAmount)}.`,
      );
      return;
    }
    setFormError(null);
    nav.navigate('Schedule', {
      productId: data.id,
      amount: parsed,
      termMonths: selectedTerm,
    });
  };

  return (
    <Screen>
      <PHeader title="Chi tiết sản phẩm" back hint={data.code} />

      <View style={styles.head}>
        <View style={styles.title}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.code}>{data.code}</Text>
        </View>
        <View style={styles.rate}>
          <Text style={styles.rateValue}>
            {data.annualInterestRate.toFixed(2).replace('.', ',')}%
          </Text>
          <Text style={styles.rateUnit}>/năm</Text>
        </View>
      </View>

      <PItem
        label="Hạn mức"
        icon="coins"
        value={`${formatVND(data.minAmount)} – ${formatVND(data.maxAmount)}`}
      />
      <PItem
        label="Kỳ hạn"
        icon="clock"
        value={`${data.minTermMonths} – ${data.maxTermMonths} tháng`}
        valueTone="brand"
      />
      <PItem
        label="Kiểu tính lãi"
        icon="chart"
        value={REPAYMENT_METHOD_LABEL[data.repaymentMethod] ?? data.repaymentMethod}
      />
      <PItem
        label="Lưu ý"
        icon="file"
        value={<Text style={styles.notice}>{data.rateNotice}</Text>}
        last
      />

      <View style={styles.calc}>
        <SectionLabel muted>Tính lãi dự kiến</SectionLabel>

        <Field
          label="Số tiền vay"
          value={amount}
          onChangeText={setAmount}
          keyboardType="number-pad"
          error={formError ?? undefined}
        />

        <Text style={styles.pickLabel}>Chọn kỳ hạn</Text>
        <SegmentGroup
          label="Chọn kỳ hạn"
          options={options}
          value={selectedTerm}
          onChange={setTerm}
          wrap
        />

        <Button label="Tính lịch trả nợ" onPress={onCalculate} style={styles.action} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  title: { flexShrink: 1, gap: 2 },
  name: { ...Text_.heading, color: Colors.ink },
  code: { ...Text_.micro, color: Colors.ink3 },
  rate: {
    backgroundColor: Colors.brand50,
    borderWidth: 1,
    borderColor: Colors.brand100,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  rateValue: { fontFamily: FontFamily.extrabold, fontSize: FontSize.display, color: Colors.brand },
  rateUnit: { fontFamily: FontFamily.semibold, fontSize: FontSize.caption, color: Colors.brand600 },
  notice: { ...Text_.micro, color: Colors.ink2, textAlign: 'right', maxWidth: 200 },
  calc: {
    marginTop: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingTop: Spacing.xl,
  },
  pickLabel: { ...Text_.microBold, color: Colors.ink2, marginBottom: Spacing.md },
  action: { marginTop: Spacing.xl },
});
