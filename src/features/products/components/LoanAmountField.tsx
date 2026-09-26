import { useState } from 'react';
import { Text, View } from 'react-native';
import { formatDong, formatMoneyRange } from '@/utils/format';
import { LOAN_AMOUNT_STEP } from '../constant';
import { amountQuickPicks } from '../mappers/loanSelection';
import LoanAmountInput from './LoanAmountInput';
import LoanQuickChips from './LoanQuickChips';
import LoanStepper from './LoanStepper';
import { loanFieldStyles } from './loanFieldStyles';

type Props = {
  amount: number;
  minAmount: number;
  maxAmount: number;
  error: string | null;
  onChange: (value: number) => void;
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/**
 * Chọn số tiền vay: gõ trực tiếp, bấm +/− theo nhịp 1 triệu (kẹp trong biên của
 * Product) hoặc chọn chip. Bên phải nhãn là khoảng cho phép — thay cho dòng
 * "Đơn vị: triệu đồng" của mockup, vốn mâu thuẫn với số hiển thị bằng đồng.
 */
export default function LoanAmountField({ amount, minAmount, maxAmount, error, onChange }: Props) {
  const [focused, setFocused] = useState(false);
  const range = formatMoneyRange(minAmount, maxAmount);

  return (
    <View style={loanFieldStyles.section}>
      <View style={loanFieldStyles.labelRow}>
        <Text style={loanFieldStyles.label}>Số tiền muốn vay</Text>
        <Text style={loanFieldStyles.aside} accessibilityLabel={`Khoảng cho phép ${range}`}>
          {range}
        </Text>
      </View>

      <LoanStepper
        subject="số tiền"
        valueText={formatDong(amount)}
        stepHint="Mỗi lần 1 triệu đồng"
        canDecrease={amount > minAmount}
        canIncrease={amount < maxAmount}
        onDecrease={() => onChange(clamp(amount - LOAN_AMOUNT_STEP, minAmount, maxAmount))}
        onIncrease={() => onChange(clamp(amount + LOAN_AMOUNT_STEP, minAmount, maxAmount))}
        focused={focused}
        invalid={!!error}
      >
        <LoanAmountInput amount={amount} onChange={onChange} onFocusChange={setFocused} />
      </LoanStepper>

      {error ? (
        <Text style={loanFieldStyles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <LoanQuickChips
        label="Chọn nhanh số tiền"
        options={amountQuickPicks(minAmount, maxAmount, LOAN_AMOUNT_STEP)}
        selected={amount}
        onSelect={onChange}
      />
    </View>
  );
}
