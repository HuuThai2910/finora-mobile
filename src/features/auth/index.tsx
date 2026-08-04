/** Cửa ra công khai của feature `auth`. Feature khác chỉ được import qua đây. */
export { default as LoginScreen } from './component/LoginScreen';
export { default as OtpScreen } from './component/OtpScreen';
export { default as RegisterScreen } from './component/RegisterScreen';
export { getProfile } from './api';
export { APP_NAME, APP_TAGLINE } from './constant';
