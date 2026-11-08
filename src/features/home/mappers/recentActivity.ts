import type { WalletTransaction } from '@/types/wallet';

/** Trang chủ chỉ là lối tắt; danh sách đầy đủ ở màn Lịch sử ví. */
export const RECENT_ACTIVITY_LIMIT = 3;

/** Mốc thời gian để sắp xếp; chuỗi hỏng xếp cuối thay vì làm vỡ thứ tự cả danh sách. */
const timeOf = (tx: WalletTransaction) => {
  const t = new Date(tx.occurredAt).getTime();
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
};

/**
 * Vài giao dịch ví mới nhất cho thẻ "Giao dịch gần đây". Tự sắp xếp lại vì API
 * `GET /wallets/me/transactions` không cam kết thứ tự trả về.
 */
export function latestTransactions(
  transactions: readonly WalletTransaction[],
  limit = RECENT_ACTIVITY_LIMIT,
): WalletTransaction[] {
  return [...transactions].sort((a, b) => timeOf(b) - timeOf(a)).slice(0, limit);
}
