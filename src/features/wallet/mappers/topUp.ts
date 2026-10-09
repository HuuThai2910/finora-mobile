import type { TopUpOrder } from '@/types/wallet';
import { formatDateTime, formatDong } from '@/utils/format';

/** Tông của nhãn trạng thái; component tự đổi sang bảng màu. */
export type TopUpTone = 'blue' | 'amber' | 'green' | 'red' | 'gray';

/**
 * Màn nạp tiền vẽ lệnh nạp theo bốn tình huống: còn chờ thanh toán, đã cộng tiền, hỏng hẳn và
 * chưa rõ kết quả (Payment Service đánh dấu `RECONCILIATION_REQUIRED` khi không biết cổng thanh
 * toán đã tạo đơn hay chưa).
 */
export type TopUpPhase = 'pending' | 'completed' | 'failed' | 'reconcile';

type StatusView = { label: string; tone: TopUpTone; phase: TopUpPhase };

const STATUS: Record<string, StatusView> = {
  PROVIDER_PENDING: { label: 'Đang tạo giao dịch', tone: 'blue', phase: 'pending' },
  AWAITING_PAYMENT: { label: 'Chờ thanh toán', tone: 'amber', phase: 'pending' },
  COMPLETED: { label: 'Đã nạp tiền', tone: 'green', phase: 'completed' },
  FAILED: { label: 'Thất bại', tone: 'red', phase: 'failed' },
  EXPIRED: { label: 'Đã hết hạn', tone: 'gray', phase: 'failed' },
  RECONCILIATION_REQUIRED: { label: 'Đang đối soát', tone: 'amber', phase: 'reconcile' },
};

/** Trạng thái backend mới thêm mà app chưa biết: coi như còn xử lý, không tự báo thành công hay thất bại. */
const UNKNOWN_STATUS: StatusView = { label: 'Đang xử lý', tone: 'gray', phase: 'pending' };

export function topUpStatusView(status: string): StatusView {
  return STATUS[status] ?? UNKNOWN_STATUS;
}

const PROVIDER: Record<string, string> = { ZALOPAY: 'ZaloPay', MOCK: 'Giả lập (demo)' };

export function providerLabel(provider: string): string {
  return PROVIDER[provider] ?? provider;
}

/**
 * Dòng hướng dẫn dưới mã QR, theo cổng thanh toán và việc backend có trả mã/đường dẫn hay không.
 * Quá hạn thì chỉ cho hai lối: đã trả trước hạn thì kiểm tra lại, chưa trả thì tạo lệnh mới.
 */
export function topUpPaymentHint(order: TopUpOrder, expired: boolean): string {
  if (expired) {
    return 'Mã này đã hết hạn. Nếu bạn đã thanh toán trước hạn, hãy kiểm tra trạng thái; nếu chưa, tạo giao dịch mới.';
  }
  if (order.provider === 'MOCK') {
    return 'Mã giả lập chỉ để nhận diện giao dịch. Bấm “Giả lập thanh toán thành công” thay cho bước quét mã.';
  }
  const app = order.provider === 'ZALOPAY' ? 'ứng dụng ZaloPay' : `ứng dụng ${providerLabel(order.provider)}`;
  if (order.qrPayload && order.checkoutUrl) return `Quét mã bằng ${app}, hoặc mở trang thanh toán ngay trên máy này.`;
  if (order.qrPayload) return `Quét mã bằng ${app} để thanh toán.`;
  if (order.checkoutUrl) return `Mở trang thanh toán của ${providerLabel(order.provider)} để hoàn tất.`;
  return 'Cổng thanh toán đang tạo mã thanh toán. Kiểm tra lại sau vài giây.';
}

/** Đếm lùi dạng "14:05" (phút:giây). */
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export type TopUpDetailRow = { label: string; value: string };

/**
 * Các dòng của thẻ "Chi tiết giao dịch". Thẻ thanh toán đã ghi cổng thanh toán ở đầu thẻ nên chỉ
 * thêm dòng này khi thẻ thanh toán không còn hiện (đã xong, thất bại, đối soát).
 */
export function topUpDetailRows(order: TopUpOrder, withProvider: boolean): TopUpDetailRow[] {
  const rows: TopUpDetailRow[] = [];
  if (withProvider) rows.push({ label: 'Cổng thanh toán', value: providerLabel(order.provider) });
  rows.push({ label: 'Mã giao dịch', value: order.topUpId });
  rows.push({ label: 'Mã đối tác', value: order.providerOrderId });
  if (order.providerReference) rows.push({ label: 'Mã tham chiếu', value: order.providerReference });
  if (order.completedAt) {
    rows.push({ label: 'Hoàn tất lúc', value: formatDateTime(order.completedAt) });
  } else if (order.expiresAt) {
    rows.push({ label: 'Hạn thanh toán', value: formatDateTime(order.expiresAt) });
  }
  return rows;
}

/** Câu chính và câu giải thích của thẻ kết quả khi lệnh đã ra khỏi trạng thái chờ thanh toán. */
export function topUpOutcome(order: TopUpOrder): { title: string; detail: string } {
  const phase = topUpStatusView(order.status).phase;
  if (phase === 'completed') {
    return {
      title: `Đã nạp ${formatDong(order.amount)}`,
      detail: order.completedAt
        ? `Tiền đã vào Ví Finora lúc ${formatDateTime(order.completedAt)}.`
        : 'Tiền đã vào Ví Finora.',
    };
  }
  if (phase === 'reconcile') {
    return {
      title: 'Chưa rõ kết quả thanh toán',
      detail: 'Cổng thanh toán chưa trả kết quả cho giao dịch này. Nếu bạn đã thanh toán, đừng nạp lại; hãy kiểm tra lại sau ít phút.',
    };
  }
  // `errorDetail` là lỗi kỹ thuật từ cổng thanh toán, không hiện nguyên văn cho người dùng.
  return {
    title: order.status === 'EXPIRED' ? 'Giao dịch đã hết hạn' : 'Nạp tiền không thành công',
    detail: 'Số dư ví không thay đổi. Bạn có thể tạo giao dịch mới.',
  };
}
