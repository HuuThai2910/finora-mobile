import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, MIN_TOUCH } from '@/theme';
import { Icon } from '@/components/ui';

type Props = {
  icon: IconName;
  /** Hồ sơ vay dùng ô vuông bo góc, giao dịch dùng hình tròn — như mockup. */
  shape?: 'square' | 'circle';
  /** Xanh lá cho tiền vào, xanh dương cho mọi thứ khác. */
  tone?: 'blue' | 'green';
  title: string;
  /**
   * Mã hồ sơ dài hơn chỗ trống trên máy hẹp: rút gọn ở giữa để còn thấy cả
   * đầu và đuôi mã, là hai phần người dùng dùng để phân biệt hồ sơ.
   */
  titleEllipsis?: 'middle' | 'tail';
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  /** Cả dòng được đọc thành một câu; màn gọi tự ghép từ các phần hiển thị. */
  accessibilityLabel: string;
  /** Kẻ ngăn cách phía trên (mọi dòng trừ dòng đầu). */
  divider?: boolean;
};

const TONE = {
  blue: { bg: Colors.tintBlue, fg: Colors.authPrimary },
  green: { bg: Colors.tintGreen, fg: Colors.green },
} as const;

/** Một dòng trong thẻ trang chủ: icon trong ô màu nhạt, tên, dòng phụ và giá trị bên phải. */
export default function ActivityRow({
  icon,
  shape = 'circle',
  tone = 'blue',
  title,
  titleEllipsis = 'tail',
  subtitle,
  right,
  onPress,
  accessibilityLabel,
  divider = false,
}: Props) {
  const colors = TONE[tone];

  const body = (
    <>
      <View
        style={[
          styles.badge,
          { backgroundColor: colors.bg },
          shape === 'circle' ? styles.circle : styles.square,
        ]}
      >
        <Icon name={icon} size={20} color={colors.fg} strokeWidth={1.9} />
      </View>

      <View style={styles.text}>
        {/* Mã hồ sơ giữ một dòng (rút gọn ở giữa); tên thường được xuống hai dòng
            trên máy hẹp thay vì bị cắt mất chữ. */}
        <Text
          style={styles.title}
          numberOfLines={titleEllipsis === 'middle' ? 1 : 2}
          ellipsizeMode={titleEllipsis}
        >
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {right}
      {onPress ? <Icon name="chevronRight" size={18} color={Colors.chevronMuted} /> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.row, divider && styles.divider, pressed && styles.pressed]}
      >
        {body}
      </Pressable>
    );
  }

  return (
    <View style={[styles.row, divider && styles.divider]} accessible accessibilityLabel={accessibilityLabel}>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: MIN_TOUCH,
    paddingVertical: 8,
  },
  divider: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  pressed: { opacity: 0.6 },
  badge: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  circle: { borderRadius: 21 },
  square: { borderRadius: 12 },
  text: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authInk,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.authMuted,
    marginTop: 2,
  },
});
