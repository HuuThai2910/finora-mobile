import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, MIN_TOUCH, Radius, Spacing, Text_, tabularNums } from '@/theme';
import { formatVND } from '@/utils/format';
import { termOptions } from '../constant';

type Props = {
  amount: number;
  termMonths: number;
  minAmount: number;
  maxAmount: number;
  minTermMonths: number;
  maxTermMonths: number;
  amountError?: string;
  onAmountChange: (value: number) => void;
  onTermChange: (value: number) => void;
};

const formatInput = (value: number): string => value > 0 ? new Intl.NumberFormat('vi-VN').format(value) : '';
const digits = (value: string): number => Number(value.replace(/\D/g, ''));
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

function StepButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label === '+' ? 'Tăng giá trị' : 'Giảm giá trị'}
      onPress={onPress}
      style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}
    >
      <Text style={styles.stepButtonText}>{label}</Text>
    </Pressable>
  );
}

/** Hai bộ chọn tiền/kỳ hạn dùng đúng một lần ở đầu luồng, các bước sau chỉ đọc lại lựa chọn này. */
export default function LoanSelectionControls({
  amount,
  termMonths,
  minAmount,
  maxAmount,
  minTermMonths,
  maxTermMonths,
  amountError,
  onAmountChange,
  onTermChange,
}: Props) {
  const amountStep = 1_000_000;
  const quickAmounts = Array.from(new Set([
    minAmount,
    clamp(Math.round((minAmount + (maxAmount - minAmount) * 0.25) / amountStep) * amountStep, minAmount, maxAmount),
    clamp(Math.round((minAmount + maxAmount) / 2 / amountStep) * amountStep, minAmount, maxAmount),
    maxAmount,
  ]));
  const terms = termOptions(minTermMonths, maxTermMonths);

  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.label}>Số tiền muốn vay</Text>
        <View style={[styles.stepper, amountError && styles.stepperError]}>
          <StepButton label="−" onPress={() => onAmountChange(clamp(amount - amountStep, minAmount, maxAmount))} />
          <TextInput
            value={formatInput(amount)}
            onChangeText={(value) => onAmountChange(digits(value))}
            keyboardType="number-pad"
            accessibilityLabel="Số tiền muốn vay"
            style={styles.amountInput}
          />
          <StepButton label="+" onPress={() => onAmountChange(clamp(amount + amountStep, minAmount, maxAmount))} />
        </View>
        {amountError ? <Text style={styles.error}>{amountError}</Text> : null}
        <View style={styles.chips}>
          {quickAmounts.map((value) => (
            <Pressable
              key={value}
              onPress={() => onAmountChange(value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: amount === value }}
              style={[styles.chip, amount === value && styles.chipActive]}
            >
              <Text style={[styles.chipText, amount === value && styles.chipTextActive]}>{formatVND(value)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View>
        <Text style={styles.label}>Kỳ hạn vay</Text>
        <View style={styles.stepper}>
          <StepButton label="−" onPress={() => onTermChange(clamp(termMonths - 1, minTermMonths, maxTermMonths))} />
          <View style={styles.termValue}>
            <Text style={styles.termNumber}>{termMonths}</Text>
            <Text style={styles.termUnit}>THÁNG</Text>
          </View>
          <StepButton label="+" onPress={() => onTermChange(clamp(termMonths + 1, minTermMonths, maxTermMonths))} />
        </View>
        <View style={styles.chips}>
          {terms.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onTermChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: termMonths === option.value }}
              style={[styles.chip, termMonths === option.value && styles.chipActive]}
            >
              <Text style={[styles.chipText, termMonths === option.value && styles.chipTextActive]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xxl },
  label: { ...Text_.microBold, color: Colors.ink2, marginBottom: Spacing.md },
  stepper: { flexDirection: 'row', alignItems: 'center', minHeight: 64, padding: Spacing.sm, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.lg },
  stepperError: { borderColor: Colors.red, borderWidth: 2 },
  stepButton: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceMuted, borderRadius: Radius.md },
  stepButtonText: { fontFamily: FontFamily.semibold, fontSize: FontSize.display, color: Colors.ink2 },
  pressed: { opacity: 0.65 },
  amountInput: { flex: 1, paddingHorizontal: Spacing.md, fontFamily: FontFamily.extrabold, fontSize: FontSize.display, color: Colors.ink, textAlign: 'center', ...tabularNums },
  termValue: { flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: Spacing.sm },
  termNumber: { fontFamily: FontFamily.extrabold, fontSize: FontSize.display, color: Colors.ink, ...tabularNums },
  termUnit: { ...Text_.captionBold, color: Colors.ink3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.md },
  chip: { minHeight: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: Spacing.lg, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.md, backgroundColor: Colors.card },
  chipActive: { borderColor: Colors.brand, backgroundColor: Colors.brand50 },
  chipText: { ...Text_.captionBold, color: Colors.ink2 },
  chipTextActive: { color: Colors.brand },
  error: { ...Text_.micro, color: Colors.red, marginTop: Spacing.md },
});
