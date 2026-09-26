import type { Step } from '@/components/phone';
import type { TagTone } from '@/components/ui';
import type { LoanApplicationStatus } from '@/types/loan';
import { applicationStatusMeta } from './statusMeta';

/** Cách vẽ một mốc: đã qua, đang ở, sắp tới, hoặc dừng hẳn mà không thành. */
export type TimelineMark = 'done' | 'current' | 'upcoming' | 'stopped';

export type TimelineEntry = {
  key: string;
  title: string;
  detail: string | null;
  mark: TimelineMark;
  /** Tông của mốc dừng (đỏ khi bị từ chối, xám khi đã rút); mốc khác để `null`. */
  stopTone: TagTone | null;
};

/** Trạng thái khép lại mà không thành: mốc cuối không được mang dấu ✓ như mốc đã qua. */
const STOPPED_STATUSES: readonly LoanApplicationStatus[] = ['REJECTED', 'WITHDRAWN'];

const MARKS: Record<Step['state'], TimelineMark> = {
  done: 'done',
  doing: 'current',
  todo: 'upcoming',
};

/**
 * Chuyển dòng thời gian của `buildApplicationTimeline` sang cách vẽ của màn chi
 * tiết. Mapper gốc coi mọi mốc của hồ sơ đã kết thúc là "đã xong"; với hồ sơ bị
 * từ chối hoặc đã rút, mốc cuối (lịch sử đã sắp theo thời gian) chính là lần
 * chuyển sang trạng thái đó nên được đánh dấu dừng. Đối chiếu đúng nhãn trạng
 * thái để không đánh nhầm khi trang lịch sử thiếu mốc cuối.
 */
export function toTimelineEntries(
  steps: readonly Step[],
  status: LoanApplicationStatus,
): TimelineEntry[] {
  const meta = applicationStatusMeta(status);
  const stopped = STOPPED_STATUSES.includes(status);

  return steps.map((step, index) => {
    const isStop =
      stopped && index === steps.length - 1 && step.state === 'done' && step.title === meta.label;
    return {
      key: step.id ?? `${index}-${step.title}`,
      title: step.title,
      detail: step.detail ?? null,
      mark: isStop ? 'stopped' : MARKS[step.state],
      stopTone: isStop ? meta.tone : null,
    };
  });
}
