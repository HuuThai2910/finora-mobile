import type { Step } from '@/components/phone';
import type { LoanContractHistory, LoanContractStatus } from '@/types/contract';
import type { LoanApplicationHistory, LoanApplicationStatus } from '@/types/loan';
import { formatDateTime } from '@/utils/format';
import { ACTOR_LABELS, type StatusMeta } from '../constant';
import { applicationStatusMeta, contractStatusMeta } from './statusMeta';

type Entry = {
  id: number;
  title: string;
  actor: 'BORROWER' | 'INVESTOR' | 'ADMIN' | 'SYSTEM';
  at: string;
};

/**
 * Ghép lịch sử thật của backend thành dòng thời gian.
 * Mốc cuối cùng được đánh dấu `doing` khi trạng thái hiện tại chưa kết thúc, và
 * chỉ thêm đúng một bước `todo` lấy từ `next` của trạng thái đó. Không tự dựng
 * chuỗi bước lý tưởng vì như vậy sẽ bịa ra mốc mà backend chưa hề ghi nhận.
 */
function build(entries: readonly Entry[], current: StatusMeta, journey?: StatusMeta): Step[] {
  const ordered = [...entries].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  if (journey) return withJourney(ordered, journey);
  const isOngoing = current.next !== null;

  const steps: Step[] = ordered.map((entry, index) => ({
    id: String(entry.id),
    title: entry.title,
    detail: `${ACTOR_LABELS[entry.actor]} · ${formatDateTime(entry.at)}`,
    state: isOngoing && index === ordered.length - 1 ? 'doing' : 'done',
  }));

  if (isOngoing && current.next) {
    steps.push({ id: 'next', title: current.next, detail: 'Chưa tới', state: 'todo' });
  }

  return steps;
}

/**
 * Hồ sơ dừng ở `APPROVED`, phần đường còn lại (xác nhận điều khoản, gọi vốn, lập và ký hợp đồng) nằm ở
 * Funding/Contract. Mốc "Đã duyệt" vì thế đã xong; mốc đang ở là trạng thái hành trình đã ghép
 * (`applicationJourneyStatus`), và bước kế tiếp lấy theo trạng thái đó chứ không theo `APPROVED`.
 */
function withJourney(ordered: readonly Entry[], journey: StatusMeta): Step[] {
  const steps: Step[] = ordered.map(entry => ({
    id: String(entry.id),
    title: entry.title,
    detail: `${ACTOR_LABELS[entry.actor]} · ${formatDateTime(entry.at)}`,
    state: 'done',
  }));
  steps.push({
    id: 'journey',
    title: journey.label,
    detail: journey.next ? 'Đang ở bước này' : 'Trạng thái hiện tại',
    state: journey.next ? 'doing' : 'done',
  });
  if (journey.next) {
    steps.push({ id: 'next', title: journey.next, detail: 'Chưa tới', state: 'todo' });
  }
  return steps;
}

/**
 * @param journey trạng thái hành trình đã ghép với điều khoản/gọi vốn/hợp đồng; chỉ dùng khi hồ sơ đã
 *                `APPROVED` (trước đó lịch sử hồ sơ đã đủ nói hồ sơ đang ở đâu)
 */
export function buildApplicationTimeline(
  history: readonly LoanApplicationHistory[],
  status: LoanApplicationStatus,
  journey?: StatusMeta,
): Step[] {
  return build(
    history.map(item => ({
      id: item.id,
      title: applicationStatusMeta(item.toStatus).label,
      actor: item.actorType,
      at: item.createdAt,
    })),
    applicationStatusMeta(status),
    status === 'APPROVED' ? journey : undefined,
  );
}

export function buildContractTimeline(
  history: readonly LoanContractHistory[],
  status: LoanContractStatus,
): Step[] {
  return build(
    history.map(item => ({
      id: item.id,
      title: contractStatusMeta(item.toStatus).label,
      actor: item.actorType,
      at: item.occurredAt,
    })),
    contractStatusMeta(status),
  );
}
