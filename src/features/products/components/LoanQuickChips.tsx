import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing, lh } from '@/theme';
import type { QuickPick } from '../mappers/loanSelection';

type Props = {
  /** Tên nhóm cho trình đọc màn hình, ví dụ "Chọn nhanh số tiền". */
  label: string;
  options: readonly QuickPick[];
  /** Giá trị đang chọn; không trùng chip nào thì không chip nào sáng. */
  selected: number;
  onSelect: (value: number) => void;
};

/** Chip cao 32pt cho gọn như mockup; cộng vùng chạm dôi ra trên dưới thì đủ 44pt. */
const CHIP_HEIGHT = 32;
const TOUCH_EXTRA = 6;

/** Chữ trong chip phóng theo cỡ chữ hệ thống tới mức này; lớn hơn thì xuống dòng, chip cao lên. */
const MAX_FONT_SCALE = 1.4;

/**
 * Hàng chip chọn nhanh, các chip rộng bằng nhau. Chip đang chọn có nền xanh nhạt,
 * viền và chữ xanh; trạng thái chọn còn được báo cho trình đọc màn hình, không
 * chỉ dựa vào màu.
 */
export default function LoanQuickChips({ label, options, selected, onSelect }: Props) {
  if (options.length < 2) return null;

  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map(option => {
        const active = option.value === selected;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: active }}
            hitSlop={{ top: TOUCH_EXTRA, bottom: TOUCH_EXTRA }}
            style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
          >
            <Text
              style={[styles.text, active && styles.textActive]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md },
  chip: {
    flex: 1,
    minWidth: 0,
    minHeight: CHIP_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    // Chip chưa chọn vẫn có viền cùng màu nền, để lúc chọn chữ không xê dịch.
    borderWidth: 1,
    borderColor: Colors.surfaceMuted,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceMuted,
  },
  chipActive: { borderColor: Colors.authPrimary, backgroundColor: Colors.tintBlue },
  pressed: { opacity: 0.7 },
  text: {
    textAlign: 'center',
    fontFamily: FontFamily.medium,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption, 1.4),
    color: Colors.authMuted,
  },
  textActive: { fontFamily: FontFamily.semibold, color: Colors.authPrimary },
});
