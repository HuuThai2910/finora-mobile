import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/theme';
import { APPLICATION_LIST_PADDING } from '../constant';
type FilterChip<K extends string> = { key: K; label: string; count: number };

type Props<K extends string> = {
  chips: readonly FilterChip<K>[];
  selected: K;
  onSelect: (key: K) => void;
  /** Danh từ đếm trong nhãn đọc ("3 hồ sơ", "2 hợp đồng"); dùng chung cho màn hợp đồng. */
  noun?: string;
};

/** Chip cao 34pt như mockup; nới vùng chạm theo chiều dọc cho đủ 44pt. */
const CHIP_HEIGHT = 34;
const TOUCH_SLOP = 5;

/**
 * Hàng chip lọc theo nhóm trạng thái, cuộn ngang tràn sát hai mép màn. Chỉ chọn
 * được một nhóm nên đọc như nhóm nút radio; chip đang chọn phân biệt bằng nền
 * đặc (khác hẳn chip viền mảnh) chứ không chỉ bằng màu chữ.
 */
export default function ApplicationFilterChips<K extends string>({
  chips,
  selected,
  onSelect,
  noun = 'hồ sơ',
}: Props<K>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
      contentContainerStyle={styles.row}
      accessibilityRole="radiogroup"
      accessibilityLabel={`Lọc ${noun} theo trạng thái`}
    >
      {chips.map(chip => {
        const active = chip.key === selected;
        return (
          <Pressable
            key={chip.key}
            onPress={() => onSelect(chip.key)}
            hitSlop={{ top: TOUCH_SLOP, bottom: TOUCH_SLOP }}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={`${chip.label}, ${chip.count} ${noun}`}
            style={({ pressed }) => [
              styles.chip,
              active ? styles.chipActive : styles.chipIdle,
              pressed && !active && styles.pressed,
            ]}
          >
            <Text
              style={[styles.label, active ? styles.labelActive : styles.labelIdle]}
              maxFontSizeMultiplier={1.4}
            >
              {`${chip.label} (${chip.count})`}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Tràn ra hai mép để chip cuộn khuất dưới mép màn chứ không bị cắt ở lề 16pt.
  scroller: { flexGrow: 0, marginHorizontal: -APPLICATION_LIST_PADDING },
  // Đệm dọc giữ vùng chạm nới thêm nằm trong khung cuộn (khung cuộn cắt phần tràn).
  row: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: APPLICATION_LIST_PADDING,
    paddingVertical: TOUCH_SLOP,
  },
  chip: {
    minHeight: CHIP_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipIdle: { backgroundColor: Colors.card, borderColor: Colors.authBorder },
  chipActive: { backgroundColor: Colors.authPrimary, borderColor: Colors.authPrimary },
  pressed: { opacity: 0.6 },
  // Cùng độ đậm ở hai trạng thái để chip không đổi bề rộng (cả hàng xô lệch) khi chọn.
  label: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 18 },
  labelIdle: { color: Colors.authInk },
  labelActive: { color: Colors.onDark },
});
