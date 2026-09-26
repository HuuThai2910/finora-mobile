import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';
import { Icon } from '@/components/ui';
import type { ProductAttribute } from '../mappers/productCard';
import { PRODUCT_ROW_TILE } from '../constant';

/** Nét icon trong ô đầu dòng: khoảng một nửa ô như mockup. */
const ICON_SIZE = 16;

type Props = {
  attribute: ProductAttribute;
  /** Kẻ ngăn với dòng phía trên; dòng đầu tiên thì không. */
  divided: boolean;
};

/**
 * Một dòng thông số của thẻ sản phẩm: ô icon, nhãn bên trái, giá trị canh phải.
 * Đường kẻ bắt đầu từ nhãn chứ không chạy dưới ô icon, như mockup.
 */
export default function ProductAttributeRow({ attribute, divided }: Props) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${attribute.label}: ${attribute.value}`}
    >
      <View style={styles.tile}>
        <Icon name={attribute.icon} size={ICON_SIZE} color={Colors.authPrimary} />
      </View>
      <View style={[styles.body, divided && styles.divider]}>
        <Text style={styles.label}>{attribute.label}</Text>
        <Text style={[styles.value, attribute.accent && styles.valueAccent]}>{attribute.value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  tile: {
    width: PRODUCT_ROW_TILE.size,
    height: PRODUCT_ROW_TILE.size,
    borderRadius: PRODUCT_ROW_TILE.radius,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    minHeight: 46,
    paddingVertical: Spacing.md,
  },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.rowDivider },
  // Nhãn và giá trị đều được xuống dòng khi chữ phóng to, không tràn khỏi thẻ.
  label: {
    flexShrink: 1,
    fontFamily: FontFamily.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.authLabel,
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: FontFamily.bold,
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.authInk,
  },
  valueAccent: { color: Colors.authPrimary },
});
