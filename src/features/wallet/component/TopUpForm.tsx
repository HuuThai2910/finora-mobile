import { useId, useState } from 'react';
import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import { formatDong } from '@/utils/format';
import { TOPUP_DEFAULT_AMOUNT, TOPUP_FORM_NOTE, TOPUP_MAX, TOPUP_MIN, TOPUP_QUICK_AMOUNTS } from '../constant';
import WalletButton from './WalletButton';
import WalletNote from './WalletNote';

type Props = {
  onSubmit: (amount: number) => void;
  submitting: boolean;
  /** Lỗi khi gọi API tạo lệnh (mạng, backend từ chối), khác lỗi nhập số tiền. */
  submitError: string | null;
};

const groupDigits = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

/**
 * Bước nhập số tiền: ô số lớn có đơn vị "đ", sáu mức chọn nhanh và nút tạo giao dịch. Số tiền là
 * state của riêng form; màn chỉ nhận con số đã hợp lệ qua `onSubmit`.
 */
export default function TopUpForm({ onSubmit, submitting, submitError }: Props) {
  const [text, setText] = useState(groupDigits(TOPUP_DEFAULT_AMOUNT));
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const amount = Number(text.replace(/\D/g, ''));

  // Bàn phím số của iOS không có phím Return; thanh phụ "Xong" để đóng, id riêng cho từng ô.
  const accessoryId = `topup-amount-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const withAccessory = Platform.OS === 'ios';

  const change = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    setText(digits ? groupDigits(Number(digits)) : '');
    setFieldError(null);
  };

  const submit = () => {
    if (!Number.isInteger(amount) || amount < TOPUP_MIN || amount > TOPUP_MAX) {
      setFieldError(`Nhập số tiền từ ${formatDong(TOPUP_MIN)} đến ${formatDong(TOPUP_MAX)}.`);
      return;
    }
    Keyboard.dismiss();
    onSubmit(amount);
  };

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.label} maxFontSizeMultiplier={1.4}>
          Số tiền nạp
        </Text>
        <View style={[styles.inputRow, focused && styles.inputFocused, fieldError ? styles.inputError : null]}>
          <TextInput
            value={text}
            onChangeText={change}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={Colors.authControl}
            selectionColor={Colors.authPrimary}
            inputAccessoryViewID={withAccessory ? accessoryId : undefined}
            accessibilityLabel="Số tiền nạp, đơn vị đồng"
            style={styles.input}
            maxFontSizeMultiplier={1.2}
          />
          <Text style={styles.unit} maxFontSizeMultiplier={1.2}>đ</Text>
        </View>
        {fieldError ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">{fieldError}</Text>
        ) : (
          <Text style={styles.helper}>
            Mỗi lần nạp từ {formatDong(TOPUP_MIN)} đến {formatDong(TOPUP_MAX)}.
          </Text>
        )}

        {/* Cùng dáng chip "Chọn nhanh số tiền" của màn nhập khoản vay. */}
        <View style={styles.quick} accessibilityRole="radiogroup" accessibilityLabel="Chọn nhanh số tiền">
          {TOPUP_QUICK_AMOUNTS.map(value => {
            const selected = value === amount;
            return (
              <Pressable
                key={value}
                onPress={() => change(String(value))}
                accessibilityRole="radio"
                accessibilityLabel={formatDong(value)}
                accessibilityState={{ checked: selected }}
                hitSlop={{ top: 4, bottom: 4 }}
                style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
                  {groupDigits(value)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <WalletButton label="Tạo giao dịch nạp tiền" onPress={submit} loading={submitting} />
      {submitError ? <WalletNote tone="danger" text={submitError} /> : null}
      <WalletNote text={TOPUP_FORM_NOTE} />

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
    </>
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
    // Trên web trình duyệt tự vẽ khung focus kiểu `auto` (bỏ qua độ dày), phải đổi kiểu mới tắt
    // được; viền dưới đã báo focus rồi.
    outlineStyle: 'solid',
    outlineWidth: 0,
    ...tabularNums,
  },
  unit: { fontFamily: FontFamily.semibold, fontSize: 22, lineHeight: 30, color: Colors.authMuted },
  helper: { marginTop: Spacing.sm, fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 18, color: Colors.authMuted },
  error: { marginTop: Spacing.sm, fontFamily: FontFamily.medium, fontSize: 12.5, lineHeight: 18, color: Colors.tagRedText },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.lg },
  // Chip chưa chọn có viền cùng màu nền, để lúc chọn chữ không xê dịch.
  chip: {
    flexGrow: 1,
    flexBasis: '30%',
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
