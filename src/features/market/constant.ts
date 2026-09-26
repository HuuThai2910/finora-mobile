import type { ImageSourcePropType } from 'react-native';
import type { CreditGrade, TagTone } from '@/components/ui';

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

/** Trên web và máy tính bảng, giữ cột nội dung cỡ điện thoại thay vì giãn theo cửa sổ. */
export const MARKET_MAX_WIDTH = 480;

/** Lề hai bên, cùng lề các màn đã vẽ theo mockup mới. */
export const MARKET_PADDING = 16;

/**
 * Banner đầu màn (2172×724, Hải tạo bằng ChatGPT): ba robot đứng bên phải, bên
 * trái là đồi và lá. Cột 393pt quá hẹp để trải cả ảnh (robot còn ~39pt, nhỏ hơn
 * hẳn mockup), nên ảnh phóng sao cho phần từ cột `cropLeft` tới mép phải vừa khít
 * bề rộng cột — ảnh canh phải, cả ba robot vẫn trọn trong khung. Mốc đo bằng PIL.
 */
export const MARKET_HERO: {
  source: ImageSourcePropType;
  width: number;
  height: number;
  cropLeft: number;
  /** Chân robot và chân chồng đồng xu: thẻ đầu tiên bắt đầu ngay dưới mốc này. */
  groundRow: number;
} = {
  source: require('@/assets/market-hero.png'),
  width: 2172,
  height: 724,
  cropLeft: 700,
  groundRow: 614,
};
