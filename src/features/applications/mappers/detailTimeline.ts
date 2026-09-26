import type { Step } from '@/components/phone';
import type { TagTone } from '@/components/ui';
import type { LoanContractStatus } from '@/types/contract';
import type { LoanApplicationStatus } from '@/types/loan';
import { applicationStatusMeta, contractStatusMeta } from './statusMeta';

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

/**
 * Mốc cuối của một hành trình khép lại mà không thành (hồ sơ bị từ chối/đã rút,
 * hợp đồng bị từ chối/hết hạn): nhãn trạng thái để đối chiếu và tông để tô.
 */
export type TimelineStop = { label: string; tone: TagTone };

const STOPPED_APPLICATION: readonly LoanApplicationStatus[] = ['REJECTED', 'WITHDRAWN'];
const STOPPED_CONTRACT: readonly LoanContractStatus[] = ['DECLINED', 'EXPIRED'];

export function applicationTimelineStop(status: LoanApplicationStatus): TimelineStop | null {
  if (!STOPPED_APPLICATION.includes(status)) return null;
  const meta = applicationStatusMeta(status);
  return { label: meta.label, tone: meta.tone };
}

export function contractTimelineStop(status: LoanContractStatus): TimelineStop | null {
  if (!STOPPED_CONTRACT.includes(status)) return null;
  const meta = contractStatusMeta(status);
  return { label: meta.label, tone: meta.tone };
}

const MARKS: Record<Step['state'], TimelineMark> = {
  done: 'done',
  doing: 'current',
  todo: 'upcoming',
};

/**
 * Chuyển dòng thời gian của `buildApplicationTimeline`/`buildContractTimeline`
 * sang cách vẽ của thẻ tiến trình. Mapper gốc coi mọi mốc của hành trình đã kết
 * thúc là "đã xong"; khi hành trình dừng không thành, mốc cuối (lịch sử đã sắp
 * theo thời gian) chính là lần chuyển sang trạng thái dừng nên được đánh dấu
 * dừng. Đối chiếu đúng nhãn để không đánh nhầm khi trang lịch sử thiếu mốc cuối.
 */
export function toTimelineEntries(
  steps: readonly Step[],
  stop: TimelineStop | null,
): TimelineEntry[] {
  return steps.map((step, index) => {
    const isStop =
      stop !== null && index === steps.length - 1 && step.state === 'done' && step.title === stop.label;
    return {
      key: step.id ?? `${index}-${step.title}`,
      title: step.title,
      detail: step.detail ?? null,
      mark: isStop ? 'stopped' : MARKS[step.state],
      stopTone: isStop ? stop.tone : null,
    };
  });
}
