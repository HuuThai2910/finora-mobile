import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';

type Props = {
  /** Thường là một `LoanPrimaryButton`. */
  children: React.ReactNode;
};

/** Dải mờ phủ lên phần cuối vùng cuộn ngay trên nút. */
const FADE_HEIGHT = 24;

/**
 * Vùng ghim đáy chứa nút chính của các bước nhập khoản vay, đặt ngay dưới vùng
 * cuộn (không nổi đè) để khi bàn phím mở, vùng cuộn tự chừa đúng chỗ cho nút.
 *
 * Nội dung cuộn tới sát nút thì mờ dần vào lớp phủ thay vì bị cắt thẳng; lớp phủ
 * nhạt dần xuống đáy nên sóng nền quanh nút vẫn lộ ra như mockup.
 *
 * Vùng an toàn đáy: trong tab (luôn có thanh tab bên dưới, thanh tab đã tự chừa
 * vạch home) thì không cộng thêm, tránh khoảng trống đôi; ra ngoài tab thì cộng.
 */
export default function LoanStepFooter({ children }: Props) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext);
  const bottomInset = tabBarHeight === undefined ? insets.bottom : 0;

  return (
    <View style={[styles.footer, { paddingBottom: bottomInset + Spacing.lg }]}>
      <LinearGradient
        colors={[Colors.productsBackdropClear, Colors.loanFooterVeil]}
        style={styles.fadeAbove}
      />
      <LinearGradient
        colors={[Colors.loanFooterVeil, Colors.productsBackdropClear]}
        style={styles.fadeBehind}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
  // Hai dải chỉ để nhìn; không nhận chạm để vẫn cuộn/bấm được nội dung phía dưới.
  fadeAbove: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -FADE_HEIGHT,
    height: FADE_HEIGHT,
    pointerEvents: 'none',
  },
  fadeBehind: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'none' },
});
