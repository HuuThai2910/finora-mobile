import { StyleSheet, Text, View } from 'react-native';
import type { Step } from '@/components/phone';
import { Icon, type TagTone } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';
import {
  toTimelineEntries,
  type TimelineEntry,
  type TimelineMark,
  type TimelineStop,
} from '../mappers/detailTimeline';
import DetailCard from './DetailCard';

const DOT = 22;

/** Màu mốc dừng theo tông trạng thái: bị từ chối đỏ, đã rút xám. */
const STOP_COLORS: Partial<Record<TagTone, string>> = { red: Colors.red, gray: Colors.ink2 };

const STATE_TEXT: Record<TimelineMark, string> = {
  done: 'đã xong',
  current: 'đang xử lý',
  upcoming: 'chưa tới',
  stopped: 'đã dừng',
};

type Props = {
  /** Tiêu đề thẻ: hồ sơ và hợp đồng dùng chung cách vẽ, khác tên gọi. */
  title?: string;
  steps: readonly Step[];
  /** Hành trình dừng không thành thì mốc cuối vẽ dấu ✕ (xem `applicationTimelineStop`). */
  stop: TimelineStop | null;
  /** Lịch sử tải lỗi chỉ báo trong thẻ này, không chặn phần còn lại của màn. */
  failed: boolean;
};

/**
 * "Tiến trình xử lý hồ sơ" (mockup 26/09/2026): mốc đã qua là vòng xanh có dấu
 * tích nối bằng nét mảnh. Mỗi loại mốc khác nhau cả ở hình dạng (✓ đặc, vòng có
 * chấm, vòng rỗng, ✕ đặc) và nhãn đọc, không chỉ ở màu.
 */
export default function ApplicationTimelineCard({
  title = 'Tiến trình xử lý hồ sơ',
  steps,
  stop,
  failed,
}: Props) {
  const entries = toTimelineEntries(steps, stop);

  return (
    <DetailCard title={title} icon="clock">
      {failed ? (
        <Notice text="Chưa tải được tiến trình xử lý. Kéo xuống để tải lại; các thông tin khác vẫn dùng được." />
      ) : entries.length === 0 ? (
        <Notice text="Chưa có mốc xử lý nào được ghi nhận." />
      ) : (
        <View>
          {entries.map((entry, index) => (
            <TimelineRow key={entry.key} entry={entry} index={index} next={entries[index + 1]} />
          ))}
        </View>
      )}
    </DetailCard>
  );
}

function TimelineRow({ entry, index, next }: { entry: TimelineEntry; index: number; next?: TimelineEntry }) {
  // Nét nối xanh chỉ khi mốc sau cũng đã tới (xong hoặc đang xử lý).
  const reached = next?.mark === 'done' || next?.mark === 'current';
  const detail = entry.detail ? `, ${entry.detail}` : '';

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Bước ${index + 1}, ${STATE_TEXT[entry.mark]}: ${entry.title}${detail}`}
    >
      <View style={styles.rail}>
        <Marker entry={entry} />
        {next ? <View style={[styles.line, reached ? styles.lineReached : styles.linePending]} /> : null}
      </View>
      <View style={[styles.body, next ? styles.bodySpaced : null]}>
        <Text style={[styles.title, entry.mark === 'upcoming' && styles.titleUpcoming]}>{entry.title}</Text>
        {entry.detail ? <Text style={styles.detail}>{entry.detail}</Text> : null}
      </View>
    </View>
  );
}

function Marker({ entry }: { entry: TimelineEntry }) {
  switch (entry.mark) {
    case 'done':
      return (
        <View style={[styles.dot, styles.dotDone]}>
          <Icon name="check" size={13} color={Colors.onDark} strokeWidth={3} />
        </View>
      );
    case 'current':
      return (
        <View style={[styles.dot, styles.dotCurrent]}>
          <View style={styles.dotCore} />
        </View>
      );
    case 'stopped': {
      const color = (entry.stopTone ? STOP_COLORS[entry.stopTone] : undefined) ?? Colors.authMuted;
      return (
        <View style={[styles.dot, { backgroundColor: color, borderColor: color }]}>
          <Icon name="x" size={13} color={Colors.onDark} strokeWidth={3} />
        </View>
      );
    }
    case 'upcoming':
      return <View style={[styles.dot, styles.dotUpcoming]} />;
  }
}

function Notice({ text }: { text: string }) {
  return (
    <View style={styles.notice} accessibilityLiveRegion="polite">
      <Icon name="info" size={16} color={Colors.authMuted} />
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.lg },
  rail: { width: DOT, alignItems: 'center' },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: Colors.emerald, borderColor: Colors.emerald },
  dotCurrent: { backgroundColor: Colors.card, borderColor: Colors.authPrimary },
  dotCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.authPrimary },
  dotUpcoming: { backgroundColor: Colors.card, borderColor: Colors.authControl },
  line: { flex: 1, width: 2, marginVertical: 2, borderRadius: 1 },
  lineReached: { backgroundColor: Colors.emerald },
  linePending: { backgroundColor: Colors.authBorder },
  body: { flex: 1, gap: 1, paddingTop: 1 },
  bodySpaced: { paddingBottom: Spacing.xl },
  title: { fontFamily: FontFamily.semibold, fontSize: 14.5, lineHeight: 20, color: Colors.authInk },
  titleUpcoming: { fontFamily: FontFamily.regular, color: Colors.authMuted },
  detail: { fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 18, color: Colors.authMuted },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
    backgroundColor: Colors.surfaceMuted,
  },
  noticeText: { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
});
