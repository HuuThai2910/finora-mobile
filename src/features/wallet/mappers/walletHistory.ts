import type { IconName } from '@/constants/icons';
import type { WalletTransaction } from '@/types/wallet';
import { formatRecentTime, formatSignedDong } from '@/utils/format';

/** Xanh lá cho tiền vào, xanh dương cho tiền ra — như mockup. */
export type TxTone = 'in' | 'out';

export type WalletTxView = {
  id: string;
  icon: IconName;
  tone: TxTone;
  title: string;
  time: string;
  /** "+5.000.000 đ" / "−4.320.000 đ": có dấu nên không chỉ dựa vào màu để phân biệt. */
  amount: string;
  accessibilityLabel: string;
};

export type WalletTxGroup = {
  /** Khoá ổn định của nhóm ("2026-07"), dùng làm `key` khi vẽ. */
  key: string;
  title: string;
  items: WalletTxView[];
};

/**
 * API ví chưa trả loại giao dịch, chỉ có chiều tiền. Mockup vẽ riêng hộp quà cho
 * tiền phân bổ/lãi nhà đầu tư nhận về, nên nhận ra nhóm này qua mô tả; không khớp
 * thì vẫn đúng chiều tiền (tải xuống cho tiền vào, mũi tên lên cho tiền ra).
 * Khi backend có trường loại giao dịch thì thay phép so chữ này.
 */
const PAYOUT_PATTERN = /phân bổ|tiền lãi|nhận lãi/i;

function iconFor(tx: WalletTransaction): IconName {
  if (tx.direction === 'out') return 'arrowUp';
  return PAYOUT_PATTERN.test(tx.description) ? 'gift' : 'download';
}

/**
 * Giữ nguyên khối các cụm mã trong mô tả để máy hẹp không bẻ dòng giữa chừng:
 * "LN-" / "1980", "VCB ••••" / "8842", "kỳ" / "7" hay "(phong" / "tỏa)" khó đọc
 * hơn nhiều so với xuống dòng cả cụm. Chỉ đổi ký tự ngắt dòng (word joiner
 * U+2060, khoảng trắng không ngắt U+00A0), chữ hiển thị giữ nguyên; nhãn đọc màn
 * hình dùng mô tả gốc.
 */
function keepCodesTogether(text: string): string {
  return text
    .replace(/([A-Za-z]+)-(\d)/g, '$1-\u2060$2')
    .replace(/(•+) (\d)/g, '$1\u00a0$2')
    .replace(/ kỳ (\d)/g, ' kỳ\u00a0$1')
    .replace(/(\S) \/ (\S)/g, '$1\u00a0/\u00a0$2')
    .replace(/\((\S+) (\S+)\)/g, '($1\u00a0$2)');
}

/** Trình đọc màn hình đọc "đồng" rõ hơn ký hiệu "đ". */
const spokenDong = (amount: number) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.abs(amount))} đồng`;

function toView(tx: WalletTransaction): WalletTxView {
  const time = formatRecentTime(tx.occurredAt);
  const incoming = tx.direction === 'in';
  return {
    id: tx.id,
    icon: iconFor(tx),
    tone: incoming ? 'in' : 'out',
    title: keepCodesTogether(tx.description),
    time,
    amount: formatSignedDong(tx.amount, tx.direction),
    accessibilityLabel: `${tx.description}, ${time}, ${incoming ? 'tiền vào' : 'tiền ra'} ${spokenDong(tx.amount)}`,
  };
}

const UNKNOWN_KEY = 'unknown';
const pad2 = (n: number) => n.toString().padStart(2, '0');

/** Mốc thời gian để sắp xếp; chuỗi hỏng xếp cuối thay vì làm vỡ thứ tự cả danh sách. */
const timeOf = (tx: WalletTransaction) => {
  const t = new Date(tx.occurredAt).getTime();
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
};

/** Tháng theo múi giờ của máy, cùng cách `formatRecentTime` hiển thị ngày giờ. */
function monthOf(tx: WalletTransaction): { key: string; title: string } {
  const d = new Date(tx.occurredAt);
  if (Number.isNaN(d.getTime())) return { key: UNKNOWN_KEY, title: 'Chưa rõ thời gian' };
  const month = pad2(d.getMonth() + 1);
  return { key: `${d.getFullYear()}-${month}`, title: `Tháng ${month}/${d.getFullYear()}` };
}

/**
 * Nhóm giao dịch theo tháng, mới nhất lên trước. Sắp xếp lại ở đây để một tháng
 * không bị tách thành hai nhóm nếu API trả lẫn thứ tự.
 */
export function groupWalletTransactions(transactions: readonly WalletTransaction[]): WalletTxGroup[] {
  const sorted = [...transactions].sort((a, b) => timeOf(b) - timeOf(a));
  const groups: WalletTxGroup[] = [];

  for (const tx of sorted) {
    const { key, title } = monthOf(tx);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(toView(tx));
    } else {
      groups.push({ key, title, items: [toView(tx)] });
    }
  }
  return groups;
}
