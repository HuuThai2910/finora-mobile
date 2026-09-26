import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/theme';
import type { ContractTerm } from '../mappers/contractSummary';

/**
 * Dưới bề rộng này (máy 360pt) ô icon và chữ nhỏ lại một bậc để "25/09/2026" và
 * "13,00%/năm" vẫn nằm trọn một dòng (đo bằng font thật: ~71pt ở cỡ 11).
 */
const COMPACT_BELOW = 380;
const SIZES = {
  regular: { tile: 22, icon: 13, gap: 5, label: 11, labelLine: 15, value: 12, valueLine: 17 },
  compact: { tile: 20, icon: 12, gap: 4, label: 10.5, labelLine: 14, value: 11, valueLine: 16 },
} as const;
/**
 * Ô đầu ("12 tháng") chỉ cần ~51pt chữ, hai ô sau cần ~78pt ("25/09/2026",
 * "13,00%/năm" ở 12pt, đo bằng font thật); chia đều thì hai ô sau bị bẻ giữa số.
 */
const FIRST_WEIGHT = 0.85;
const REST_WEIGHT = 1.075;
const MAX_FONT_SCALE = 1.3;

/**
 * Ba ô thông số dưới số tiền vay ở màn hợp đồng, đúng bố cục mockup: ô biểu
 * tượng bên trái, nhãn nhỏ ở trên, giá trị đậm ở dưới, ngăn bằng nét dọc mảnh.
 *
 * Khác `SummaryKeyTerms` (màn hồ sơ) ở chỗ không bao giờ đổi sang xếp dọc: giá
 * trị dài như "23:13 25/09/2026" xuống dòng ngay cạnh biểu tượng, còn biểu
 * tượng luôn đứng cùng hàng với chữ.
 */
export default function ContractKeyTerms({ terms }: { terms: readonly ContractTerm[] }) {
  const { width } = useWindowDimensions();
  const size = width < COMPACT_BELOW ? SIZES.compact : SIZES.regular;

  return (
    <View style={styles.row}>
      {terms.map((term, index) => (
        <View
          key={term.label}
          style={[
            styles.cell,
            { flex: index === 0 ? FIRST_WEIGHT : REST_WEIGHT },
            { gap: size.gap },
            index > 0 && styles.divided,
          ]}
          accessible
          accessibilityLabel={`${term.label}: ${term.value}${term.sub ? ` ${term.sub}` : ''}`}
        >
          <View style={[styles.tile, { width: size.tile, height: size.tile }]}>
            <Icon name={term.icon} size={size.icon} color={Colors.authPrimary} />
          </View>
          {term.sub ? (
            // Mốc thời gian: "Ký lúc 23:13" chung một dòng, ngày tháng năm dòng dưới.
            <View style={styles.text}>
              <Text
                style={[styles.label, { fontSize: size.label, lineHeight: size.valueLine }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {term.label}{' '}
                <Text style={[styles.value, { fontSize: size.value }]}>{term.value}</Text>
              </Text>
              <Text
                style={[styles.value, { fontSize: size.value, lineHeight: size.valueLine }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {term.sub}
              </Text>
            </View>
          ) : (
            <View style={styles.text}>
              <Text
                style={[styles.label, { fontSize: size.label, lineHeight: size.labelLine }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {term.label}
              </Text>
              <Text
                style={[styles.value, { fontSize: size.value, lineHeight: size.valueLine }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {/* Cho phép xuống dòng trước "/năm" thay vì bẻ giữa con số trên máy hẹp. */}
                {term.value.replace('%/', '%​/')}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch' },
  cell: { flexDirection: 'row', alignItems: 'flex-start', paddingRight: 4 },
  divided: {
    paddingLeft: 6,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: Colors.authBorder,
  },
  tile: {
    borderRadius: 7,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 0, gap: 1 },
  label: { fontFamily: FontFamily.regular, color: Colors.authMuted },
  value: { fontFamily: FontFamily.semibold, color: Colors.authInk },
});
