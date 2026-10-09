import type { ImageSourcePropType } from 'react-native';
import type { CreditGrade, TagTone } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import type { FundingState, InvestBlock } from './investRules';

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

/* ---------- Màn chi tiết khoản vay: xem và góp vốn (cùng bộ với sổ lệnh chợ Notes) ---------- */

/** Robot cầm đồng xu (toàn thân, 480×510) — góc phải thẻ đầu màn, như thẻ giá của sổ lệnh. */
export const LOAN_HERO_MASCOT: ImageSourcePropType = require('@/assets/mascot-coin.png');

/** Robot nửa người cầm đồng xu (480×459, nền trong) — góc thẻ "Tạm tính", như form đặt lệnh. */
export const ESTIMATE_MASCOT: ImageSourcePropType = require('@/assets/mascot-coin-bust.png');

/** Số tiền điền sẵn khi mở màn (giữ mức của màn cũ), tự kẹp vào khoảng đặt được của từng khoản. */
export const DEFAULT_INVEST_AMOUNT = 5_000_000;

export const INVEST_NOTE =
  'Tiền được giữ tạm trong ví ngay khi đặt lệnh và chỉ chuyển đi khi khoản vay gọi đủ 100% vốn và các bên ký hợp đồng. Note bắt đầu sinh lãi khi khoản vay giải ngân.';

/** Viên trạng thái ở đầu màn: chấm màu luôn đi kèm chữ. */
export const FUNDING_STATE_BADGE: Record<FundingState, { label: string; dot: string }> = {
  OPEN: { label: 'Đang gọi vốn', dot: Colors.authPrimary },
  EXPIRED: { label: 'Hết hạn gọi vốn', dot: Colors.amber },
  FULLY_FUNDED: { label: 'Đã đủ vốn', dot: Colors.bookLive },
  CLOSED: { label: 'Đã đóng', dot: Colors.dotIdle },
  CANCELLED: { label: 'Đã huỷ', dot: Colors.bookAsk },
  UNKNOWN: { label: 'Chưa mở', dot: Colors.dotIdle },
};

const PICK_ANOTHER = 'Chọn khoản vay khác đang gọi vốn trên sàn.';

/** Thay chỗ ô nhập số tiền khi khoản vay không nhận lệnh mới nữa. */
export const INVEST_BLOCK_COPY: Record<InvestBlock, { icon: IconName; title: string; hint: string }> = {
  EXPIRED: { icon: 'clock', title: 'Đã hết hạn gọi vốn', hint: `Khoản vay này không nhận thêm lệnh mới. ${PICK_ANOTHER}` },
  FULLY_FUNDED: { icon: 'circleCheck', title: 'Khoản vay đã gọi đủ vốn', hint: `Không còn phần vốn nào để góp. ${PICK_ANOTHER}` },
  CLOSED: { icon: 'lock', title: 'Khoản vay đã đóng gọi vốn', hint: `Khoản vay này không nhận thêm lệnh mới. ${PICK_ANOTHER}` },
  CANCELLED: { icon: 'circleX', title: 'Đợt gọi vốn đã bị huỷ', hint: `Khoản vay này không nhận thêm lệnh mới. ${PICK_ANOTHER}` },
  UNKNOWN: { icon: 'info', title: 'Khoản vay chưa mở nhận vốn', hint: `Khoản vay này chưa nhận lệnh góp vốn. ${PICK_ANOTHER}` },
  BELOW_MINIMUM: {
    icon: 'info',
    title: 'Còn thiếu dưới mức tối thiểu',
    hint: `Khoản vay chỉ còn thiếu ít hơn mức đầu tư tối thiểu của một lệnh nên không đặt thêm được. ${PICK_ANOTHER}`,
  },
};
