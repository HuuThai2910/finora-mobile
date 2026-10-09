import type { IconName } from '@/constants/icons';
import type { AppNotification } from '@/types/notification';
import { formatDate, formatTime } from '@/utils/format';
import { NOTIFICATION_ICON, NOTIFICATION_LABEL, NOTIFICATION_TONE, type NotificationTone } from '../constant';

export type NotificationView = {
  id: string;
  unread: boolean;
  icon: IconName;
  tone: NotificationTone;
  /** Tên nhóm ở đầu thẻ, chỗ tên ứng dụng trên thông báo đẩy ("Dòng tiền"). */
  label: string;
  /** "Vừa xong", "20 phút trước" trong hôm nay; ngày khác chỉ ghi giờ vì ngày đã ở tiêu đề nhóm. */
  time: string | null;
  title: string;
  /** Nội dung chia quanh số tiền để in đậm số tiền ngay trong câu. */
  body: { before: string; amount?: string; after: string };
  /** Tin dòng tiền: số tiền tô xanh lá như tiền vào ở Lịch sử ví. */
  amountIn: boolean;
  accessibilityLabel: string;
};

export type NotificationGroup = {
  /** Khoá ổn định của nhóm (mốc 0 giờ của ngày), dùng làm `key` khi vẽ. */
  key: string;
  title: string;
  items: NotificationView[];
};

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;
const UNKNOWN_KEY = 'unknown';

/** Mốc 0 giờ của ngày chứa `t`, theo múi giờ của máy. */
const startOfDay = (t: number) => {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

/** Thời điểm của tin; chuỗi thiếu hoặc hỏng trả `null` để tin đó xếp cuối, không làm vỡ thứ tự. */
const timeOf = (n: AppNotification): number | null => {
  if (!n.occurredAt) return null;
  const t = new Date(n.occurredAt).getTime();
  return Number.isNaN(t) ? null : t;
};

/**
 * So theo ngày trên lịch chứ không theo số giờ đã trôi: tin lúc 23:50 tối qua vẫn
 * là "Hôm qua". Làm tròn để ngày đổi giờ mùa hè (23/25 tiếng) không lệch một ngày;
 * giờ máy chạy chậm hơn server (tin "ở tương lai") vẫn xếp vào "Hôm nay".
 */
const daysAgo = (dayStart: number, today: number) => Math.round((today - dayStart) / DAY_MS);

function dayTitle(dayStart: number, today: number): string {
  const days = daysAgo(dayStart, today);
  if (days <= 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  return formatDate(new Date(dayStart).toISOString());
}

/** Giờ ở góc phải thẻ, như thông báo đẩy: tin hôm nay ghi khoảng cách tới bây giờ. */
function timeLabel(t: number, iso: string, today: number, now: number): string {
  if (daysAgo(startOfDay(t), today) > 0) return formatTime(iso);
  const minutes = Math.floor((now - t) / MINUTE_MS);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  return `${Math.floor(minutes / 60)} giờ trước`;
}

/**
 * Giữ nguyên khối mã khoản vay khi xuống dòng: "LN-" / "1975" khó đọc hơn nhiều so
 * với xuống dòng cả cụm. Chỉ đổi ký tự ngắt dòng (word joiner U+2060), chữ giữ nguyên.
 */
const keepCodesTogether = (text: string) => text.replace(/([A-Za-z]+)-(\d)/g, '$1-⁠$2');

/** Số tiền không bao giờ bị bẻ giữa số và "đ" (khoảng trắng không ngắt U+00A0). */
const keepAmountTogether = (amount: string) => amount.replace(/ /g, ' ');

/**
 * Tách câu quanh số tiền để in đậm đúng chỗ. API thật đã đưa số tiền định dạng vào
 * giữa câu; tin không chứa nguyên văn số tiền thì số tiền đứng cuối câu.
 */
function splitBody(message: string, amount?: string): NotificationView['body'] {
  if (!amount) return { before: keepCodesTogether(message), after: '' };
  const shown = keepAmountTogether(amount);
  const at = message.indexOf(amount);
  if (at < 0) return { before: `${keepCodesTogether(message)} `, amount: shown, after: '' };
  return {
    before: keepCodesTogether(message.slice(0, at)),
    amount: shown,
    after: keepCodesTogether(message.slice(at + amount.length)),
  };
}

/** Trình đọc màn hình đọc "đồng" rõ hơn ký hiệu "đ". */
const spoken = (text: string) => text.replace(/(\d)\s?đ(?=$|[\s.,;)])/g, '$1 đồng');

function toView(n: AppNotification, today: number, now: number): NotificationView {
  const t = timeOf(n);
  const time = t !== null && n.occurredAt ? timeLabel(t, n.occurredAt, today, now) : null;
  const label = NOTIFICATION_LABEL[n.kind];
  const tone = NOTIFICATION_TONE[n.kind];
  const body = splitBody(n.message, n.highlight);
  // Nhãn đọc dùng chữ gốc, không mang các ký tự giữ dòng chỉ dành cho hiển thị.
  const sentence = n.highlight && !n.message.includes(n.highlight) ? `${n.message} ${n.highlight}` : n.message;
  return {
    id: n.id,
    unread: n.unread,
    icon: NOTIFICATION_ICON[n.kind],
    tone,
    label,
    time,
    title: n.title,
    body,
    amountIn: tone === 'money',
    accessibilityLabel: [
      n.unread ? 'Chưa đọc.' : null,
      time ? `${label}, ${time}.` : `${label}.`,
      `${n.title}.`,
      spoken(sentence),
    ]
      .filter(Boolean)
      .join(' '),
  };
}

/**
 * Xếp tin mới nhất lên đầu rồi nhóm theo ngày: "Hôm nay", "Hôm qua", sau đó là
 * ngày cụ thể. Tin không rõ thời điểm gom vào nhóm "Trước đó" ở cuối.
 */
export function groupNotifications(
  items: readonly AppNotification[],
  now: Date = new Date(),
): NotificationGroup[] {
  const nowMs = now.getTime();
  const today = startOfDay(nowMs);
  const sorted = [...items].sort((a, b) => {
    const ta = timeOf(a);
    const tb = timeOf(b);
    if (ta === null || tb === null) return ta === tb ? 0 : ta === null ? 1 : -1;
    return tb - ta;
  });

  const groups: NotificationGroup[] = [];
  for (const n of sorted) {
    const t = timeOf(n);
    const dayStart = t === null ? null : startOfDay(t);
    const key = dayStart === null ? UNKNOWN_KEY : String(dayStart);
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = { key, title: dayStart === null ? 'Trước đó' : dayTitle(dayStart, today), items: [] };
      groups.push(group);
    }
    group.items.push(toView(n, today, nowMs));
  }
  return groups;
}
