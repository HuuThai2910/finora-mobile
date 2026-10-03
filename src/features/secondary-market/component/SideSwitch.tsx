import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius } from '@/theme';
import type { OrderSide } from '@/types/orderBook';

const OPTIONS: ReadonlyArray<{ side: OrderSide; label: string; color: string; tint: string }> = [
  { side: 'BID', label: 'Mua', color: Colors.bookBid, tint: Colors.bookBidBar },
  { side: 'ASK', label: 'Bán', color: Colors.bookAsk, tint: Colors.bookAskBar },
];

/**
 * Chọn chiều lệnh. Ô đang chọn tô nhạt màu của chiều đó (mua xanh lá, bán đỏ), cùng sắc với vạch
 * khối lượng trong sổ lệnh, chữ đậm cùng màu; không đổ đặc để khối đỏ/xanh lá không lấn nút đặt
 * lệnh xanh dương bên dưới. Trạng thái chọn báo cho trình đọc màn hình bằng role radio.
 */
export default function SideSwitch({ value, onChange }: { value: OrderSide; onChange: (side: OrderSide) => void }) {
  return (
    <View style={styles.track} accessibilityRole="radiogroup" accessibilityLabel="Chiều lệnh">
      {OPTIONS.map(o => {
        const active = o.side === value;
        return (
          <Pressable
            key={o.side}
            onPress={() => onChange(o.side)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={o.label}
            style={({ pressed }) => [
              styles.option,
              active && { backgroundColor: o.tint },
              pressed && !active && styles.pressed,
            ]}
          >
            <Text style={[styles.label, { color: active ? o.color : Colors.authMuted }]} maxFontSizeMultiplier={1.3}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.authBorder,
  },
  option: {
    flex: 1,
    minHeight: MIN_TOUCH,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: Colors.tintBlue },
  label: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 22 },
});
