import type { LoanContractStatus, LoanContractSummary } from '@/types/contract';
import { formatAnnualRateShort, formatDate, formatDong } from '@/utils/format';
import { CONTRACT_FILTER_ORDER, type StatusMeta } from '../constant';
import { contractStatusMeta } from './statusMeta';

/** Dữ liệu đã sẵn sàng để vẽ một thẻ ở màn "Hợp đồng của tôi". */
export type ContractCardView = {
  contractNumber: string;
  amount: string;
  term: string;
  rate: string;
  /** Dòng ngày cuối thẻ, đã kèm nhãn ("Hạn ký: …" hoặc "Lập ngày …"). */
  dateLine: string;
  status: StatusMeta;
  /** Cả thẻ là một nút duy nhất nên nhãn đọc phải gói đủ thông tin trên thẻ. */
  accessibilityLabel: string;
};

/** Trạng thái mà hạn xác nhận còn là thông tin người vay cần biết. */
const DEADLINE_STATUSES: readonly LoanContractStatus[] = ['PENDING_SIGNATURE', 'SIGNING', 'EXPIRED'];

/**
 * Mockup ghi "Hạn xác nhận" cho mọi thẻ, nhưng với hợp đồng đã ký, đang hiệu lực
 * hay đã từ chối thì hạn đó không còn ý nghĩa (và một ngày trong tương lai dễ bị
 * hiểu là vẫn phải ký). Bản tóm tắt không có ngày ký, nên các trạng thái đó ghi
 * ngày lập hợp đồng — ngày có thật trong dữ liệu.
 *
 * Viết "Hạn ký" (khớp nhãn "Chờ bạn ký"): "Hạn xác nhận: 22/09/2026" dài hơn
 * ~40pt, đẩy "Xem hợp đồng" xuống dòng riêng trên máy 393pt.
 */
function dateLineOf(contract: LoanContractSummary): string {
  return DEADLINE_STATUSES.includes(contract.status)
    ? `Hạn ký: ${formatDate(contract.expiresAt)}`
    : `Lập ngày ${formatDate(contract.createdAt)}`;
}

/** Chuyển một hợp đồng của `GET /loan-contracts/me` sang dữ liệu thẻ. */
export function toContractCardView(contract: LoanContractSummary): ContractCardView {
  const status = contractStatusMeta(contract.status);
  const amount = formatDong(contract.principalAmount);
  const term = `${contract.termMonths} tháng`;
  const rate = formatAnnualRateShort(contract.annualInterestRate);
  const dateLine = dateLineOf(contract);

  return {
    contractNumber: contract.contractNumber,
    amount,
    term,
    rate,
    dateLine,
    status,
    accessibilityLabel:
      `Hợp đồng ${contract.contractNumber}, ${status.label}. Số tiền ${amount}, ` +
      `kỳ hạn ${term}, lãi suất ${rate}. ${dateLine}.`,
  };
}

/** Bộ lọc đang chọn ở màn hợp đồng: một trạng thái, hoặc tất cả. */
export type ContractFilter = LoanContractStatus | 'all';

export type ContractChip = { key: ContractFilter; label: string; count: number };

/**
 * Chip "Tất cả" luôn có; mỗi trạng thái chỉ có chip khi có hợp đồng, riêng chip
 * đang chọn vẫn giữ dù vừa về 0 sau lần tải lại. Trạng thái backend mới bổ sung
 * (chưa có trong thứ tự cố định) xếp cuối thay vì biến mất khỏi bộ lọc.
 */
export function buildContractChips(
  statuses: readonly LoanContractStatus[],
  selected: ContractFilter,
): ContractChip[] {
  const unknown = [...new Set(statuses)].filter(status => !CONTRACT_FILTER_ORDER.includes(status));
  const chips: ContractChip[] = [{ key: 'all', label: 'Tất cả', count: statuses.length }];
  for (const status of [...CONTRACT_FILTER_ORDER, ...unknown]) {
    const count = statuses.filter(item => item === status).length;
    if (count > 0 || status === selected) {
      chips.push({ key: status, label: contractStatusMeta(status).label, count });
    }
  }
  return chips;
}
