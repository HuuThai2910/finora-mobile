import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import { PACKAGE_TILE } from '../constant';
import type { PackageCardView, PackageFact } from '../mappers/packageCard';

type Props = {
  view: PackageCardView;
  onPress: () => void;
};

/**
 * Thẻ một gói vay ưu đãi (mockup 26/09/2026): ô icon, tên + "mã · đối tượng", viên
 * lãi suất và mũi tên ở hàng trên; ba cột Hạn mức / Thời hạn / Hình thức ở hàng
 * dưới. Cả thẻ là một nút mở chi tiết gói, nên nhãn đọc gói đủ thông tin trên thẻ.
 */
export default function PackageCard({ view, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={view.accessibilityLabel}
      accessibilityHint="Mở chi tiết gói vay"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={styles.tile}>
          <Icon name={view.icon} size={22} color={Colors.authPrimary} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.name} maxFontSizeMultiplier={1.4}>
            {view.name}
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={1.4}>
            {view.subtitle}
          </Text>
        </View>
        <View style={styles.side}>
          {/* Viên nhãn không co: "18%/năm" bị bẻ dòng thì mất nghĩa. */}
          <View style={styles.pill}>
            <Text style={styles.pillText} maxFontSizeMultiplier={1.4}>
              {view.rate}
            </Text>
          </View>
          <Icon name="chevronRight" size={20} color={Colors.chevronMuted} />
        </View>
      </View>

      <View style={styles.facts}>
        {view.facts.map(fact => (
          <Fact key={fact.key} fact={fact} />
        ))}
      </View>
    </Pressable>
  );
}

/**
 * Một cột thông số: icon + nhãn trên một hàng, giá trị bên dưới dùng trọn bề
 * rộng cột. Đặt giá trị cạnh icon thì ở 360pt chỉ còn ~70pt, "10 – 500 triệu" không vừa.
 */
function Fact({ fact }: { fact: PackageFact }) {
  return (
    <View style={styles.fact}>
      <View style={styles.factHead}>
        <Icon name={fact.icon} size={15} color={Colors.authMuted} />
        <Text style={styles.factLabel} numberOfLines={1} maxFontSizeMultiplier={1.3}>
          {fact.label}
        </Text>
      </View>
      <Text style={styles.factValue} maxFontSizeMultiplier={1.3}>
        {fact.value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 16,
    borderRadius: Radius.lg,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  pressed: { opacity: 0.72 },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  tile: {
    width: PACKAGE_TILE.size,
    height: PACKAGE_TILE.size,
    borderRadius: PACKAGE_TILE.radius,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 22, color: Colors.authInk },
  subtitle: { fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 18, color: Colors.authMuted },
  side: { flexDirection: 'row', alignItems: 'center', gap: 2, flexShrink: 0 },
  pill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: Colors.greenBg,
  },
  pillText: {
    fontFamily: FontFamily.semibold,
    fontSize: 12.5,
    lineHeight: 17,
    color: Colors.tagGreenText,
    ...tabularNums,
  },
  facts: { flexDirection: 'row', gap: 10, marginTop: 18 },
  fact: { flex: 1, minWidth: 0, gap: 5 },
  factHead: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  factLabel: {
    flexShrink: 1,
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.authMuted,
  },
  factValue: {
    fontFamily: FontFamily.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.authInk,
    ...tabularNums,
  },
});
