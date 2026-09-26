import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, LineHeight, MIN_TOUCH, Spacing, lh } from '@/theme';
import { Icon } from '@/components/ui';

/**
 * Bậc "tiêu đề màn" của theme. Trong mockup tiêu đề này rộng đúng bằng tiêu đề
 * thẻ "THÔNG TIN CÁ NHÂN" (16pt chữ hoa); cỡ 18 giữ đúng tương quan đó.
 */
const TITLE_SIZE = FontSize.title;

/** Đầu màn "Thông tin tài khoản" nằm thẳng trên nền sóng (không có thẻ nền): nút quay lại và tiêu đề. */
export default function AccountInfoHeader() {
  const nav = useNavigation();
  // Mở thẳng bằng đường dẫn (tải lại trang trên web) thì không còn màn nào phía
  // sau: ẩn nút thay vì để một nút bấm không làm gì.
  const canGoBack = nav.canGoBack();

  return (
    <View style={styles.row}>
      {canGoBack ? (
        <Pressable
          onPress={() => nav.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Icon name="chevronLeft" size={IconSize.md} color={Colors.authInk} strokeWidth={2.2} />
        </Pressable>
      ) : null}

      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.6}>
        Thông tin tài khoản
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: MIN_TOUCH },
  // Kéo nút ra sát lề để nét mũi tên gần thẳng mép thẻ bên dưới; vùng chạm vẫn đủ 44pt.
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: -Spacing.md,
    marginRight: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  title: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: TITLE_SIZE,
    lineHeight: lh(TITLE_SIZE, LineHeight.heading),
    letterSpacing: -0.2,
    color: Colors.authInk,
  },
});
