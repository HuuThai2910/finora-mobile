import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, FontSize, LineHeight, SoftShadow, Spacing, lh } from '@/theme';
import { Icon } from '@/components/ui';

export type ProfileShortcut = {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  /** Nói rõ bấm vào sẽ mở màn nào khi đích thay đổi theo dữ liệu. */
  hint?: string;
};

/**
 * Ba lối tắt ngang hàng dưới phần đầu màn Hồ sơ. Ba thẻ luôn rộng bằng nhau và
 * cao bằng thẻ cao nhất; chữ phụ tự xuống dòng thay vì tràn khỏi thẻ.
 */
export default function ProfileShortcuts({ items }: { items: readonly ProfileShortcut[] }) {
  return (
    <View style={styles.row}>
      {items.map(item => (
        <ShortcutCard key={item.title} {...item} />
      ))}
    </View>
  );
}

function ShortcutCard({ icon, title, subtitle, onPress, hint }: ProfileShortcut) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityHint={hint}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.tile}>
        <Icon name={icon} size={19} color={Colors.authPrimary} strokeWidth={1.9} />
      </View>
      {/* Ba cột trên máy 360pt chỉ còn ~81pt cho chữ; giới hạn phóng chữ để
          tiêu đề không vỡ thành nhiều dòng làm thẻ cao vọt. */}
      <Text style={styles.title} maxFontSizeMultiplier={1.3}>
        {title}
      </Text>
      <Text style={styles.subtitle} maxFontSizeMultiplier={1.3}>
        {subtitle}
      </Text>
      <View style={styles.chevron}>
        <Icon name="chevronRight" size={14} color={Colors.chevronMuted} strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

/**
 * Chừa bên phải cho mũi tên để chữ không chạy xuống dưới nó. Nét mũi tên chỉ
 * chiếm phần giữa ô icon, nên ô được đẩy sát mép thẻ (`right: 1`): trên máy
 * 360pt, tiêu đề dài nhất ("Lịch trả nợ", ~76pt) còn dư ~5pt trong ô chữ 81pt.
 */
const CHEVRON_ZONE = 14;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md },
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: Spacing.lg,
    paddingLeft: 9,
    paddingRight: CHEVRON_ZONE,
    ...SoftShadow.card,
  },
  pressed: { opacity: 0.7 },
  tile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.micro,
    lineHeight: lh(FontSize.micro, LineHeight.heading),
    color: Colors.authInk,
    marginTop: 10,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
    lineHeight: 16,
    color: Colors.authMuted,
    marginTop: Spacing.xxs,
  },
  chevron: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 1,
    justifyContent: 'center',
  },
});
