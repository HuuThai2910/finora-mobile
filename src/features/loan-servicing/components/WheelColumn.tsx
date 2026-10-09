import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, tabularNums } from '@/theme';

export type WheelItem = { value: number; label: string };

type Props = {
  /** Tên cột cho trình đọc màn hình: "Ngày", "Tháng", "Năm". */
  label: string;
  items: readonly WheelItem[];
  value: number;
  onChange: (value: number) => void;
};

/** Mỗi hàng cao 48pt (vùng chạm ≥ 44pt); ba hàng nhìn thấy, hàng giữa là giá trị đang chọn. */
export const WHEEL_ITEM_HEIGHT = 48;
export const WHEEL_VISIBLE_ROWS = 3;
const EDGE = (WHEEL_VISIBLE_ROWS - 1) / 2;
/** Ngừng cuộn chừng này thì coi như đã chọn; web không có sự kiện hết quán tính như iOS/Android. */
const SETTLE_MS = 120;

const clampIndex = (index: number, length: number) => Math.min(Math.max(index, 0), length - 1);

/**
 * Một cột của bộ chọn ngày kiểu bánh xe như mẫu Hải gửi: cuộn rồi dừng ở hàng nào thì chọn
 * hàng đó, chạm một hàng cũng chọn được. Giữ kiểu mặc định, không tô màu: hàng giữa chữ mực
 * nằm giữa hai vạch xám, các hàng khác chữ xám. Với trình đọc màn hình, cả cột là một nút
 * điều chỉnh (vuốt lên/xuống để tăng/giảm).
 */
export default function WheelColumn({ label, items, value, onChange }: Props) {
  const ref = useRef<ScrollView>(null);
  const selectedIndex = Math.max(0, items.findIndex(item => item.value === value));
  const [centerIndex, setCenterIndex] = useState(selectedIndex);
  const offset = useRef(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Hẹn giờ chốt giá trị đọc props mới nhất qua ref, không giữ bản cũ của lần vẽ trước.
  const latest = useRef({ items, value, onChange });
  latest.current = { items, value, onChange };

  const scrollToIndex = (index: number, animated: boolean) => {
    offset.current = index * WHEEL_ITEM_HEIGHT;
    ref.current?.scrollTo({ y: offset.current, animated });
  };

  // Giá trị đổi từ ngoài cột (mở bảng, ngày bị kéo về cuối tháng khi đổi tháng): cuộn tới đúng hàng.
  useEffect(() => {
    if (Math.round(offset.current / WHEEL_ITEM_HEIGHT) !== selectedIndex) scrollToIndex(selectedIndex, false);
    setCenterIndex(selectedIndex);
  }, [selectedIndex]);

  // Dọn hẹn giờ khi đóng bảng để không gọi onChange sau khi cột đã gỡ.
  useEffect(() => () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
  }, []);

  const settle = () => {
    const { items: list, value: current, onChange: emit } = latest.current;
    const index = clampIndex(Math.round(offset.current / WHEEL_ITEM_HEIGHT), list.length);
    if (Math.abs(offset.current - index * WHEEL_ITEM_HEIGHT) > 1) scrollToIndex(index, true);
    if (list[index].value !== current) emit(list[index].value);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    offset.current = event.nativeEvent.contentOffset.y;
    const index = clampIndex(Math.round(offset.current / WHEEL_ITEM_HEIGHT), items.length);
    if (index !== centerIndex) setCenterIndex(index);
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(settle, SETTLE_MS);
  };

  const step = (delta: 1 | -1) => {
    const index = clampIndex(selectedIndex + delta, items.length);
    if (index !== selectedIndex) onChange(items[index].value);
  };

  return (
    <View
      style={styles.column}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: items[selectedIndex]?.label ?? '' }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={event => step(event.nativeEvent.actionName === 'increment' ? 1 : -1)}
    >
      {/* Hai vạch kẹp hàng giữa, mỗi cột một cặp như mẫu; nằm dưới chữ, không nhận chạm. */}
      <View style={styles.band} pointerEvents="none" />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        // Lần dựng đầu: cuộn tới hàng đang chọn khi khung đã có kích thước.
        onLayout={() => scrollToIndex(selectedIndex, false)}
        contentContainerStyle={styles.content}
        nestedScrollEnabled
      >
        {items.map((item, index) => (
          <Pressable
            key={item.value}
            onPress={() => {
              scrollToIndex(index, true);
              if (item.value !== value) onChange(item.value);
            }}
            style={styles.item}
          >
            <Text style={[styles.text, index === centerIndex && styles.textSelected]} maxFontSizeMultiplier={1.2}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ROWS },
  // Đệm trên/dưới để hàng đầu và hàng cuối vẫn cuộn được vào giữa.
  content: { paddingVertical: WHEEL_ITEM_HEIGHT * EDGE },
  item: { height: WHEEL_ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  band: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: WHEEL_ITEM_HEIGHT * EDGE,
    height: WHEEL_ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.authControl,
  },
  // Không cho bôi chọn chữ: trên web kéo chuột qua các hàng sẽ tô xanh chữ thay vì chọn.
  text: { fontFamily: FontFamily.regular, fontSize: 17, lineHeight: 24, color: Colors.ink3, userSelect: 'none', ...tabularNums },
  textSelected: { fontFamily: FontFamily.medium, color: Colors.authInk },
});
