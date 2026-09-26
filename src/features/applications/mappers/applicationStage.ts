import type { LoanContractStatus } from '@/types/contract';
import type { LoanApplicationStatus, TermsConfirmationStatus } from '@/types/loan';
import { APPLICATION_STAGES, type ApplicationStage } from '../constant';

/** Bộ lọc đang chọn ở màn "Hồ sơ vay": một nhóm, hoặc tất cả hồ sơ. */
export type StageFilter = ApplicationStage | 'all';

export type StageChip = { key: StageFilter; label: string; count: number };

const APPLICATION_STAGE: Record<LoanApplicationStatus, ApplicationStage> = {
  SUBMITTED: 'reviewing',
  ELIGIBILITY_PENDING: 'reviewing',
  SCORING: 'reviewing',
  SCORING_RETRY_PENDING: 'reviewing',
  PENDING_REVIEW: 'reviewing',
  // Đã duyệt mà chưa có Contract: bước kế tiếp thuộc về người vay (đọc và ký,
  // hoặc xác nhận điều khoản cuối khi điều khoản bất lợi hơn lúc nộp).
  APPROVED: 'action',
  REJECTED: 'rejected',
  WITHDRAWN: 'stopped',
};

const CONTRACT_STAGE: Record<LoanContractStatus, ApplicationStage> = {
  PENDING_SIGNATURE: 'action',
  // Yêu cầu ký đã sang VNPT SmartCA nhưng người vay vẫn phải xác nhận trên ứng dụng đó.
  SIGNING: 'action',
  // Hiệu lực và hoàn tất đều diễn ra sau khi ký thành công.
  SIGNED: 'signed',
  EFFECTIVE: 'signed',
  COMPLETED: 'signed',
  DECLINED: 'stopped',
  EXPIRED: 'stopped',
};

/**
 * Nhóm lọc của một hồ sơ. Giữ đúng thứ tự ưu tiên của `applicationJourneyStatus`
 * (Contract → xác nhận điều khoản → trạng thái hồ sơ) để một chip không bao giờ
 * gom thẻ có nhãn trạng thái trái nghĩa với tên chip. Trạng thái backend mới bổ
 * sung rơi vào nhóm "Trạng thái khác" thay vì biến mất khỏi mọi bộ lọc.
 */
export function applicationStage(
  applicationStatus: LoanApplicationStatus,
  contractStatus?: LoanContractStatus,
  termsStatus?: TermsConfirmationStatus,
): ApplicationStage {
  if (applicationStatus === 'APPROVED' && contractStatus) {
    return CONTRACT_STAGE[contractStatus] ?? 'other';
  }
  if (applicationStatus === 'APPROVED' && (termsStatus === 'DECLINED' || termsStatus === 'EXPIRED')) {
    return 'stopped';
  }
  return APPLICATION_STAGE[applicationStatus] ?? 'other';
}

/**
 * Chip "Tất cả" luôn có; các nhóm khác chỉ hiện khi có hồ sơ. Riêng nhóm đang
 * chọn vẫn giữ dù vừa về 0 sau lần tải lại, để người dùng thấy mình đang lọc gì
 * thay vì một danh sách trống không rõ lý do.
 */
export function buildStageChips(
  stages: readonly ApplicationStage[],
  selected: StageFilter,
): StageChip[] {
  const chips: StageChip[] = [{ key: 'all', label: 'Tất cả', count: stages.length }];
  for (const stage of APPLICATION_STAGES) {
    const count = stages.filter(item => item === stage.key).length;
    if (count > 0 || stage.key === selected) {
      chips.push({ key: stage.key, label: stage.label, count });
    }
  }
  return chips;
}
