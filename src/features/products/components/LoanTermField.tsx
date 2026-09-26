import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, tabularNums } from '@/theme';
import { termQuickPicks } from '../mappers/loanSelection';
import LoanQuickChips from './LoanQuickChips';
import LoanStepper from './LoanStepper';
import { loanFieldStyles } from './loanFieldStyles';

type Props = {
  termMonths: number;
  minTermMonths: number;
  maxTermMonths: number;
  onChange: (value: number) => void;
};

/** Số tháng là con số chính của khung: phóng theo cỡ chữ hệ thống tới mức này. */
const MAX_FONT_SCALE = 1.3;

/**
 * Chọn kỳ hạn vay: +/− từng tháng hoặc chọn chip, luôn nằm trong
 * [minTermMonths, maxTermMonths] của Product nên không cần báo lỗi.
 */
export default function LoanTermField({ termMonths, minTermMonths, maxTermMonths, onChange }: Props) {
  const step = (delta: number) =>
    onChange(Math.min(maxTermMonths, Math.max(minTermMonths, termMonths + delta)));

  return (
    <View style={loanFieldStyles.section}>
      <Text style={loanFieldStyles.label}>Kỳ hạn vay</Text>

      <LoanStepper
        subject="kỳ hạn"
        valueText={`${termMonths} tháng`}
        stepHint="Mỗi lần 1 tháng"
        canDecrease={termMonths > minTermMonths}
        canIncrease={termMonths < maxTermMonths}
        onDecrease={() => step(-1)}
        onIncrease={() => step(1)}
      >
        <View style={styles.value} accessible accessibilityLabel={`Kỳ hạn vay ${termMonths} tháng`}>
          <Text style={styles.number} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {termMonths}
          </Text>
          <Text style={styles.unit} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            tháng
          </Text>
        </View>
      </LoanStepper>

      <LoanQuickChips
        label="Chọn nhanh kỳ hạn"
        options={termQuickPicks(minTermMonths, maxTermMonths)}
        selected={termMonths}
        onSelect={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  value: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.md },
  number: {
    fontFamily: FontFamily.extrabold,
    fontSize: FontSize.display,
    color: Colors.authInk,
    ...tabularNums,
  },
  unit: { fontFamily: FontFamily.medium, fontSize: FontSize.body, color: Colors.authMuted },
});
