import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import Icon from '@/components/ui/Icon';
import { IconSize, MIN_TOUCH, Radius, Spacing, Text_ } from '@/theme';
import type { TagTone } from '@/components/ui';
import type { StatusMeta } from '../constant';

const TONES: Record<TagTone, { bg: string; border: string; fg: string; icon: string }> = {
  green: { bg: Colors.greenBg, border: Colors.tagGreenBorder, fg: Colors.tagGreenText, icon: Colors.emerald },
  red: { bg: Colors.redBg, border: Colors.tagRedBorder, fg: Colors.tagRedText, icon: Colors.red },
  amber: { bg: Colors.amberBg, border: Colors.tagAmberBorder, fg: Colors.tagAmberText, icon: Colors.amber },
  blue: { bg: Colors.blueBg, border: Colors.tagBlueBorder, fg: Colors.tagBlueText, icon: Colors.brand },
  violet: { bg: Colors.violetBg, border: Colors.tagVioletBorder, fg: Colors.tagVioletText, icon: Colors.violet },
  gray: { bg: Colors.grayBg, border: Colors.tagGrayBorder, fg: Colors.tagGrayText, icon: Colors.ink2 },
};

/** Màu chữ của một tông trạng thái, để phần `highlight` khớp với khối chứa nó. */
export function statusToneColor(tone: TagTone): string {
  return TONES[tone].fg;
}

type Props = {
  status: StatusMeta;
  /** Dòng nhấn mạnh dưới phần trạng thái, ví dụ đồng hồ đếm ngược hạn ký. */
  highlight?: React.ReactNode;
  /** Nút hành động chính của trạng thái hiện tại. */
  action?: React.ReactNode;
};

/**
 * Khối trạng thái đứng đầu màn chi tiết. Thay cho thẻ hero căn giữa cũ vốn chỉ
 * lặp lại số tiền: người vay mở màn này để biết hồ sơ/hợp đồng đang ở đâu và
 * phải làm gì tiếp, nên ba thông tin đó được đặt cao nhất.
 * Trạng thái đọc được bằng chữ và biểu tượng, không chỉ bằng màu nền.
 */
export default function StatusBanner({ status, highlight, action }: Props) {
  const tone = TONES[status.tone];

  return (
    <View style={[styles.box, { backgroundColor: tone.bg, borderColor: tone.border }]}>
      <View style={styles.head}>
        <View style={[styles.badge, { borderColor: tone.border }]}>
          <Icon name={status.icon} size={IconSize.sm} color={tone.icon} />
        </View>
        <View style={styles.headText}>
          <Text style={[styles.label, { color: tone.fg }]} accessibilityRole="header">
            {status.label}
          </Text>
          <Text style={[styles.meaning, { color: tone.fg }]}>{status.meaning}</Text>
        </View>
      </View>

      {highlight ? <View style={[styles.divided, { borderTopColor: tone.border }]}>{highlight}</View> : null}

      {status.next ? (
        <View style={[styles.divided, { borderTopColor: tone.border }]}>
          <Text style={[styles.nextLabel, { color: tone.fg }]}>BƯỚC TIẾP THEO</Text>
          <Text style={[styles.nextValue, { color: tone.fg }]}>{status.next}</Text>
        </View>
      ) : null}

      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.xxl, gap: Spacing.xl },
  head: { flexDirection: 'row', gap: Spacing.xl, alignItems: 'flex-start' },
  badge: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: Radius.pill,
    borderWidth: 1,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: { flex: 1, gap: Spacing.xs },
  label: { ...Text_.heading },
  meaning: { ...Text_.micro, opacity: 0.9 },
  divided: { borderTopWidth: 1, paddingTop: Spacing.lg, gap: Spacing.xs },
  nextLabel: { ...Text_.sectionLabel, fontSize: 12, opacity: 0.72 },
  nextValue: { ...Text_.bodyBold },
  action: { gap: Spacing.md },
});
