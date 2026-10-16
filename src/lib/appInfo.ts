import { Platform } from 'react-native';
import appConfig from '../../app.json';

/**
 * Phiên bản ứng dụng khai trong `app.json`. Đọc thẳng từ cấu hình thay vì thêm
 * `expo-constants` vào dependency chỉ để lấy một chuỗi; dùng để ghi kèm bản ghi đồng ý
 * eKYC (đối chiếu người dùng đã đọc điều khoản trên bản app nào).
 */
export const APP_VERSION: string = appConfig.expo.version;

/** Nền tảng theo đúng giá trị các service FINORA ghi nhận: `ios`, `android` hoặc `web`. */
export const CLIENT_PLATFORM: 'ios' | 'android' | 'web' =
  Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web';
