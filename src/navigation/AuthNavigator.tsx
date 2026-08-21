import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ForgotPasswordScreen,
  LoginScreen,
  RegisterOtpScreen,
  RegisterScreen,
  ResetOtpScreen,
  ResetPasswordScreen,
} from '@/features/auth';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Luồng dành cho người chưa có phiên: đăng nhập, đăng ký kèm xác thực email,
 * và nhánh phụ quên mật khẩu. eKYC nằm ở stack riêng vì cần phiên đăng nhập.
 * Mỗi màn tự vẽ tiêu đề bằng `PHeader` nên tắt header mặc định của stack.
 */
export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RegisterOtp" component={RegisterOtpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetOtp" component={ResetOtpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
