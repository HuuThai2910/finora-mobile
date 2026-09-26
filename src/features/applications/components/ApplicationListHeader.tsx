import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Skeleton } from '@/components/feedback';
import { Icon, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, Spacing } from '@/theme';
import { APPLICATIONS_BACKGROUND, APPLICATION_LIST_PADDING } from '../constant';
import type { StageChip, StageFilter } from '../mappers/applicationStage';
import ApplicationFilterChips from './ApplicationFilterChips';
import { ApplicationsTopArt } from './ApplicationsBackdrop';

type Props = {
  /** Bề rộng cột nội dung (đã giới hạn trên web). */
  width: number;
  topInset: number;
  /** Tổng số hồ sơ theo Loan Service; `null` khi chưa có số liệu (đang tải, lỗi). */
  total: number | null;
  loading: boolean;
  /** `null` khi không có gì để lọc (đang tải, lỗi, chưa có hồ sơ). */
  chips: readonly StageChip[] | null;
  selected: StageFilter;
  onSelect: (key: StageFilter) => void;
  contractStatusUnavailable: boolean;
};

const TOP_GAP = Spacing.xs;
/** Khoảng trống tối thiểu giữa khối chữ và mép trái hình minh hoạ. */
const TITLE_GAP = Spacing.md;
const CHIP_SKELETON_WIDTHS = [88, 76, 132] as const;

/**
 * Đầu màn "Hồ sơ vay" nằm thẳng trên nền sóng: nút quay lại, tiêu đề + tổng số
 * hồ sơ bên trái hình minh hoạ, rồi hàng chip lọc và cảnh báo trạng thái hợp đồng.
 */
export default function ApplicationListHeader({
  width,
  topInset,
  total,
  loading,
  chips,
  selected,
  onSelect,
  contractStatusUnavailable,
}: Props) {
  const nav = useNavigation();
  // Mở từ lối tắt ở trang chủ thì stack Hồ sơ có thể chỉ có màn này; quay lại vẫn
  // được nhờ lịch sử tab, nên hỏi `canGoBack` của cả cây điều hướng.
  const canGoBack = nav.canGoBack();

  const scale = width / APPLICATIONS_BACKGROUND.width;
  // Khối chữ dừng trước mép trái hình minh hoạ; chữ phóng to theo cỡ chữ hệ thống
  // thì xuống dòng chứ không đè lên hình.
  const titleMaxWidth =
    APPLICATIONS_BACKGROUND.illustrationLeft * scale - APPLICATION_LIST_PADDING - TITLE_GAP;
  // Đầu trang cao ít nhất tới mép dưới hình minh hoạ để hàng chip không đè lên huy hiệu.
  const heroMinHeight = APPLICATIONS_BACKGROUND.illustrationBottom * scale - TOP_GAP;

  return (
    <View style={[styles.root, { paddingTop: topInset + TOP_GAP }]}>
      <ApplicationsTopArt width={width} topInset={topInset} />

      <View
        style={[
          styles.hero,
          { minHeight: heroMinHeight, justifyContent: canGoBack ? 'space-between' : 'flex-end' },
        ]}
      >
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

        <View style={[styles.titleBlock, { maxWidth: titleMaxWidth }]}>
          <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.6}>
            Hồ sơ vay
          </Text>
          {total !== null ? (
            <Text style={styles.subtitle}>{`Tổng cộng ${total} hồ sơ`}</Text>
          ) : loading ? (
            <Skeleton width={112} height={14} style={styles.subtitleSkeleton} />
          ) : null}
        </View>
      </View>

      {chips ? (
        <View style={styles.chips}>
          <ApplicationFilterChips chips={chips} selected={selected} onSelect={onSelect} />
        </View>
      ) : loading ? (
        // Giữ chỗ hàng chip lúc tải lần đầu để thẻ không bị đẩy xuống khi dữ liệu về.
        <View style={[styles.chips, styles.chipSkeletons]}>
          {CHIP_SKELETON_WIDTHS.map(chipWidth => (
            <Skeleton key={chipWidth} width={chipWidth} height={34} radius={Radius.pill} />
          ))}
        </View>
      ) : null}

      {contractStatusUnavailable ? (
        <InfoNote tone="warn" style={styles.note}>
          Chưa tải được trạng thái hợp đồng mới nhất. Kéo xuống để thử lại.
        </InfoNote>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Tràn ra hai mép cột để ảnh nền phủ trọn bề rộng; chữ vẫn giữ lề 16pt.
  root: {
    marginHorizontal: -APPLICATION_LIST_PADDING,
    paddingHorizontal: APPLICATION_LIST_PADDING,
    marginBottom: Spacing.xl,
    overflow: 'visible',
  },
  hero: { alignItems: 'flex-start' },
  // Kéo nút sát lề để nét mũi tên gần thẳng hàng với tiêu đề; vùng chạm vẫn đủ 44pt.
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: -14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  titleBlock: { gap: 2 },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: -0.3,
    color: Colors.authInk,
  },
  // Dòng phụ nằm trên dải sóng: `authMuted` chỉ đạt ~4,1:1 ở điểm sóng đậm nhất
  // (dưới mức AA 4,5:1), `ink2` vẫn là chữ phụ nhưng giữ ≥ 5,5:1 (đo bằng PIL).
  subtitle: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.ink2 },
  subtitleSkeleton: { marginTop: 3 },
  chips: { marginTop: Spacing.md },
  // Cùng khung với hàng chip thật: đệm dọc 5pt quanh chip cao 34pt.
  chipSkeletons: { flexDirection: 'row', gap: Spacing.md, paddingVertical: 5, overflow: 'hidden' },
  note: { marginTop: Spacing.md },
});
