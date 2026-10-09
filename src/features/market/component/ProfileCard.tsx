import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';

type CardProps = {
  title: string;
  /** Dòng phụ nhỏ bên phải tiêu đề, ví dụ ngày chấm điểm hoặc tổng điểm. */
  aside?: string;
  children: React.ReactNode;
};

/**
 * Thẻ trắng của màn hồ sơ người vay, cùng kiểu thẻ "Thông tin khoản vay": tiêu đề đậm, các dòng
 * nhãn–giá trị ngăn bằng đường kẻ mảnh.
 */
export function ProfileCard({ title, aside, children }: CardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
          {title}
        </Text>
        {aside ? (
          <Text style={styles.aside} maxFontSizeMultiplier={1.3}>
            {aside}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

type RowProps = {
  label: string;
  value: string;
  /** Câu giải thích nhãn, in nhỏ dưới nhãn. */
  hint?: string;
  /** Chữ tự do dài (phương án dùng vốn): nhãn trên, nội dung dưới trọn bề ngang. */
  stacked?: boolean;
  /** Dòng đầu thẻ không kẻ đường phía trên. */
  first?: boolean;
};

export function ProfileRow({ label, value, hint, stacked = false, first = false }: RowProps) {
  return (
    <View
      style={[styles.row, !first && styles.rowDivided]}
      accessible
      accessibilityLabel={hint ? `${label}: ${value}. ${hint}` : `${label}: ${value}`}
    >
      <View style={stacked ? styles.lineStacked : styles.line}>
        <Text style={[styles.label, !stacked && styles.labelInline]} maxFontSizeMultiplier={1.4}>
          {label}
        </Text>
        <Text style={[styles.value, !stacked && styles.valueInline]} maxFontSizeMultiplier={1.4}>
          {value}
        </Text>
      </View>
      {hint ? (
        <Text style={styles.hint} maxFontSizeMultiplier={1.4}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export type ProfileRowData = Omit<RowProps, 'first'>;

/**
 * Nhiều dòng liền nhau, bỏ qua dòng `null` (số liệu không có ở hồ sơ này). Dòng đầu thực sự hiện ra
 * mới là dòng không kẻ, nên thứ tự dòng bị ẩn không làm lệch đường kẻ.
 */
export function ProfileRows({ rows }: { rows: Array<ProfileRowData | null> }) {
  const visible = rows.filter((row): row is ProfileRowData => row !== null);
  return (
    <>
      {visible.map((row, index) => (
        <ProfileRow key={row.label} first={index === 0} {...row} />
      ))}
    </>
  );
}

/** Ghi chú nhỏ cuối thẻ: nguồn số liệu, hồ sơ giả lập, chưa có dữ liệu. */
export function ProfileFootnote({ children }: { children: string }) {
  return (
    <Text style={styles.footnote} maxFontSizeMultiplier={1.4}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 14,
    paddingBottom: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  title: { flexShrink: 1, fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 23, color: Colors.authInk },
  aside: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.authMuted,
  },
  row: { gap: 2, paddingVertical: 10 },
  rowDivided: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.authBorder },
  line: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg },
  lineStacked: { gap: Spacing.xxs },
  label: { fontFamily: FontFamily.regular, fontSize: 13.5, lineHeight: 20, color: Colors.authMuted },
  labelInline: { flexShrink: 1 },
  value: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authInk, ...tabularNums },
  valueInline: { flexShrink: 1, textAlign: 'right' },
  hint: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  footnote: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.authMuted,
  },
});
