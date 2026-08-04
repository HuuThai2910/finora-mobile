/**
 * Nhãn tiếng Việt cho enum `repaymentMethod` của backend — mockup hiển thị ở
 * cột "Kiểu tính lãi".
 */
export const REPAYMENT_METHOD_LABEL: Record<string, string> = {
  ANNUITY: 'Trả góp đều',
  EQUAL_PRINCIPAL: 'Dư nợ giảm dần',
};

/** Ngày giải ngân dự kiến mặc định khi tính thử lịch trả nợ: 30 ngày tới. */
export const defaultDisbursementDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
};

/**
 * Sinh danh sách kỳ hạn cho nhóm chip chọn — mockup hiển thị 6 mốc
 * (6/12/18/24/30/36) nằm trong khoảng cho phép của sản phẩm.
 */
export function termOptions(min: number, max: number): { value: number; label: string }[] {
  const candidates = [6, 12, 18, 24, 30, 36, 48];
  const inRange = candidates.filter(t => t >= min && t <= max);
  const list = inRange.length ? inRange : [min, max];
  return list.map(t => ({ value: t, label: `${t} tháng` }));
}

export const SCHEDULE_TAIL_NOTE = (remaining: number, method: string) =>
  `… ${remaining} kỳ tiếp theo · ${method.toLowerCase()}`;
