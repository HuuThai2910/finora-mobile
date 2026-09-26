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
