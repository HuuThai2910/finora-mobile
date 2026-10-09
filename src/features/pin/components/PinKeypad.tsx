import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, IconSize, MIN_TOUCH, Radius, Spacing } from '@/theme';

type Props = {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  /** Khóa số khi đang chờ máy chủ hoặc PIN đang bị tạm khóa; phím xoá vẫn theo `canErase`. */
  disabled: boolean;
  canErase: boolean;
};

/** Thứ tự phím như bàn phím số điện thoại; ô trống bên trái số 0 để cân hàng cuối. */
const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'erase'],
] as const;

const KEY_HEIGHT = 56;

/**
 * Bàn phím số tự vẽ thay cho bàn phím hệ thống: không gợi ý, không tự điền, không lưu lịch
 * sử gõ của bàn phím bên thứ ba — những thứ không được chạm vào mã PIN.
 */
export default function PinKeypad({ onDigit, onBackspace, disabled, canErase }: Props) {
  return (
    <View style={styles.pad}>
      {ROWS.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((key, c) => {
            if (key === '') return <View key={c} style={styles.key} />;
            if (key === 'erase') {
              return (
                <Pressable
                  key={c}
                  onPress={onBackspace}
                  disabled={!canErase}
                  accessibilityRole="button"
                  accessibilityLabel="Xoá số vừa nhập"
                  accessibilityState={{ disabled: !canErase }}
                  style={({ pressed }) => [styles.key, pressed && styles.pressed, !canErase && styles.disabled]}
                >
                  <Icon name="delete" size={IconSize.md} color={Colors.authInk} strokeWidth={1.8} />
                </Pressable>
              );
            }
            return (
              <Pressable
                key={c}
                onPress={() => onDigit(key)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`Số ${key}`}
                accessibilityState={{ disabled }}
                style={({ pressed }) => [
                  styles.key,
                  styles.digitKey,
                  pressed && styles.digitPressed,
                  disabled && styles.disabled,
                ]}
              >
                <Text style={styles.digit} maxFontSizeMultiplier={1.3}>
                  {key}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { gap: Spacing.md, marginTop: Spacing.lg },
  row: { flexDirection: 'row', gap: Spacing.md },
  key: {
    flex: 1,
    minHeight: Math.max(KEY_HEIGHT, MIN_TOUCH),
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitKey: { backgroundColor: Colors.authFocusBg },
  digitPressed: { backgroundColor: Colors.tintBlue },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.4 },
  digit: { fontFamily: FontFamily.semibold, fontSize: 24, lineHeight: 32, color: Colors.authInk },
});
