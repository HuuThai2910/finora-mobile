import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';

export type PortfolioShortcut = { icon: IconName; label: string; onPress: () => void };

/**
 * Ba lối tắt của nhà đầu tư ngay dưới thẻ tổng quan: chợ Notes, Auto-Invest, hợp đồng chờ ký. Ô
 * trắng chia đều một hàng, cùng dáng hàng nút tắt của thẻ ví nhưng nằm ngoài thẻ.
 */
export default function PortfolioShortcuts({ items }: { items: readonly PortfolioShortcut[] }) {
  return (
    <View style={styles.row}>
      {items.map(item => (
        <Pressable
          key={item.label}
          onPress={item.onPress}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}
        >
          <View style={styles.tile}>
            <Icon name={item.icon} size={22} color={Colors.authPrimary} />
          </View>
          <Text style={styles.label} numberOfLines={2} maxFontSizeMultiplier={1.3}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md },
  item: {
    flex: 1,
    minHeight: MIN_TOUCH * 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 6,
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  pressed: { opacity: 0.72 },
  tile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 18, color: Colors.authInk, textAlign: 'center' },
});
