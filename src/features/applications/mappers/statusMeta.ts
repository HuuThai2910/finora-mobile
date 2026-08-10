import type { LoanContractStatus } from '@/types/contract';
import type { LoanApplicationStatus } from '@/types/loan';
import { APPLICATION_STATUS, CONTRACT_STATUS, type StatusMeta } from '../constant';

/**
 * Backend có thể bổ sung trạng thái mới trước khi mobile kịp cập nhật. Trả về
 * mô tả trung tính thay vì để `undefined` làm vỡ màn hình.
 */
function fallback(raw: string): StatusMeta {
  return {
    tone: 'gray',
    label: raw,
    icon: 'alert',
    meaning: 'Ứng dụng chưa nhận diện được trạng thái này. Hãy cập nhật ứng dụng lên bản mới nhất.',
    next: null,
  };
}

export function applicationStatusMeta(status: LoanApplicationStatus): StatusMeta {
  return APPLICATION_STATUS[status] ?? fallback(status);
}

export function contractStatusMeta(status: LoanContractStatus): StatusMeta {
  return CONTRACT_STATUS[status] ?? fallback(status);
}
