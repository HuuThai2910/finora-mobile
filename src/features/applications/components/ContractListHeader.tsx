import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Skeleton } from '@/components/feedback';
import { Icon } from '@/components/ui';
import { CONTRACTS_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, Spacing } from '@/theme';
import { APPLICATION_LIST_PADDING, CONTRACT_LIST_ART } from '../constant';
import type { ContractChip, ContractFilter } from '../mappers/contractCard';
import ApplicationFilterChips from './ApplicationFilterChips';

type Props = {
  /** Bề rộng cột nội dung (đã giới hạn trên web); ảnh nền phóng theo bề rộng này. */
  width: number;
  topInset: number;
  loading: boolean;
  /** `null` khi không có gì để lọc (đang tải, lỗi, chưa có hợp đồng). */
  chips: readonly ContractChip[] | null;
  selected: ContractFilter;
  onSelect: (key: ContractFilter) => void;
};

const TOP_GAP = Spacing.xs;
/** Kéo nút quay lại sát lề để mũi tên gần thẳng hàng mép thẻ; vùng chạm vẫn đủ 44pt. */
const BACK_PULL = 12;
/** Chừa giữa chữ tiêu đề và mép trái linh vật. */
const TITLE_GAP = Spacing.xs;
/** Đệm dọc của hàng chip (vùng chạm nới thêm) — trừ ra để viền chip, không phải khung, chạm mốc. */
const CHIP_ROW_PAD = 5;
const CHIP_SKELETON_WIDTHS = [84, 78, 104] as const;

/**
 * Đầu màn "Hợp đồng của tôi": nút quay lại cùng hàng tiêu đề ở góc trái, hình
 * linh vật (thuộc ảnh nền) ở góc phải, rồi hàng chip lọc ngay dưới hình.
 */
export default function ContractListHeader({ width, topInset, loading, chips, selected, onSelect }: Props) {
  const nav = useNavigation();
  const canGoBack = nav.canGoBack();

  const scale = width / CONTRACTS_WAVES.width;
  const top = topInset + TOP_GAP;
  const titleLeft = APPLICATION_LIST_PADDING + (canGoBack ? MIN_TOUCH - BACK_PULL : 0);
  // Máy có tai thỏ đẩy hàng tiêu đề xuống ngang đầu linh vật: khi đó chữ (nhất là
  // chữ phóng to) xuống dòng trước mép hình chứ không đè lên. Hàng tiêu đề nằm
  // trọn phía trên hình thì để chữ dùng hết bề ngang.
  const besideArt = top + MIN_TOUCH > CONTRACT_LIST_ART.top * scale;
  const titleMaxWidth = besideArt
    ? CONTRACT_LIST_ART.titleLimit * scale - titleLeft - TITLE_GAP
    : undefined;
  // Ảnh nằm sát mép trên màn (không lùi theo vùng an toàn), nên trừ phần đệm trên.
  const heroMinHeight = CONTRACT_LIST_ART.bottom * scale - top - CHIP_ROW_PAD;

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <View style={[styles.hero, { minHeight: heroMinHeight }]}>
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
          Hợp đồng của tôi
        </Text>
      </View>

      {chips ? (
        <ApplicationFilterChips chips={chips} selected={selected} onSelect={onSelect} noun="hợp đồng" />
      ) : loading ? (
        // Giữ chỗ hàng chip lúc tải lần đầu để thẻ không bị đẩy xuống khi dữ liệu về.
        <View style={styles.chipSkeletons}>
          {CHIP_SKELETON_WIDTHS.map(chipWidth => (
            <Skeleton key={chipWidth} width={chipWidth} height={34} radius={Radius.pill} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginBottom: Spacing.md },
  hero: { flexDirection: 'row', alignItems: 'flex-start' },
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: -BACK_PULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  // 20pt: cả câu (~175pt) vừa trước đầu linh vật trên máy 393pt có tai thỏ; dòng
  // cao 44pt để chữ canh giữa nút quay lại.
  title: {
    flexShrink: 1,
    paddingVertical: 8,
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: Colors.authInk,
  },
  // Cùng khung với hàng chip thật: đệm dọc 5pt quanh chip cao 34pt.
  chipSkeletons: { flexDirection: 'row', gap: Spacing.md, paddingVertical: CHIP_ROW_PAD, overflow: 'hidden' },
});
