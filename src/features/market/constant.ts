import type { CreditGrade } from '@/components/ui';
import type { TagTone } from '@/components/ui';

/**
 * Mockup tô tag theo hạng: A xanh lá, B xanh dương, C/D hổ phách.
 * Hạng E chỉ xuất hiện từ mô hình `finora-ai`, dùng tông đỏ.
 */
export const GRADE_TONE: Record<CreditGrade, TagTone> = {
  A: 'green',
  B: 'blue',
  C: 'amber',
  D: 'amber',
  E: 'red',
};

export const MARKET_NOTE =
  'Người vay ẩn danh. Tiền góp bị phong tỏa trong ví — chỉ chuyển đi khi gọi đủ 100% vốn và người vay ký số.';
