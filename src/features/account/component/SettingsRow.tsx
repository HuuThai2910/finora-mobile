import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, IconSize, MIN_TOUCH, Radius, Spacing } from '@/theme';
import { Icon } from '@/components/ui';

type Props = {
  icon: IconName;
  title: string;
  subtitle?: string;
  /**
   * Bỏ trống nghĩa là mục chưa có chức năng thật: dòng hiện mờ, không mũi tên,
   * không bấm được, để không ai tưởng đó là nút hỏng.
   */
  onPress?: () => void;
  /** Hành động kết thúc phiên (Đăng xuất): tô đỏ, không mũi tên vì không mở màn mới. */
  danger?: boolean;
  /** Kẻ ngăn cách phía trên; bắt đầu từ cột chữ, không chạy dưới ô icon. */
  divider?: boolean;
  accessibilityHint?: string;
};

const TONES = {
  normal: { tile: Colors.tintBlue, icon: Colors.authPrimary, title: Colors.authInk },
  danger: { tile: Colors.redBg, icon: Colors.red, title: Colors.red },
  upcoming: { tile: Colors.surfaceMuted, icon: Colors.chevronMuted, title: Colors.authMuted },
} as const;

/** Một dòng trong thẻ cài đặt: ô icon xanh nhạt, tên, chữ phụ và mũi tên. */
export default function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
  divider = false,
  accessibilityHint,
}: Props) {
  const tone = !onPress ? TONES.upcoming : danger ? TONES.danger : TONES.normal;
  const spoken = subtitle ? `${title}. ${subtitle}` : title;

  const body = (
    <>
      <View style={[styles.tile, { backgroundColor: tone.tile }]}>
        <Icon name={icon} size={IconSize.xs} color={tone.icon} strokeWidth={1.9} />
      </View>
      <View style={[styles.body, divider && styles.divider]}>
        <View style={styles.text}>
          <Text style={[styles.title, { color: tone.title }, danger && styles.titleDanger]}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {onPress && !danger ? (
          <Icon name="chevronRight" size={18} color={Colors.chevronMuted} strokeWidth={2.2} />
        ) : null}
      </View>
    </>
  );

  if (!onPress) {
    return (
      <View
        style={styles.row}
        accessible
        accessibilityLabel={spoken}
        accessibilityState={{ disabled: true }}
        // Bản web không đọc `accessibilityState`; aria-disabled cho trình đọc màn hình trên trình duyệt.
        aria-disabled
      >
        {body}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={spoken}
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
  text: { flex: 1, minWidth: 0 },
  title: { fontFamily: FontFamily.medium, fontSize: 14.5, lineHeight: 20 },
  titleDanger: { fontFamily: FontFamily.semibold },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    lineHeight: 17,
    color: Colors.authMuted,
    marginTop: 1,
  },
});
