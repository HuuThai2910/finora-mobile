import { StyleSheet, Text, View } from 'react-native';
import { Icon, type TagTone } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius } from '@/theme';
import type { StatusLook } from '../mappers/servicing';

/** Cùng cặp nền/chữ với nhãn trạng thái ở các màn hồ sơ, hợp đồng (đã đạt tương phản AA), không viền. */
const TONES: Record<TagTone, { bg: string; fg: string }> = {
  green: { bg: Colors.greenBg, fg: Colors.tagGreenText },
  red: { bg: Colors.redBg, fg: Colors.tagRedText },
  amber: { bg: Colors.amberBg, fg: Colors.tagAmberText },
  blue: { bg: Colors.blueBg, fg: Colors.tagBlueText },
  violet: { bg: Colors.violetBg, fg: Colors.tagVioletText },
  gray: { bg: Colors.grayBg, fg: Colors.tagGrayText },
};

/** `sm` trên thẻ danh sách, `md` ở thẻ đầu màn chi tiết — cùng hai cỡ của màn hợp đồng. */
const SIZES = {
  sm: { icon: 12, font: 11, line: 16, gap: 3, padX: 7, padY: 3 },
  md: { icon: 16, font: 13, line: 18, gap: 6, padX: 10, padY: 4 },
} as const;

type Props = { status: StatusLook; size?: keyof typeof SIZES };

/** Nhãn trạng thái của khoản vay hoặc đề nghị cơ cấu; luôn kèm icon để màu không là tín hiệu duy nhất. */
export default function LoanStatusPill({ status, size = 'sm' }: Props) {
  const tone = TONES[status.tone] ?? TONES.gray;
  const s = SIZES[size];

  return (
    <View
      style={[styles.pill, { backgroundColor: tone.bg, gap: s.gap, paddingHorizontal: s.padX, paddingVertical: s.padY }]}
      accessible
      accessibilityLabel={`Trạng thái: ${status.label}`}
    >
      <Icon name={status.icon} size={s.icon} color={tone.fg} strokeWidth={2.2} />
      <Text style={[styles.label, { color: tone.fg, fontSize: s.font, lineHeight: s.line }]} maxFontSizeMultiplier={1.4}>
        {status.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, borderRadius: Radius.pill },
  label: { flexShrink: 1, fontFamily: FontFamily.semibold },
});
