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

/**
 * Hồ sơ dừng ở `APPROVED`, còn các bước ký/hiệu lực thuộc LoanContract.
 * UI phải ghép hai aggregate để không tiếp tục báo “chờ ký” sau khi Contract
 * đã được ký, từ chối hoặc hết hạn.
 */
export function applicationJourneyStatus(
  applicationStatus: LoanApplicationStatus,
  contractStatus?: LoanContractStatus,
): StatusMeta {
  if (applicationStatus === 'APPROVED' && contractStatus) {
    return contractStatusMeta(contractStatus);
  }
  return applicationStatusMeta(applicationStatus);
}

export function contractActionLabel(status: LoanContractStatus): string {
  switch (status) {
    case 'PENDING_SIGNATURE':
      return 'Đọc và ký hợp đồng';
    case 'SIGNED':
      return 'Xem hợp đồng đã ký';
    case 'EFFECTIVE':
      return 'Xem hợp đồng đang hiệu lực';
    case 'COMPLETED':
      return 'Xem hợp đồng đã hoàn tất';
    case 'DECLINED':
      return 'Xem hợp đồng đã từ chối';
    case 'EXPIRED':
      return 'Xem hợp đồng đã hết hạn';
  }
}
