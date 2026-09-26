import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, lh } from '@/theme';
import { Icon } from '@/components/ui';
import { APPLY_FORM_BOX_RADIUS, PRICING_DISCLOSURE_TEXT } from '../constant';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
};

const CIRCLE_SIZE = 22;
const TEXT_LINE_HEIGHT = lh(FontSize.micro, 1.5);

/**
 * Ô xác nhận đã xem công bố lãi suất trước khi nộp (`pricingDisclosureAccepted`).
 * Vùng chạm phủ cả hộp; ô tròn canh theo dòng chữ đầu vì câu công bố dài nhiều dòng.
 *
 * Nhãn đọc giữ như màn cũ, còn câu công bố được đọc qua gợi ý: trước đây nhãn
 * ngắn đè mất nội dung nên người dùng trình đọc màn hình không nghe được mình
 * đang đồng ý điều gì. Viền ô tròn dùng `authMuted` để đạt tương phản 3:1 trên
 * nền xanh nhạt (màu nhạt của mockup chỉ ~1,6:1).
 */
export default function ApplyFormConsent({ checked, onChange, error }: Props) {
  return (
    <View>
      <Pressable
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        aria-checked={checked}
        accessibilityLabel="Xác nhận điều khoản khoản vay"
        accessibilityHint={PRICING_DISCLOSURE_TEXT}
        style={({ pressed }) => [styles.box, !!error && styles.boxError, pressed && styles.pressed]}
      >
        <View style={[styles.circle, checked && styles.circleChecked]}>
          {checked ? <Icon name="check" size={14} color={Colors.onDark} strokeWidth={3} /> : null}
        </View>
        <Text style={styles.text}>{PRICING_DISCLOSURE_TEXT}</Text>
      </Pressable>

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: APPLY_FORM_BOX_RADIUS,
    // Viền luôn có (trong suốt) để khi báo lỗi chỉ đổi màu, nội dung không xê dịch.
    borderWidth: 1,
    borderColor: Colors.authNoteBg,
    backgroundColor: Colors.authNoteBg,
  },
  boxError: { borderColor: Colors.red },
  pressed: { opacity: 0.8 },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    marginTop: (TEXT_LINE_HEIGHT - CIRCLE_SIZE) / 2,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 1.5,
    borderColor: Colors.authMuted,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleChecked: { backgroundColor: Colors.authPrimary, borderColor: Colors.authPrimary },
  text: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.micro,
    lineHeight: TEXT_LINE_HEIGHT,
    color: Colors.authLabel,
  },
  error: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption, 1.5),
    color: Colors.red,
  },
});
