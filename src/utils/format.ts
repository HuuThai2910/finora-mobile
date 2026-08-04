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
