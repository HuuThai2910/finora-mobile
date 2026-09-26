import { StyleSheet, Text, View } from 'react-native';
import { Icon, type TagTone } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, Radius } from '@/theme';
import type { StatusMeta } from '../constant';

/** Cùng cặp nền/chữ với `Tag` và nhãn ở danh sách hồ sơ (đã đạt tương phản AA), không viền. */
const TONES: Record<TagTone, { bg: string; fg: string }> = {
  green: { bg: Colors.greenBg, fg: Colors.tagGreenText },
  red: { bg: Colors.redBg, fg: Colors.tagRedText },
  amber: { bg: Colors.amberBg, fg: Colors.tagAmberText },
  blue: { bg: Colors.blueBg, fg: Colors.tagBlueText },
  violet: { bg: Colors.violetBg, fg: Colors.tagVioletText },
  gray: { bg: Colors.grayBg, fg: Colors.tagGrayText },
};

/**
 * Mockup vẽ "Đã duyệt" bằng khiên có dấu tích; trạng thái thành công khác cùng
 * tông xanh lá và icon ✓ (như "Đã ký") dùng chung khiên đó. Dấu ✓/✕ của tông
 * khác vẽ trong vòng tròn như nhãn ở danh sách hồ sơ; còn lại giữ icon của bảng
 * trạng thái.
 */
function pillIcon(status: StatusMeta): IconName {
  if (status.icon === 'check') return status.tone === 'green' ? 'shieldCheck' : 'circleCheck';
  if (status.icon === 'x') return 'circleX';
  return status.icon;
}

/**
 * Nhãn trạng thái hành trình ở thẻ tóm tắt, to hơn nhãn trên thẻ danh sách. Tông
 * và chữ lấy nguyên từ `applicationJourneyStatus`; luôn kèm icon để màu không
 * phải tín hiệu duy nhất.
 */
export default function DetailStatusPill({ status }: { status: StatusMeta }) {
  const tone = TONES[status.tone];

  return (
    <View
      style={[styles.pill, { backgroundColor: tone.bg }]}
      accessible
      accessibilityLabel={`Trạng thái: ${status.label}`}
    >
      <Icon name={pillIcon(status)} size={16} color={tone.fg} strokeWidth={2.2} />
      <Text style={[styles.label, { color: tone.fg }]} maxFontSizeMultiplier={1.4}>
        {status.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 6,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: { flexShrink: 1, fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 18 },
});
