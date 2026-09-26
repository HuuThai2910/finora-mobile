import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/ui';
import { WALLET_HISTORY_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing } from '@/theme';
import { WALLET_HISTORY_ART, WALLET_HISTORY_PADDING } from '../constant';

type Props = {
  /** Bề rộng cột nội dung (đã giới hạn trên web); ảnh nền phóng theo bề rộng này. */
  width: number;
  topInset: number;
};

const TOP_GAP = Spacing.xs;
/** Kéo nút quay lại sát lề để mũi tên gần thẳng hàng mép thẻ; vùng chạm vẫn đủ 44pt. */
const BACK_PULL = 12;
/** Chừa giữa chữ tiêu đề và mép trái hình minh hoạ. */
const TITLE_GAP = Spacing.xs;
/** Khoảng giữa chân linh vật và mép trên thẻ tài khoản. */
const GROUND_GAP = Spacing.xs;

/**
 * Biểu tượng thuần trang trí. `aria-hidden` được View của React Native đổi sang
 * cặp `accessibilityElementsHidden` / `importantForAccessibility` trên iOS/Android.
 */
const hiddenFromReader = { 'aria-hidden': true } as const;

/**
 * Đầu màn "Lịch sử ví": nút quay lại (khi có chỗ để về) cùng tiêu đề ở góc trái,
 * biểu tượng tải sao kê ở góc phải, hai linh vật (thuộc ảnh nền) phía dưới bên
 * phải. Khối này cao tới chân linh vật để thẻ tài khoản nằm ngay dưới hình.
 */
export default function WalletHistoryHeader({ width, topInset }: Props) {
  const nav = useNavigation();
  // Lịch sử ví là màn gốc của tab Ví; quay lại vẫn được nhờ lịch sử tab.
  const canGoBack = nav.canGoBack();

  const scale = width / WALLET_HISTORY_WAVES.width;
  const top = topInset + TOP_GAP;
  const titleLeft = WALLET_HISTORY_PADDING + (canGoBack ? MIN_TOUCH - BACK_PULL : 0);
  // Máy có tai thỏ đẩy hàng tiêu đề xuống ngang đầu linh vật: khi đó chữ phóng to
  // xuống dòng trước mép hình chứ không đè lên.
  const besideArt = top + MIN_TOUCH > WALLET_HISTORY_ART.top * scale;
  const titleMaxWidth = besideArt
    ? WALLET_HISTORY_ART.titleLimit * scale - titleLeft - TITLE_GAP
    : undefined;
  // Ảnh nằm sát mép trên màn (không lùi theo vùng an toàn), nên đo từ mép màn;
  // `minHeight` đã tính cả phần đệm trên. Máy có tai thỏ rất cao thì hàng tiêu đề
  // có thể xuống quá chân linh vật — khi đó khối cao theo hàng tiêu đề.
  const minHeight = Math.max(WALLET_HISTORY_ART.bottom * scale + GROUND_GAP, top + MIN_TOUCH);

  return (
    <View style={{ paddingTop: top, minHeight }}>
      <View style={styles.row}>
        {canGoBack ? (
          <Pressable
            onPress={() => nav.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Icon name="chevronLeft" size={26} color={Colors.authInk} strokeWidth={2.2} />
          </Pressable>
        ) : null}
        <Text
          style={[styles.title, { maxWidth: titleMaxWidth }]}
          accessibilityRole="header"
          maxFontSizeMultiplier={1.6}
        >
          Lịch sử ví
        </Text>
        {/* Chưa có API xuất sao kê: giữ biểu tượng như mockup nhưng không làm nút,
            tránh một nút bấm không làm gì. */}
        <View style={styles.download} {...hiddenFromReader}>
          <Icon name="download" size={24} color={Colors.authInk} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: -BACK_PULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  // Dòng cao 44pt (đệm 8 + 28) để chữ canh giữa nút quay lại và biểu tượng tải.
  title: {
    flexShrink: 1,
    paddingVertical: 8,
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: Colors.authInk,
  },
  download: {
    marginLeft: 'auto',
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
