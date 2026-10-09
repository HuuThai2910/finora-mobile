import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, Radius, Spacing, tabularNums } from '@/theme';
import { formatLocalDate, formatRecentTime } from '@/utils/format';
import { rescheduleStatusLook, rescheduleTitle } from '../mappers/servicing';
import type { RescheduleRequest } from '../types';
import LoanStatusPill from './LoanStatusPill';

type Props = {
  request: RescheduleRequest;
  /** Ẩn nhãn trạng thái khi thẻ chứa đã in nhãn ở đầu thẻ. */
  hideStatus?: boolean;
};

/**
 * Nội dung một đề nghị cơ cấu: đề nghị gì, gửi lúc nào, áp dụng từ kỳ nào, lý do người vay
 * viết, rồi phản hồi của FINORA hoặc ngày đáo hạn mới khi đã áp dụng. Dùng cho cả đề nghị
 * đang xử lý và lịch sử đề nghị để hai nơi đọc giống nhau.
 */
export default function RescheduleRequestItem({ request, hideStatus = false }: Props) {
  const status = rescheduleStatusLook(request.status);
  const rejected = request.status === 'REJECTED';

  return (
    <View style={styles.item}>
      <View style={styles.top}>
        <Text style={styles.title} maxFontSizeMultiplier={1.4}>
          {rescheduleTitle(request)}
        </Text>
        {hideStatus ? null : <LoanStatusPill status={status} />}
      </View>

      {/* Không kẻ vạch giữa hai mục: máy hẹp xuống dòng thì vạch sẽ lơ lửng cuối dòng. */}
      <View style={styles.metaRow}>
        <Meta icon="clock" text={`Gửi ${formatRecentTime(request.createdAt).toLowerCase()}`} />
        <Meta icon="calendar" text={`Từ kỳ ${formatLocalDate(request.rescheduleFromDate)}`} />
      </View>

      <Text style={styles.reason} maxFontSizeMultiplier={1.4}>{`“${request.reasonComment}”`}</Text>

      {request.newMaturityDate ? (
        <Text style={styles.outcome} maxFontSizeMultiplier={1.4}>
          {`Ngày đáo hạn mới ${formatLocalDate(request.newMaturityDate)}`}
        </Text>
      ) : null}

      {request.decisionComment ? (
        <View style={[styles.reply, rejected && styles.replyRejected]}>
          <Text style={[styles.replyLabel, rejected && styles.replyLabelRejected]}>Phản hồi của FINORA</Text>
          <Text style={styles.replyText} maxFontSizeMultiplier={1.4}>
            {request.decisionComment}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Meta({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.meta}>
      <Icon name={icon} size={14} color={Colors.authMuted} />
      <Text style={styles.metaText} maxFontSizeMultiplier={1.4}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { gap: Spacing.sm },
  top: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: Spacing.sm,
    rowGap: Spacing.xs,
  },
  title: { flexShrink: 1, fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 21, color: Colors.authInk },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 14, rowGap: Spacing.xs },
  meta: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: {
    flexShrink: 1,
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.authMuted,
    ...tabularNums,
  },
  reason: { fontFamily: FontFamily.regular, fontSize: 13.5, lineHeight: 20, color: Colors.authLabel },
  outcome: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 19, color: Colors.tagGreenText },
  reply: { gap: 2, padding: Spacing.md, borderRadius: Radius.sm, backgroundColor: Colors.scheduleTile },
  replyRejected: { backgroundColor: Colors.redBg },
  replyLabel: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  // Chữ xám chỉ đạt ~4,4:1 trên nền đỏ nhạt nên nhãn phản hồi từ chối dùng chữ đỏ đậm.
  replyLabelRejected: { color: Colors.tagRedText },
  replyText: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authInk },
});
