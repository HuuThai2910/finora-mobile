import { StyleSheet, Text, View } from 'react-native';
import { Icon, type TagTone } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, Radius } from '@/theme';
import type { StatusMeta } from '../constant';

/** Cùng cặp nền/chữ với `Tag` (đã đạt tương phản AA), bỏ viền như viên nhãn của mockup. */
const TONES: Record<TagTone, { bg: string; fg: string }> = {
  green: { bg: Colors.greenBg, fg: Colors.tagGreenText },
  red: { bg: Colors.redBg, fg: Colors.tagRedText },
  amber: { bg: Colors.amberBg, fg: Colors.tagAmberText },
  blue: { bg: Colors.blueBg, fg: Colors.tagBlueText },
  violet: { bg: Colors.violetBg, fg: Colors.tagVioletText },
  gray: { bg: Colors.grayBg, fg: Colors.tagGrayText },
};

/** Mockup vẽ dấu ✓/✕ trong vòng tròn; các icon khác của bảng trạng thái giữ nguyên. */
const CIRCLED: Partial<Record<IconName, IconName>> = { check: 'circleCheck', x: 'circleX' };

/**
 * Nhãn trạng thái hành trình của hồ sơ. Luôn có icon kèm chữ để màu không phải
 * tín hiệu duy nhất; tông màu và nhãn lấy nguyên từ `applicationJourneyStatus`.
 */
export default function ApplicationStatusPill({ status }: { status: StatusMeta }) {
  const tone = TONES[status.tone] ?? TONES.gray;

  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
      <Icon name={CIRCLED[status.icon] ?? status.icon} size={12} color={tone.fg} strokeWidth={2.2} />
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
    gap: 3,
    borderRadius: Radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  label: { flexShrink: 1, fontFamily: FontFamily.semibold, fontSize: 11, lineHeight: 16 },
});
