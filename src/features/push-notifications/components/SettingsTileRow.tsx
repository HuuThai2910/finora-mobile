import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, IconSize, MIN_TOUCH, Radius, Spacing } from '@/theme';
import { Icon } from '@/components/ui';

type Props = {
  icon: IconName;
  /** Chuỗi là tên dòng; phần tử (nhãn trạng thái) thì tự lo trợ năng của nó. */
  title: React.ReactNode;
  subtitle?: string;
  /** Có thì cả dòng là nút mở việc tiếp theo (kèm mũi tên), như dòng cài đặt ở màn Hồ sơ. */
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Phần bên phải thay cho mũi tên, ví dụ công tắc của một nhóm thông báo. */
  right?: React.ReactNode;
  /** Kẻ ngăn cách phía trên; bắt đầu từ cột chữ, không chạy dưới ô icon. */
  divider?: boolean;
};

/**
 * Một dòng trong thẻ cài đặt: ô icon xanh nhạt 40pt, tên, chữ phụ, rồi mũi tên (dòng bấm được) hoặc phần bên phải.
 * Cùng nhịp với `SettingsRow` của màn Hồ sơ. Dòng có công tắc không gộp thành một khối trợ năng để trình đọc màn
 * hình vẫn chạm được công tắc.
 */
export default function SettingsTileRow({
  icon,
  title,
  subtitle,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  right,
  divider = false,
}: Props) {
  const body = (
    <>
      <View style={styles.tile}>
        <Icon name={icon} size={IconSize.xs} color={Colors.authPrimary} strokeWidth={1.9} />
      </View>
      <View style={[styles.body, divider && styles.divider]}>
        <View style={styles.text}>
          {typeof title === 'string' ? <Text style={styles.title}>{title}</Text> : title}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
        {onPress && !right ? (
          <Icon name="chevronRight" size={18} color={Colors.chevronMuted} strokeWidth={2.2} />
        ) : null}
      </View>
    </>
  );

  if (!onPress) return <View style={styles.row}>{body}</View>;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', minHeight: MIN_TOUCH + Spacing.xl },
  pressed: { opacity: 0.6 },
  tile: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginLeft: Spacing.lg,
    paddingVertical: 11,
  },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.rowDivider },
  text: { flex: 1, minWidth: 0, gap: 1 },
  title: { fontFamily: FontFamily.medium, fontSize: 14.5, lineHeight: 20, color: Colors.authInk },
  subtitle: { fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 17, color: Colors.authMuted },
});
