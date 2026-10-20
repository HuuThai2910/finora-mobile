import { ApiError, NetworkError, toUserMessage } from '@/lib/api';
import type { Withdrawal, WithdrawalPolicy, WithdrawalStatus } from '@/types/wallet';
import { formatDateTime, formatDong, formatLocalDate, formatRecentTime } from '@/utils/format';

/** Tông của nhãn trạng thái; component tự đổi sang bảng màu. */
export type WithdrawalTone = 'blue' | 'amber' | 'green' | 'red' | 'gray';

/**
 * Bốn tình huống màn trạng thái vẽ: đang xử lý bình thường, đang đối soát (chưa rõ provider đã chi hay chưa),
 * hoàn tất, thất bại (Payment đã hoàn tiền về ví).
 */
export type WithdrawalPhase = 'pending' | 'reconcile' | 'completed' | 'failed';

export type WithdrawalStatusView = { label: string; tone: WithdrawalTone; phase: WithdrawalPhase };

const STATUS: Record<WithdrawalStatus, WithdrawalStatusView> = {
  REQUESTED: { label: 'Đã nhận lệnh', tone: 'blue', phase: 'pending' },
  PROCESSING: { label: 'Đang gửi lệnh chi', tone: 'blue', phase: 'pending' },
  PROVIDER_PENDING: { label: 'Chờ xác nhận', tone: 'blue', phase: 'pending' },
  RECONCILIATION_REQUIRED: { label: 'Đang đối soát', tone: 'amber', phase: 'reconcile' },
  COMPLETED: { label: 'Hoàn tất', tone: 'green', phase: 'completed' },
  FAILED: { label: 'Thất bại · đã hoàn tiền', tone: 'red', phase: 'failed' },
};

/** Trạng thái backend mới thêm mà app chưa biết: coi như còn xử lý, không tự báo thành công hay thất bại. */
const UNKNOWN_STATUS: WithdrawalStatusView = { label: 'Đang xử lý', tone: 'gray', phase: 'pending' };

const isKnownStatus = (status: string): status is WithdrawalStatus => status in STATUS;

export function withdrawalStatusView(status: string): WithdrawalStatusView {
  return isKnownStatus(status) ? STATUS[status] : UNKNOWN_STATUS;
}

/** `COMPLETED` và `FAILED` là kết quả cuối; mọi trạng thái khác (kể cả trạng thái lạ) vẫn cần theo dõi. */
export const isFinalWithdrawal = (status: string): boolean => status === 'COMPLETED' || status === 'FAILED';

export const feeLabel = (fee: number): string => (fee === 0 ? 'Miễn phí' : formatDong(fee));

/** Bản demo gọi đúng tên "nhà cung cấp giả lập"; provider thật (chưa có ở W3B) gọi chung là đơn vị chi hộ. */
const providerName = (simulated: boolean) => (simulated ? 'nhà cung cấp giả lập' : 'đơn vị chi hộ');

/** Tiền đã rời ví khi nhận lệnh: số tiền rút cộng phí. */
const debitOf = (withdrawal: Withdrawal) => withdrawal.amount + withdrawal.feeAmount;

const at = (iso: string | null) => (iso ? ` lúc ${formatDateTime(iso)}` : '');

export type WithdrawalOutcome = {
  title: string;
  detail: string;
  /** Chỉ có khi thất bại: câu xác nhận tiền đã hoàn về ví. */
  refund: string | null;
};

/**
 * Câu chính, câu giải thích và (khi thất bại) câu hoàn tiền của màn trạng thái. Ở bản demo (`simulated`) không câu
 * nào được viết như thể đã có tiền thật chuyển tới ngân hàng.
 */
export function withdrawalOutcome(withdrawal: Withdrawal, simulated: boolean): WithdrawalOutcome {
  const destination = `${withdrawal.bankName} ${withdrawal.accountNumberMasked}`;
  const amount = formatDong(withdrawal.amount);
  switch (withdrawalStatusView(withdrawal.status).phase) {
    case 'completed':
      return simulated
        ? {
            title: `Đã rút ${amount} (giả lập)`,
            detail: `Nhà cung cấp giả lập đã xác nhận lệnh chi tới ${destination}${at(withdrawal.completedAt)}. Môi trường demo không chuyển tiền thật tới ngân hàng.`,
            refund: null,
          }
        : {
            title: `Đã rút ${amount}`,
            detail: `Đơn vị chi hộ đã xác nhận chuyển tiền tới ${destination}${at(withdrawal.completedAt)}.`,
            refund: null,
          };
    case 'failed':
      return {
        title: 'Rút tiền không thành công',
        // `failureReason` của Payment đã viết cho người dùng đọc (ví dụ "Tài khoản nhận không hợp lệ").
        detail: withdrawal.failureReason ?? (simulated ? 'Nhà cung cấp giả lập từ chối lệnh chi.' : 'Đơn vị chi hộ từ chối lệnh chi.'),
        refund: `Tiền đã hoàn về ví: ${formatDong(debitOf(withdrawal))} đã trở lại số dư khả dụng.`,
      };
    case 'reconcile':
      return {
        title: 'Đang xác minh kết quả lệnh rút',
        detail: `Chưa nhận được kết quả cuối từ ${providerName(simulated)}. FINORA đang tra cứu lại theo mã lệnh và không gửi lệnh chi thứ hai; số tiền vẫn tạm trừ khỏi ví cho tới khi có kết quả.`,
        refund: null,
      };
    case 'pending':
      return {
        title: `Đang xử lý lệnh rút ${amount}`,
        detail: `Đã trừ ${formatDong(debitOf(withdrawal))} khỏi ví. Lệnh đang được gửi tới ${providerName(simulated)} để chi về ${destination}.`,
        refund: null,
      };
  }
}

