import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';
import { rescheduleFieldStyles as f } from './rescheduleFieldStyles';

type Props = {
  /** Câu xác nhận lấy nguyên từ điều khoản cơ cấu hiện hành của Loan Service. */
  termsText: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
};

const CIRCLE = 22;
const TEXT_LINE = 21;

/**
 * Ô xác nhận điều khoản cơ cấu, cùng dáng ô xác nhận ở bước "Nộp hồ sơ": hộp xanh nhạt,
 * ô tròn canh theo dòng chữ đầu, cả hộp là vùng chạm. Câu điều khoản đã ở ngôi "Tôi xác
 * nhận…" nên chính nó là nội dung người vay đồng ý; phiên bản điều khoản gửi kèm khi gửi
 * đề nghị chứ không in ra màn.
 */
export default function RescheduleConsent({ termsText, checked, onChange, error }: Props) {
  return (
    <View>
      <Pressable
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        aria-checked={checked}
        accessibilityLabel="Xác nhận điều khoản cơ cấu"
        accessibilityHint={termsText}
        style={({ pressed }) => [styles.box, !!error && styles.boxError, pressed && styles.pressed]}
      >
        <View style={[styles.circle, checked && styles.circleChecked]}>
          {checked ? <Icon name="check" size={14} color={Colors.onDark} strokeWidth={3} /> : null}
        </View>
        <Text style={styles.text}>{termsText}</Text>
      </Pressable>
      {error ? (
        <Text style={[f.error, styles.error]} accessibilityLiveRegion="polite">
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
    borderRadius: 14,
    // Viền luôn có (cùng màu nền) để khi báo lỗi chỉ đổi màu, nội dung không xê dịch.
    borderWidth: 1,
    borderColor: Colors.authNoteBg,
    backgroundColor: Colors.authNoteBg,
  },
  boxError: { borderColor: Colors.red },
  pressed: { opacity: 0.8 },
  // Viền `authMuted` để ô tròn đạt tương phản 3:1 trên nền xanh nhạt.
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    marginTop: (TEXT_LINE - CIRCLE) / 2,
    borderRadius: CIRCLE / 2,
    borderWidth: 1.5,
    borderColor: Colors.authMuted,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleChecked: { backgroundColor: Colors.authPrimary, borderColor: Colors.authPrimary },
  text: { flex: 1, fontFamily: FontFamily.regular, fontSize: 14, lineHeight: TEXT_LINE, color: Colors.authLabel },
  error: { marginTop: Spacing.sm, paddingHorizontal: Spacing.xs },
});
