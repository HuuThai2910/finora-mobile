import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';
import { BOOK_PADDING } from '../constant';

/** Dải mờ phủ lên phần cuối vùng cuộn ngay trên các nút. */
const FADE_HEIGHT = 24;

/**
 * Vùng ghim đáy chứa nút chính của các màn chợ Notes, cùng cách làm vùng nút của luồng vay: nằm
 * ngay dưới vùng cuộn (không nổi đè) để bàn phím mở thì vùng cuộn tự chừa chỗ; nội dung cuộn tới
 * sát nút thì mờ dần vào lớp phủ.
 *
 * Trong tab đã có thanh tab chừa vạch home, nên không cộng vùng an toàn đáy lần nữa.
 */
export default function PinnedBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext);
  const bottomInset = tabBarHeight === undefined ? insets.bottom : 0;

  return (
    <View style={[styles.bar, { paddingBottom: bottomInset + Spacing.lg }]}>
      <LinearGradient colors={[Colors.productsBackdropClear, Colors.loanFooterVeil]} style={styles.fadeAbove} />
      <LinearGradient colors={[Colors.loanFooterVeil, Colors.productsBackdropClear]} style={styles.fadeBehind} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: BOOK_PADDING, paddingTop: Spacing.md },
  // Hai dải chỉ để nhìn; không nhận chạm để vẫn cuộn/bấm được nội dung phía dưới.
  fadeAbove: { position: 'absolute', left: 0, right: 0, top: -FADE_HEIGHT, height: FADE_HEIGHT, pointerEvents: 'none' },
  fadeBehind: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'none' },
});
