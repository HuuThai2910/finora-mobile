import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, FontSize, IconSize, Radius, SoftShadow, Spacing } from '@/theme';
import { Icon } from '@/components/ui';

type Props = {
  icon: IconName;
  title: string;
  children: React.ReactNode;
};

/**
 * Thẻ trắng gom một nhóm cài đặt: dòng tiêu đề (icon xanh, chữ đậm) rồi các dòng. Cùng khung, lề và bóng với
 * `SettingsCard` của màn Hồ sơ; feature giữ bản riêng vì không đọc component nội bộ của feature `account`.
 */
export default function SettingsGroupCard({ icon, title, children }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name={icon} size={IconSize.xs} color={Colors.authPrimary} />
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm,
    ...SoftShadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  title: {
    flexShrink: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.body,
    lineHeight: 22,
    color: Colors.authInk,
  },
});
