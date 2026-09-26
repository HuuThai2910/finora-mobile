export function formatVND(amount: number): string {
  if (amount >= 1_000_000_000) {
    const v = amount / 1_000_000_000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)} tỷ`;
  }
  if (amount >= 1_000_000) {
    const v = amount / 1_000_000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)} tr`;
  }
  return new Intl.NumberFormat('vi-VN').format(amount);
}

export function formatVNDFull(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

/** Định dạng "12.500.000 đ" — đúng cách mockup viết tiền. */
export function formatDong(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(amount)} đ`;
}

/** Tiền có dấu chiều, dùng cho lịch sử ví: "+5.000.000" / "−4.320.000". */
export function formatSigned(amount: number, direction: 'in' | 'out'): string {
  const sign = direction === 'in' ? '+' : '−';
  return `${sign}${new Intl.NumberFormat('vi-VN').format(Math.abs(amount))}`;
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

export function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const date = formatDate(iso);
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  return `${time} ${date}`;
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/** Lãi suất năm đã ở dạng phần trăm: 18 → "18,00%/năm". */
export function formatAnnualRate(percent: number): string {
  return `${percent.toFixed(2).replace('.', ',')}%/năm`;
}

/** Tiền có dấu chiều kèm đơn vị, như dòng giao dịch ở trang chủ: "+5.000.000 đ". */
export function formatSignedDong(amount: number, direction: 'in' | 'out'): string {
  return `${formatSigned(amount, direction)} đ`;
}

const pad2 = (n: number) => n.toString().padStart(2, '0');

/** Mốc 0 giờ của ngày chứa `d`, theo múi giờ của máy. */
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/**
 * Thời điểm gần đây theo cách ứng dụng ngân hàng hay viết: "Hôm nay, 10:24",
 * "Hôm qua, 15:30", xa hơn thì "12/09/2026, 09:18".
 *
 * So theo ngày trên lịch ở múi giờ của máy chứ không theo số giờ đã trôi qua:
 * giao dịch lúc 23:50 tối qua vẫn là "Hôm qua" dù mới cách 20 phút. Làm tròn
 * số ngày để ngày chuyển giờ mùa hè (23 hoặc 25 tiếng) không lệch một ngày.
 */
export function formatRecentTime(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';

  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  const daysAgo = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);

  if (daysAgo === 0) return `Hôm nay, ${time}`;
  if (daysAgo === 1) return `Hôm qua, ${time}`;
  return `${formatDate(iso)}, ${time}`;
}

/* ---------- Khoảng tiền rút gọn — thẻ sản phẩm vay (mockup 26/09/2026) ---------- */

/** Bậc rút gọn theo cách nói thường ngày, xét từ lớn tới nhỏ. */
const MONEY_SCALES = [
  { unit: 'tỷ', value: 1_000_000_000 },
  { unit: 'triệu', value: 1_000_000 },
] as const;

/**
 * Tách số tiền thành số và đơn vị: 50.000.000 → "50" + "triệu", 1,5 tỷ → "1,5" + "tỷ".
 *
 * Chỉ rút gọn khi viết đúng được với tối đa hai chữ số lẻ; không thì ghi đủ số
 * đồng, vì hạn mức vay bị làm tròn dù chỉ một chút cũng là con số sai.
 */
function splitMoney(amount: number): { amount: string; unit: string } {
  for (const scale of MONEY_SCALES) {
    if (amount >= scale.value && amount % (scale.value / 100) === 0) {
      const scaled = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(
        amount / scale.value,
      );
      return { amount: scaled, unit: scale.unit };
    }
  }
  return { amount: new Intl.NumberFormat('vi-VN').format(amount), unit: 'đ' };
}

/**
 * Khoảng tiền ngắn gọn như thẻ sản phẩm vay: "10 – 100 triệu", "50 triệu – 1 tỷ".
 * Hai đầu cùng đơn vị thì chỉ ghi đơn vị một lần ở cuối; hai đầu bằng nhau thì
 * chỉ còn một con số.
 */
export function formatMoneyRange(min: number, max: number): string {
  const low = splitMoney(min);
  const high = splitMoney(max);
  if (min === max) return `${high.amount} ${high.unit}`;
  if (low.unit === high.unit) return `${low.amount} – ${high.amount} ${high.unit}`;
  return `${low.amount} ${low.unit} – ${high.amount} ${high.unit}`;
}

/* ---------- Số phần trăm gọn — màn chi tiết hồ sơ vay (mockup 26/09/2026) ---------- */

/**
 * Số đã ở dạng phần trăm, bỏ số 0 thừa: 13 → "13%", 11,1111 → "11,11%".
 * Chỉ làm tròn phần hiển thị tới `maxDigits` chữ số lẻ; không dùng kết quả để tính tiếp.
 */
export function formatPercentValue(percent: number, maxDigits = 2): string {
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: maxDigits }).format(percent)}%`;
}

/**
 * Lãi suất năm gọn cho ô thông số hẹp: 13 → "13%/năm", 12,5 → "12,5%/năm".
 * Backend lưu tới 4 chữ số lẻ nên giữ đủ 4 chữ số, tránh làm tròn sai mức đã công bố.
 */
export function formatAnnualRateShort(percent: number): string {
  return `${formatPercentValue(percent, 4)}/năm`;
}

/* ---------- Một số tiền viết gọn — màn "Xác nhận khoản vay" (mockup 26/09/2026) ---------- */

/**
 * Một số tiền viết gọn như ô tổng trả / tổng lãi: 53.450.000 → "53,45 triệu".
 * Cùng quy tắc với `formatMoneyRange`: không viết đúng được bằng tối đa hai chữ
 * số lẻ thì ghi đủ số đồng ("53.456.789 đ"), vì tổng phải trả bị làm tròn dù chỉ
 * một chút cũng là con số sai.
 */
export function formatMoneyShort(amount: number): string {
  const { amount: value, unit } = splitMoney(amount);
  return `${value} ${unit}`;
}

/* ---------- Ngày không kèm giờ — màn "Thông tin tài khoản" (mockup 26/09/2026) ---------- */

/**
 * Ngày thuần `yyyy-MM-dd` (như ngày sinh — `LocalDate` của backend) → "24/08/2004".
 *
 * Tách chuỗi thay vì qua `new Date`: chuỗi chỉ có ngày bị hiểu là 0 giờ UTC, nên
 * máy ở múi giờ âm (châu Mỹ) sẽ hiện lùi một ngày. Chuỗi không đúng dạng thì
 * dùng lại `formatDate` để vẫn hiển thị được thay vì trả chuỗi thô.
 */
export function formatLocalDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return formatDate(value);
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}
