import { useContext } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/theme';
import { MARKET_MAX_WIDTH, MARKET_PADDING } from '../constant';

type Props = {
  label: string;
  onPress: () => void;
  disabled: boolean;
  /** Đang gửi lệnh: vòng xoay thay chữ và khoá nút để không bấm lặp. */
  loading: boolean;
};

/** Dải mờ phủ lên phần cuối vùng cuộn ngay trên nút. */
const FADE_HEIGHT = 24;
/** Cao 48pt như nút chính của các màn đã vẽ lại. */
const BUTTON_HEIGHT = 48;

/**
 * Nút đặt lệnh ghim đáy, cùng cách làm vùng nút của form đặt lệnh chợ Notes: nằm ngay dưới vùng
 * cuộn (không nổi đè) để bàn phím mở thì vùng cuộn tự chừa chỗ, nội dung cuộn tới sát nút thì mờ
 * dần vào lớp phủ. Trong tab đã có thanh tab chừa vạch home nên không cộng vùng an toàn đáy nữa.
 */
export default function InvestBar({ label, onPress, disabled, loading }: Props) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext);
  const bottomInset = tabBarHeight === undefined ? insets.bottom : 0;
  const inactive = disabled || loading;

  return (
    <View style={[styles.bar, { paddingBottom: bottomInset + Spacing.lg }]}>
      <LinearGradient colors={[Colors.productsBackdropClear, Colors.loanFooterVeil]} style={styles.fadeAbove} />
      <LinearGradient colors={[Colors.loanFooterVeil, Colors.productsBackdropClear]} style={styles.fadeBehind} />
      <Pressable
        onPress={onPress}
        disabled={inactive}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: inactive, busy: loading }}
        android_ripple={{ color: Colors.onDarkFaint }}
        style={({ pressed }) => [styles.button, pressed && styles.pressed, inactive && styles.inactive]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.onDark} />
        ) : (
          <Text style={styles.label} maxFontSizeMultiplier={1.3}>{label}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { alignItems: 'center', paddingHorizontal: MARKET_PADDING, paddingTop: Spacing.md },
  // Hai dải chỉ để nhìn; không nhận chạm để vẫn cuộn/bấm được nội dung phía dưới.
  fadeAbove: { position: 'absolute', left: 0, right: 0, top: -FADE_HEIGHT, height: FADE_HEIGHT, pointerEvents: 'none' },
  fadeBehind: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'none' },
  // Trên web rộng, nút chỉ dài bằng cột nội dung chứ không trải hết cửa sổ.
  button: {
    width: '100%',
    maxWidth: MARKET_MAX_WIDTH - MARKET_PADDING * 2,
    minHeight: BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.pill,
    backgroundColor: Colors.authPrimary,
  },
  pressed: { opacity: 0.85 },
  inactive: { opacity: 0.45 },
  label: { fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 22, color: Colors.onDark },
});
