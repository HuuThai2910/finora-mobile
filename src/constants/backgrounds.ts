import type { ImageSourcePropType } from 'react-native';
import { Colors } from './colors';

/**
 * Ảnh nền sóng gần vuông dùng chung cho nhiều màn (do Hải tạo). Ảnh vuông còn
 * màn thì dài, nên `WaveBackdrop` chỉ lấy dải sóng trên và dải sóng đáy; khoảng
 * giữa là dải màu nối đúng màu ở hai đường cắt để không lộ vết ghép.
 */
export type WaveBackground = {
  source: ImageSourcePropType;
  width: number;
  height: number;
  /** Hết hàng này ảnh đã là nền trơn: phía trên là lớp sóng đầu trang. */
  topEnd: number;
  /** Từ hàng này trở xuống là lớp sóng đáy. */
  bottomStart: number;
  /** Ảnh rộng gấp bao nhiêu lần cột nội dung. */
  zoom: number;
  /** Phần ảnh giữ lại theo chiều ngang khi phóng: 0 là mép trái, 1 là mép phải. */
  focusX: number;
  /** Màu ảnh ở hàng `topEnd` và hàng `bottomStart`, hai đầu của dải màu giữa. */
  middleFrom: string;
  middleTo: string;
};

/**
 * Nền sóng của trang chủ (1199×1312), cũng dùng cho màn Thông tin tài khoản.
 * Phóng 1,6 lần để dải sóng đậm nằm sau lời chào của trang chủ như mockup.
 */
export const HOME_WAVES: WaveBackground = {
  source: require('@/assets/home-background.png'),
  width: 1199,
  height: 1312,
  topEnd: 600,
  bottomStart: 1040,
  zoom: 1.6,
  focusX: 0.5,
  middleFrom: Colors.homeWaveMid,
  middleTo: Colors.homeWaveLow,
};

/**
 * Nền màn "Hợp đồng của tôi" (798×1971): sóng và hai linh vật cầm hợp đồng nằm
 * trọn trong 400 hàng đầu, bên dưới là nền trơn nên không có lớp sóng đáy
 * (`bottomStart` bằng chiều cao ảnh). Phóng đúng bề rộng cột như mockup.
 */
export const CONTRACTS_WAVES: WaveBackground = {
  source: require('@/assets/contracts-background.png'),
  width: 798,
  height: 1971,
  topEnd: 400,
  bottomStart: 1971,
  zoom: 1,
  focusX: 0.5,
  middleFrom: Colors.contractsFill,
  middleTo: Colors.contractsFill,
};

/**
 * Nền màn "Lịch sử ví" (798×1972, mockup 26/09/2026): đồi sóng và hai linh vật
 * giọt nước cầm đồng xu nằm trọn trong 420 hàng đầu, bên dưới là nền trơn (lệch
 * ≤ 3/255) nên không có lớp sóng đáy. Phóng đúng bề rộng cột như mockup.
 */
export const WALLET_HISTORY_WAVES: WaveBackground = {
  source: require('@/assets/wallet-background.png'),
  width: 798,
  height: 1972,
  topEnd: 420,
  bottomStart: 1972,
  zoom: 1,
  focusX: 0.5,
  middleFrom: Colors.walletHistoryFill,
  middleTo: Colors.walletHistoryFill,
};
