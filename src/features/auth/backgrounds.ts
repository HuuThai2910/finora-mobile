import type { ImageSourcePropType } from 'react-native';

/**
 * Một ảnh nền của nhóm màn tài khoản (ảnh do Hải tạo, 1024×1536): minh hoạ ở
 * trên, khoảng trắng ở giữa, lớp sóng ở đáy. `AuthLayout` chỉ lấy hai dải
 * trên/dưới, phần giữa thay bằng nền trắng; mỗi ảnh có bố cục riêng nên đường
 * cắt, độ phóng và độ lệch được đo riêng cho từng ảnh.
 */
export type AuthBackground = {
  source: ImageSourcePropType;
  width: number;
  height: number;
  /** Từ hàng này trở xuống ảnh đã trắng tinh: phần trên là minh hoạ đầu trang. */
  heroEnd: number;
  /** Từ hàng này trở xuống là lớp sóng đáy. */
  wavesStart: number;
  /** Ảnh rộng gấp bao nhiêu lần màn. */
  zoom: number;
  /** Mép trái ảnh lệch bao nhiêu pt so với mép màn (tính theo mockup rộng 393pt). */
  shift: number;
  /**
   * Chỉ với ảnh chừa chỗ trên mép sóng: tiêu đề màn đặt dưới phần minh hoạ,
   * đỉnh khối tiêu đề cách mép trên bấy nhiêu pt (theo mockup 393pt).
   */
  headingTop?: number;
};

/**
 * Robot cầm đồng xu. Phóng 1,107 và lệch -18pt để chữ bên trái (kể cả tiêu đề
 * "Tạo tài khoản") không lấn vào đồng xu; phần bị cắt chỉ là khoảng trống bên
 * trái và chồng xu sát mép phải.
 */
export const LOGIN_BACKGROUND: AuthBackground = {
  source: require('@/assets/login-background.png'),
  width: 1024,
  height: 1536,
  heroEnd: 720,
  wavesStart: 1000,
  zoom: 1.107,
  shift: -18,
};

/**
 * Robot cầm phong thư. Số đo khớp mockup quên mật khẩu (tai robot sát mép
 * phải). Mép sóng bên trái chừa chỗ cho tiêu đề ngang tầm phong thư.
 */
export const FORGOT_PASSWORD_BACKGROUND: AuthBackground = {
  source: require('@/assets/forgot-password-background.png'),
  width: 1024,
  height: 1536,
  heroEnd: 700,
  wavesStart: 1075,
  zoom: 1.113,
  shift: -34,
  headingTop: 238,
};

/**
 * Robot cầm khiên (hai màn nhập mã OTP). Mockup vẽ lại robot theo bố cục khác
 * ảnh nên không khớp mốc được; giữ độ phóng như màn đăng nhập, lệch để tai robot
 * sát mép phải, và đặt tiêu đề ngay dưới hình, cách robot ~30pt như mockup.
 */
export const OTP_BACKGROUND: AuthBackground = {
  source: require('@/assets/otp-background.png'),
  width: 1024,
  height: 1536,
  heroEnd: 710,
  wavesStart: 1075,
  zoom: 1.107,
  shift: -32,
  headingTop: 306,
};

/**
 * Robot cầm ổ khoá (màn đặt lại mật khẩu). Ảnh cùng bố cục với ảnh OTP nên đo
 * theo cùng cách: giữ độ phóng, lệch để tai robot sát mép phải (khiên góc trên
 * bị cắt nhẹ ở mép). Tiêu đề được Hải yêu cầu đưa cao hơn mockup: chữ nằm bên
 * trái robot, dưới ổ khoá, nên vẫn trên nền trắng; dòng phụ trải hết bề ngang
 * vẫn nằm dưới đáy robot (~278pt).
 */
export const RESET_PASSWORD_BACKGROUND: AuthBackground = {
  source: require('@/assets/reset-password-background.png'),
  width: 1024,
  height: 1536,
  heroEnd: 700,
  wavesStart: 1060,
  zoom: 1.107,
  shift: -19,
  headingTop: 272,
};
