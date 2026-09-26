import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';
import { MARKET_NOTE } from '../constant';

type Props = {
  onProducts: () => void;
  onPackages: () => void;
};

/**
 * Cuối màn sàn (mockup 26/09/2026): ghi chú về người vay ẩn danh và tiền phong
 * toả, rồi hai lối sang "Sản phẩm vay" và "Gói vay ưu đãi", mỗi lối một thẻ riêng.
 */
export default function MarketFooter({ onProducts, onPackages }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.note}>
        {/* Chữ "i" trắng trong vòng tròn đặc như mockup; dựng bằng hai khối vì icon
            Lucide "info" chỉ có nét viền. */}
        <View style={styles.noteIcon}>
          <View style={styles.infoDot} />
          <View style={styles.infoBar} />
        </View>
        <Text style={styles.noteText}>{MARKET_NOTE}</Text>
      </View>

      <View style={styles.links}>
        <LinkRow icon="grid" label="Sản phẩm vay" onPress={onProducts} />
        <LinkRow icon="sparkles" label="Gói vay ưu đãi" onPress={onPackages} />
      </View>
    </View>
  );
}

function LinkRow({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Icon name={icon} size={24} color={Colors.authPrimary} />
      <Text style={styles.rowLabel} maxFontSizeMultiplier={1.4}>
        {label}
      </Text>
      <Icon name="chevronRight" size={20} color={Colors.chevronMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.xl },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.marketNote,
  },
  noteIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: Colors.authPrimary,
  },
  infoDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.onDark },
  infoBar: { width: 3, height: 9, borderRadius: 1.5, backgroundColor: Colors.onDark },
  noteText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authMuted,
  },
  links: { gap: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: MIN_TOUCH + 8,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  pressed: { opacity: 0.72 },
  rowLabel: { flex: 1, fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.authInk },
});