export type WithdrawalDetailRow = { label: string; value: string };

/** Các dòng của thẻ "Chi tiết giao dịch"; mã lệnh dùng khi cần tra soát với hỗ trợ. */
export function withdrawalDetailRows(withdrawal: Withdrawal): WithdrawalDetailRow[] {
  const rows: WithdrawalDetailRow[] = [
    { label: 'Mã lệnh', value: withdrawal.withdrawalId },
    { label: 'Ngân hàng nhận', value: withdrawal.bankName },
    { label: 'Số tài khoản', value: withdrawal.accountNumberMasked },
    { label: 'Chủ tài khoản', value: withdrawal.accountHolderName },
    { label: 'Số tiền rút', value: formatDong(withdrawal.amount) },
    { label: 'Phí rút', value: feeLabel(withdrawal.feeAmount) },
    { label: 'Tạo lúc', value: formatDateTime(withdrawal.createdAt) },
  ];
  if (withdrawal.completedAt) rows.push({ label: 'Hoàn tất lúc', value: formatDateTime(withdrawal.completedAt) });
  if (withdrawal.failureCode) rows.push({ label: 'Mã lỗi', value: withdrawal.failureCode });
  return rows;
}

/** Ba con số người dùng cần trước khi nhập số tiền. */
export function withdrawalPolicyRows(policy: WithdrawalPolicy): WithdrawalDetailRow[] {
  return [
    { label: 'Tối thiểu mỗi lần', value: formatDong(policy.minimumAmount) },
    { label: 'Còn được rút hôm nay', value: formatDong(policy.remainingToday) },
    { label: 'Phí rút', value: feeLabel(policy.feeAmount) },
  ];
}

export function withdrawalPolicyFootnote(policy: WithdrawalPolicy): string {
  return `Hạn mức ${formatDong(policy.dailyLimit)} mỗi ngày (ngày ${formatLocalDate(policy.businessDate)}, giờ Việt Nam), hôm nay đã dùng ${formatDong(policy.usedToday)}. Lệnh thất bại đã hoàn tiền không tính vào hạn mức.`;
}

export type WithdrawalCardView = {
  id: string;
  title: string;
  account: string;
  time: string;
  /** "−500.000 đ" khi tiền đã rời ví; lệnh thất bại đã hoàn tiền thì không có dấu trừ. */
  amount: string;
  refunded: boolean;
  status: WithdrawalStatusView;
  accessibilityLabel: string;
};

/** Trình đọc màn hình đọc "đồng" rõ hơn ký hiệu "đ". */
const spokenDong = (amount: number) => `${new Intl.NumberFormat('vi-VN').format(amount)} đồng`;

export function withdrawalCardView(withdrawal: Withdrawal): WithdrawalCardView {
  const status = withdrawalStatusView(withdrawal.status);
  const time = formatRecentTime(withdrawal.createdAt);
  const refunded = status.phase === 'failed';
  const title = `Rút về ${withdrawal.bankName}`;
  return {
    id: withdrawal.withdrawalId,
    title,
    account: withdrawal.accountNumberMasked,
    time,
    amount: refunded ? formatDong(withdrawal.amount) : `−${formatDong(withdrawal.amount)}`,
    refunded,
    status,
    accessibilityLabel: `${title}, tài khoản đuôi ${withdrawal.accountNumberMasked.slice(-4)}, ${time}, ${spokenDong(withdrawal.amount)}, ${status.label}`,
  };
}

/**
 * Lỗi khi gửi lệnh rút; còn lại dùng nguyên `message` tiếng Việt của Payment (hạn mức, số dư, PIN, giới hạn tần suất).
 * Mất kết nối hoặc quá giờ chờ thì chưa biết lệnh đã được tạo hay chưa: nói rõ gửi lại với đúng thông tin là an toàn
 * (cùng `Idempotency-Key`, Payment trả lại lệnh cũ, không trừ ví hai lần). Xung đột khoá thì câu của backend là câu kỹ
 * thuật nên thay bằng việc người dùng cần làm.
 */
export function withdrawalSubmitError(error: unknown): string {
  if (error instanceof ApiError && error.code === 'WITHDRAWAL_IDEMPOTENCY_CONFLICT') {
    return 'Thông tin lệnh rút đã đổi so với lần gửi trước. Bấm "Rút tiền" lần nữa để tạo lệnh mới.';
  }
  const message = toUserMessage(error);
  return error instanceof NetworkError
    ? `${message} Lệnh có thể đã được ghi nhận: bấm "Rút tiền" lần nữa với đúng thông tin để kiểm tra, ví không bị trừ hai lần.`
    : message;
}
