import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, LineHeight, MIN_TOUCH, Radius, Spacing, lh } from '@/theme';
import { Icon } from '@/components/ui';

type Props = {
  title: string;
  /** Bước đang đứng, đếm từ 1; bằng số đoạn được tô trên thanh tiến độ. */
  step: number;
  total: number;
  onBack: () => void;
};

/** Độ cao đoạn tiến độ, đo từ mockup (≈4pt). */
const SEGMENT_HEIGHT = 4;

/**
 * Đầu màn của luồng nhập khoản vay: nút quay lại, tiêu đề, "bước/tổng" và thanh
 * tiến độ chia đoạn, nằm thẳng trên nền sóng như mockup (không có thẻ nền).
 *
 * Dùng chung cho các bước nên không đọc navigation hay dữ liệu màn nào; màn tự
 * quyết định quay lại đi đâu qua `onBack`. Không thay `FormStepProgress` dùng
 * chung vì các màn chưa vẽ lại vẫn dùng nó.
 */
export default function LoanStepHeader({ title, step, total, onBack }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Icon name="chevronLeft" size={IconSize.sm} color={Colors.authInk} />
        </Pressable>

        {/* Không giới hạn số dòng: chữ phóng to thì tiêu đề xuống dòng chứ không bị cắt. */}
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>

        <Text style={styles.count} accessibilityLabel={`Bước ${step} trên ${total}`}>
          {step}/{total}
        </Text>
      </View>

      {/* Thanh chỉ vẽ lại con số "bước/tổng" ở trên (đã có nhãn đọc), nên không gắn vai trò riêng. */}
      <View style={styles.track}>
        {Array.from({ length: total }, (_, index) => (
          <View key={index} style={[styles.segment, index < step && styles.segmentDone]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, minHeight: MIN_TOUCH },
  // Kéo nút ra sát lề để nét mũi tên lệch trái mép nội dung vài pt như mockup;
  // vùng chạm vẫn đủ 44pt và vẫn nằm trong màn vì lề ngang lớn hơn phần kéo.
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: -Spacing.xxl,
    marginRight: -Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  // Cỡ 16 đo theo chiều cao chữ hoa của mockup (≈11,3pt), bằng cỡ nhãn các mục bên dưới.
  title: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body, LineHeight.heading),
    color: Colors.authInk,
  },
  count: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body, LineHeight.heading),
    color: Colors.authPrimary,
  },
  track: { flexDirection: 'row', gap: Spacing.sm },
  segment: {
    flex: 1,
    height: SEGMENT_HEIGHT,
    borderRadius: Radius.pill,
    backgroundColor: Colors.progressTrack,
  },
  segmentDone: { backgroundColor: Colors.authPrimary },
});
