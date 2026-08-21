import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen, OtpScreen, RegisterScreen } from '@/features/auth';
import {
  EkycCaptureScreen,
  EkycResultScreen,
  EkycSessionProvider,
  LivenessScreen,
} from '@/features/ekyc';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Luồng vào ứng dụng: đăng nhập hoặc đăng ký → OTP → eKYC.
 * Mỗi màn tự vẽ tiêu đề bằng `PHeader` nên tắt header mặc định của stack.
 */
export default function AuthNavigator() {
  return (
    // Ảnh CCCD phải đi từ màn chụp sang màn xác minh mà không qua navigation
    // params, nên provider bọc cả stack và chết cùng luồng đăng nhập.
    <EkycSessionProvider>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="EkycCapture" component={EkycCaptureScreen} />
        <Stack.Screen name="Liveness" component={LivenessScreen} />
        <Stack.Screen name="EkycResult" component={EkycResultScreen} />
      </Stack.Navigator>
    </EkycSessionProvider>
  );
}
