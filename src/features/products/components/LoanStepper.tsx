import { Pressable, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { IconSize, MIN_TOUCH, Radius, Spacing } from '@/theme';
import { Icon } from '@/components/ui';

type Props = {
  /** Đối tượng đang chỉnh, ghép vào nhãn đọc của hai nút: "Giảm số tiền", "Tăng kỳ hạn". */
  subject: string;
  /** Giá trị hiện tại dạng chữ, đọc kèm hai nút để biết vừa đổi thành bao nhiêu. */
  valueText: string;
  /** Mỗi lần bấm đổi bao nhiêu, đọc làm gợi ý: "Mỗi lần 1 triệu đồng". */
  stepHint: string;
  canDecrease: boolean;
  canIncrease: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  /** Viền xanh khi ô nhập ở giữa đang được gõ. */
  focused?: boolean;
  /** Viền đỏ khi giá trị bị từ chối lúc bấm "Tiếp tục". */
  invalid?: boolean;
  /** Giá trị ở giữa (ô nhập số tiền hoặc số tháng). */
  children: React.ReactNode;
};

/**
 * Khung tăng/giảm của bước 1: nút "−" nền xanh nhạt bên trái, nút "+" nền xanh
 * đậm bên phải, giá trị ở giữa. Chạm tới biên thì nút tương ứng nhạt đi và bị
 * khoá, kèm trạng thái `disabled` cho trình đọc màn hình chứ không chỉ đổi màu.
 */
export default function LoanStepper({
  subject,
  valueText,
  stepHint,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
  focused = false,
  invalid = false,
  children,
}: Props) {
  return (
    <View style={[styles.box, focused && styles.boxFocused, invalid && styles.boxInvalid]}>
      <Pressable
        onPress={onDecrease}
        disabled={!canDecrease}
        accessibilityRole="button"
        accessibilityLabel={`Giảm ${subject}`}
        accessibilityValue={{ text: valueText }}
        accessibilityHint={stepHint}
        accessibilityState={{ disabled: !canDecrease }}
        style={({ pressed }) => [styles.button, styles.decrease, pressed && styles.pressed]}
      >
        <Icon
          name="minus"
          size={IconSize.xs}
          color={canDecrease ? Colors.authMuted : Colors.authControl}
          strokeWidth={2.4}
        />
      </Pressable>

      <View style={styles.value}>{children}</View>

      <Pressable
        onPress={onIncrease}
        disabled={!canIncrease}
        accessibilityRole="button"
        accessibilityLabel={`Tăng ${subject}`}
        accessibilityValue={{ text: valueText }}
        accessibilityHint={stepHint}
        accessibilityState={{ disabled: !canIncrease }}
        style={({ pressed }) => [
          styles.button,
          canIncrease ? styles.increase : styles.increaseDisabled,
          pressed && styles.pressed,
        ]}
      >
        <Icon name="plus" size={IconSize.xs} color={Colors.onDark} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    // Khoảng đệm quanh hai nút vuông bên trong khung, đo từ mockup (≈4pt).
    padding: Spacing.xs,
    // Viền giữ nguyên độ dày ở mọi trạng thái, chỉ đổi màu, để nội dung không xê dịch.
    borderWidth: 1,
    borderColor: Colors.authBorder,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
  },
  boxFocused: { borderColor: Colors.authPrimary },
  boxInvalid: { borderColor: Colors.red },
  button: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decrease: { backgroundColor: Colors.tintBlue },
  increase: { backgroundColor: Colors.authPrimary },
  // Hết lượt tăng: nhạt hẳn đi nhưng giữ nguyên hình dạng để bố cục không nhảy.
  increaseDisabled: { backgroundColor: Colors.chipBlue },
  pressed: { opacity: 0.7 },
  value: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
});
