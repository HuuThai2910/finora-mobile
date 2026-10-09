import { useId, useState } from 'react';
import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import { formatDong } from '@/utils/format';
import type { InvestBounds } from '../investRules';

type Props = {
  amount: number;
  bounds: InvestBounds;
  error: string | null;
  /** Mức chọn nhanh; mức cuối luôn là toàn bộ phần còn thiếu. */
  picks: number[];
  onChange: (amount: number) => void;
};

/** Mức chọn nhanh xếp lưới 3 cột như màn nạp tiền. */
const PICK_COLUMNS = 3;
/** 12 chữ số (hàng trăm tỷ) là quá đủ cho một lệnh; giữ số trong vùng chính xác của kiểu number. */
const MAX_DIGITS = 12;

const groupDigits = (value: number): string => new Intl.NumberFormat('vi-VN').format(value);
/** Số tiền trong dòng gợi ý: khoảng trắng không ngắt để chữ "đ" không rơi một mình xuống dòng. */
const keepTogether = (value: number): string => formatDong(value).replace(' ', ' ');

/**
 * Ô số tiền góp vốn, cùng dáng ô "Số tiền nạp" của màn nạp tiền: thẻ trắng, con số lớn gạch chân
 * đổi màu theo trạng thái, đơn vị "đ" bên phải, dòng gợi ý hay lỗi ngay dưới và lưới mức chọn nhanh.
 */
export default function InvestAmountField({ amount, bounds, error, picks, onChange }: Props) {
  const [focused, setFocused] = useState(false);

  // Bàn phím số của iOS không có phím Return; thanh phụ "Xong" để đóng, id riêng cho từng ô.
  const accessoryId = `invest-amount-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const withAccessory = Platform.OS === 'ios';

  const change = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, MAX_DIGITS);
    onChange(digits ? Number(digits) : 0);
  };

  const hint =
    bounds.min === bounds.max
      ? `Khoản vay chỉ còn nhận đúng ${keepTogether(bounds.max)}.`
      : `Từ ${keepTogether(bounds.min)} đến ${keepTogether(bounds.max)}, bội số của ${keepTogether(bounds.step)}.`;
  // Ô trống giữ chỗ để hàng cuối của lưới không bị kéo giãn khi thiếu nút.
  const spacers = (PICK_COLUMNS - (picks.length % PICK_COLUMNS)) % PICK_COLUMNS;

  return (
    <View style={styles.card}>
      <Text style={styles.label} maxFontSizeMultiplier={1.4}>
        Số tiền đầu tư
      </Text>
      <View style={[styles.inputRow, focused && styles.inputFocused, error ? styles.inputError : null]}>
        <TextInput
          value={amount > 0 ? groupDigits(amount) : ''}
          onChangeText={change}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={Colors.authControl}
          selectionColor={Colors.authPrimary}
          inputAccessoryViewID={withAccessory ? accessoryId : undefined}
          accessibilityLabel="Số tiền đầu tư, đơn vị đồng"
          style={styles.input}
          maxFontSizeMultiplier={1.2}
        />
        <Text style={styles.unit} maxFontSizeMultiplier={1.2}>đ</Text>
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>
      ) : (
        <Text style={styles.helper}>{hint}</Text>
      )}

      {picks.length ? (
        <View style={styles.quick} accessibilityRole="radiogroup" accessibilityLabel="Chọn nhanh số tiền">
          {picks.map((value, index) => {
            const isMax = index === picks.length - 1;
            const selected = value === amount;
            return (
              <Pressable
                key={value}
                onPress={() => onChange(value)}
                accessibilityRole="radio"
                accessibilityLabel={isMax ? `Tối đa, ${formatDong(value)}` : formatDong(value)}
                accessibilityState={{ checked: selected }}
                hitSlop={{ top: 4, bottom: 4 }}
                style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
                  {isMax ? 'Tối đa' : groupDigits(value)}
                </Text>
              </Pressable>
            );
          })}
          {Array.from({ length: spacers }, (_, i) => (
            <View key={`spacer${i}`} style={styles.spacer} />
          ))}
        </View>
      ) : null}

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
  spacer: { flexGrow: 1, flexBasis: '30%' },
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
