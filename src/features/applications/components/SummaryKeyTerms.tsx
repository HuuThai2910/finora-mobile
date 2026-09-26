import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/theme';
import type { KeyTerm } from '../mappers/applicationSummary';

/**
 * Ô biểu tượng nhỏ hơn mockup (~31pt) vài pt: Be Vietnam Pro rộng hơn font của
 * mockup, ô 26pt để cả ba nhãn dài nhất hiện có ("Lãi suất đề nghị", "Lãi suất
 * cơ sở") vẫn nằm ngang một dòng ở màn 393pt.
 */
const TILE = 26;
const GAP = 6;
/** Lề hai bên nét ngăn giữa các ô, hẹp hơn khe biểu tượng–chữ vì nét ngăn đã tách ô. */
const DIVIDER_SPACE = 5;
const MAX_FONT_SCALE = 1.3;
const VALUE_LINE = 18;
const LABEL_LINE = 15;
/**
 * Khối chữ một ô cao đúng hai dòng (giá trị + nhãn) khi không xuống dòng; mỗi
 * dòng thêm cao ít nhất 15pt, nên lấy ngưỡng ở giữa để sai số làm tròn không
 * bị đánh nhầm là xuống dòng.
 */
const WRAP_THRESHOLD = VALUE_LINE + LABEL_LINE + 7;

/**
 * Dải ba thông số dưới số tiền vay: ô biểu tượng xanh nhạt, giá trị đậm, nhãn
 * nhỏ, ngăn bằng nét dọc mảnh.
 *
 * Thử bố cục ngang của mockup trước. Be Vietnam Pro rộng hơn font trong mockup
 * nên trên máy hẹp, khi chữ phóng to hoặc nhãn dài ("Lãi suất đề nghị"), chữ sẽ
 * xuống dòng giữa chừng ("12 / tháng"); khi đo thấy vậy thì cả dải chuyển sang ô
 * xếp dọc (biểu tượng trên, chữ dưới). Ghi nhớ theo bề rộng và cỡ chữ để xoay
 * máy hay đổi cỡ chữ thì được thử lại bố cục ngang.
 */
export default function SummaryKeyTerms({ terms }: { terms: readonly KeyTerm[] }) {
  const { width, fontScale } = useWindowDimensions();
  const layoutKey = `${Math.round(width)}@${fontScale}`;
  const [stackedFor, setStackedFor] = useState<string | null>(null);
  const stacked = stackedFor === layoutKey;

  const checkWrap = (event: LayoutChangeEvent) => {
    // Chiều cao dòng co giãn cùng cỡ chữ hệ thống (kể cả khi nhỏ hơn mặc định), tối đa MAX_FONT_SCALE.
    const scale = Math.min(fontScale, MAX_FONT_SCALE);
    if (event.nativeEvent.layout.height > WRAP_THRESHOLD * scale) setStackedFor(layoutKey);
  };

  return (
    <View style={styles.row}>
      {terms.map((term, index) => (
        <View
          key={term.label}
          style={[
            stacked ? styles.cellStacked : styles.cell,
            index > 0 && styles.divided,
            index < terms.length - 1 && styles.beforeDivider,
          ]}
          accessible
          accessibilityLabel={`${term.label}: ${term.value}`}
        >
          <View style={styles.tile}>
            <Icon name={term.icon} size={14} color={Colors.authPrimary} />
          </View>
          <View style={stacked ? null : styles.text} onLayout={stacked ? undefined : checkWrap}>
            <Text style={styles.value} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {term.value}
            </Text>
            <Text style={styles.label} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {term.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch' },
  // Ngang: mỗi ô rộng theo nội dung rồi chia đều phần dư.
  cell: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP,
  },
  // Dọc: ba ô rộng bằng nhau, chữ vẫn xuống dòng được nếu cỡ chữ rất lớn.
  cellStacked: { flex: 1, gap: GAP },
  divided: {
    paddingLeft: DIVIDER_SPACE,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: Colors.authBorder,
  },
  beforeDivider: { paddingRight: DIVIDER_SPACE },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 8,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flexShrink: 1, minWidth: 0 },
  value: {
    fontFamily: FontFamily.semibold,
    fontSize: 13,
    lineHeight: VALUE_LINE,
    color: Colors.authInk,
  },
  label: { fontFamily: FontFamily.regular, fontSize: 11, lineHeight: LABEL_LINE, color: Colors.authMuted },
});
