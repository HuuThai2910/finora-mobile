import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing, lh } from '@/theme';

type Props = {
  /** Nội dung nguyên văn, ví dụ `rateNotice` do backend trả về — không tự soạn lại. */
  children: string;
};

/** Vạch xanh bên trái hộp, đo từ mockup (≈3pt). */
const BAR_WIDTH = 3;

/**
 * Hộp ghi chú nền xanh nhạt có vạch xanh bên trái, dùng cho lời công bố lãi
 * suất ở cuối bước nhập khoản vay. Không phụ thuộc màn nào nên bước khác dùng lại được.
 */
export default function LoanStepNote({ children }: Props) {
  return (
    <View style={styles.box}>
      <View style={styles.bar} />
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: Spacing.lg,
    padding: Spacing.md,
    paddingRight: Spacing.xl,
    borderRadius: Radius.sm,
    backgroundColor: Colors.authNoteBg,
  },
  bar: { width: BAR_WIDTH, borderRadius: Radius.pill, backgroundColor: Colors.authPrimary },
  text: {
    flex: 1,
    paddingVertical: Spacing.xs,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption, 1.55),
    color: Colors.authMuted,
  },
});
