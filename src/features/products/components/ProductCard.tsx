import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, IconSize, Radius, SoftShadow, Spacing } from '@/theme';
import { Icon } from '@/components/ui';
import type { LoanProductCatalog } from '@/types/loan';
import { toProductCardView } from '../mappers/productCard';
import { PRODUCT_CARD_TILE } from '../constant';
import ProductAttributeRow from './ProductAttributeRow';

type Props = {
  product: LoanProductCatalog;
  /** Mở chi tiết sản phẩm — gắn vào cả hàng đầu thẻ (icon, tên, mũi tên). */
  onPress: () => void;
};

/**
 * Thẻ một sản phẩm vay: hàng đầu là tên và mô tả (bấm để mở chi tiết), bên dưới
 * là bốn dòng thông số lấy nguyên từ danh mục của finora-loan.
 */
export default function ProductCard({ product, onPress }: Props) {
  const view = toProductCardView(product);

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={view.description ? `${view.name}. ${view.description}` : view.name}
        accessibilityHint="Mở chi tiết để chọn số tiền và kỳ hạn vay"
        style={({ pressed }) => [styles.head, pressed && styles.pressed]}
      >
        <View style={styles.tile}>
          <Icon name={view.icon} size={IconSize.sm} color={Colors.authPrimary} />
        </View>
        <View style={styles.titles}>
          <Text style={styles.name}>{view.name}</Text>
          {view.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {view.description}
            </Text>
          ) : null}
        </View>
        <Icon name="chevronRight" size={IconSize.xs} color={Colors.chevronMuted} />
      </Pressable>

      <View style={styles.rows}>
        {view.attributes.map((attribute, index) => (
          <ProductAttributeRow key={attribute.key} attribute={attribute} divided={index > 0} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xs,
    ...SoftShadow.card,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  pressed: { opacity: 0.6 },
  tile: {
    width: PRODUCT_CARD_TILE.size,
    height: PRODUCT_CARD_TILE.size,
    borderRadius: PRODUCT_CARD_TILE.radius,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { flex: 1, minWidth: 0, gap: 2 },
  // Tên dài xuống dòng chứ không bị cắt: đó là thông tin chính của thẻ.
  name: { fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 22, color: Colors.authInk },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.authMuted,
  },
  rows: { paddingBottom: Spacing.xs },
});
