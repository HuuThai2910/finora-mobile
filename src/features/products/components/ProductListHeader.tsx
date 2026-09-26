import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
import { FontFamily, IconSize, MIN_TOUCH, Spacing } from '@/theme';
import { Icon } from '@/components/ui';

type Props = {
  searchOpen: boolean;
  onToggleSearch: () => void;
};

/**
 * Đầu màn "Sản phẩm vay": nút quay lại, tiêu đề và nút mở/đóng ô tìm kiếm, nằm
 * thẳng trên nền sóng như mockup (không có thẻ nền).
 */
export default function ProductListHeader({ searchOpen, onToggleSearch }: Props) {
  const nav = useNavigation();
  // Mở từ nút "Vay" ở trang chủ thì stack Sàn chỉ có mỗi màn này; quay lại vẫn
  // được nhờ lịch sử tab, nên hỏi `canGoBack` của cả cây điều hướng.
  const canGoBack = nav.canGoBack();

  return (
    <View style={styles.row}>
      {canGoBack ? (
        <Pressable
          onPress={() => nav.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          style={({ pressed }) => [styles.iconButton, styles.back, pressed && styles.pressed]}
        >
          <Icon name="chevronLeft" size={IconSize.md} color={Colors.authInk} />
        </Pressable>
      ) : null}

      <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
        Sản phẩm vay
      </Text>

      <Pressable
        onPress={onToggleSearch}
        accessibilityRole="button"
        accessibilityLabel={searchOpen ? 'Đóng tìm kiếm' : 'Tìm sản phẩm theo tên'}
        accessibilityState={{ expanded: searchOpen }}
        style={({ pressed }) => [styles.iconButton, styles.search, pressed && styles.pressed]}
      >
        <Icon name={searchOpen ? 'x' : 'search'} size={IconSize.sm} color={Colors.authInk} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: MIN_TOUCH },
  iconButton: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Kéo hai nút ra sát lề để nét icon thẳng hàng với mép thẻ bên dưới; vùng chạm vẫn đủ 44pt.
  back: { marginLeft: -Spacing.md, marginRight: Spacing.xs },
  search: { marginRight: -Spacing.md },
  pressed: { opacity: 0.5 },
  title: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 26,
    color: Colors.authInk,
  },
});
