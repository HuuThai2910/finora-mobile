import { useId, useState } from 'react';
import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import { formatDong } from '@/utils/format';
import { WITHDRAW_QUICK_AMOUNTS } from '../constant';
import { feeLabel } from '../mappers/withdrawal';

type Props = {
  amount: number | null;
  onChange: (amount: number | null) => void;
  minimum: number;
  /** Số lớn nhất rút được lúc này (hạn mức còn lại hôm nay, số dư khả dụng sau phí) theo policy của Payment. */
  maximum: number;
  fee: number;
  error?: string;
};

const groupDigits = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

/** Chặn chuỗi số dài vô lý; hạn mức ngày của policy demo là 50 triệu (8 chữ số). */
const MAX_DIGITS = 12;

type QuickPick = { value: number; label: string; spoken: string };

/** Mức chọn nhanh nằm trong khoảng rút được, thêm "Tối đa" là đúng số lớn nhất còn rút được lúc này. */
function quickPicks(minimum: number, maximum: number): QuickPick[] {
  if (maximum < minimum) return [];
  const fixed = WITHDRAW_QUICK_AMOUNTS.filter(value => value >= minimum && value < maximum).map(value => ({
    value,
    label: groupDigits(value),
    spoken: formatDong(value),
  }));
  return [...fixed, { value: maximum, label: 'Tối đa', spoken: `Tối đa ${formatDong(maximum)}` }];
}

/**
 * Ô số tiền rút: ô số lớn có đơn vị "đ", mức chọn nhanh và dòng tiền sẽ trừ khỏi ví. Giới hạn và phí lấy nguyên từ
 * policy; ô này không tự tính phí hay hạn mức.
 */
export default function WithdrawAmountField({ amount, onChange, minimum, maximum, fee, error }: Props) {
  const [focused, setFocused] = useState(false);
  // Bàn phím số của iOS không có phím Return; thanh phụ "Xong" để đóng, id riêng cho từng ô.
  const accessoryId = `withdraw-amount-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const withAccessory = Platform.OS === 'ios';
  const picks = quickPicks(minimum, maximum);

  const change = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, MAX_DIGITS);
    onChange(digits ? Number(digits) : null);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label} maxFontSizeMultiplier={1.4}>
        Số tiền rút
      </Text>
      <View style={[styles.inputRow, focused && styles.inputFocused, error ? styles.inputError : null]}>
        <TextInput
          value={amount === null ? '' : groupDigits(amount)}
          onChangeText={change}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={Colors.authControl}
          selectionColor={Colors.authPrimary}
          inputAccessoryViewID={withAccessory ? accessoryId : undefined}
          accessibilityLabel="Số tiền rút, đơn vị đồng"
          accessibilityHint={error}
          style={styles.input}
          maxFontSizeMultiplier={1.2}
        />
        <Text style={styles.unit} maxFontSizeMultiplier={1.2}>đ</Text>
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>
      ) : (
        <Text style={styles.helper}>
          {maximum >= minimum
            ? `Rút được từ ${formatDong(minimum)} đến ${formatDong(maximum)} lúc này.`
            : `Mỗi lần rút tối thiểu ${formatDong(minimum)}.`}
        </Text>
      )}

      {picks.length > 0 ? (
        <View style={styles.quick} accessibilityRole="radiogroup" accessibilityLabel="Chọn nhanh số tiền">
          {picks.map(pick => {
            const selected = pick.value === amount;
            return (
              <Pressable
                key={pick.label}
                onPress={() => onChange(pick.value)}
                accessibilityRole="radio"
                accessibilityLabel={pick.spoken}
                accessibilityState={{ checked: selected }}
                hitSlop={{ top: 4, bottom: 4 }}
                style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
                  {pick.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Phí rút</Text>
        <Text style={styles.summaryValue}>{feeLabel(fee)}</Text>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Tiền trừ khỏi ví</Text>
        <Text style={styles.summaryValue}>{amount ? formatDong(amount + fee) : '—'}</Text>
      </View>

      {withAccessory ? (
        <InputAccessoryView nativeID={accessoryId}>
          <View style={styles.accessory}>
            <Pressable
              onPress={Keyboard.dismiss}
              hitSlop={Spacing.md}
              accessibilityRole="button"
              accessibilityLabel="Đóng bàn phím"
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.accessoryText}>Xong</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    paddingTop: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  label: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authLabel },
  // Viền dưới giữ nguyên độ dày ở mọi trạng thái, chỉ đổi màu, để con số không xê dịch khi focus.
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.authBorder,
  },
  inputFocused: { borderBottomColor: Colors.authPrimary },
  inputError: { borderBottomColor: Colors.red },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: Spacing.sm,
    fontFamily: FontFamily.extrabold,
    fontSize: 30,
    lineHeight: 40,
    letterSpacing: -0.4,
    color: Colors.authInk,
    // Trên web trình duyệt tự vẽ khung focus kiểu `auto`; viền dưới đã báo focus rồi.
    outlineStyle: 'solid',
    outlineWidth: 0,
    ...tabularNums,
  },
  unit: { fontFamily: FontFamily.semibold, fontSize: 22, lineHeight: 30, color: Colors.authMuted },
  helper: { marginTop: Spacing.sm, fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 18, color: Colors.authMuted },
  error: { marginTop: Spacing.sm, fontFamily: FontFamily.medium, fontSize: 12.5, lineHeight: 18, color: Colors.tagRedText },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.lg, marginBottom: Spacing.xs },
  // Chip chưa chọn có viền cùng màu nền, để lúc chọn chữ không xê dịch.
  chip: {
    flexGrow: 1,
    flexBasis: '22%',
    minHeight: 36,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { borderColor: Colors.authPrimary, backgroundColor: Colors.tintBlue },
  chipText: { fontFamily: FontFamily.medium, fontSize: 14, lineHeight: 20, color: Colors.authMuted, ...tabularNums },
  chipTextSelected: { fontFamily: FontFamily.semibold, color: Colors.authPrimary },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.rowDivider,
  },
  summaryLabel: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20, color: Colors.authMuted },
  summaryValue: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authInk, ...tabularNums },
  pressed: { opacity: 0.7 },
  accessory: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceMuted,
    borderTopWidth: 1,
    borderTopColor: Colors.authBorder,
  },
  accessoryText: { fontFamily: FontFamily.semibold, fontSize: 16, color: Colors.authPrimary },
});
