import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EkycCaptureScreen, EkycResultScreen, LivenessScreen } from '@/features/ekyc';
import type { EkycStackParamList } from './types';

const Stack = createNativeStackNavigator<EkycStackParamList>();

/**
 * Định danh điện tử — chạy sau khi đã có phiên đăng nhập và trước khi vào app chính.
 * Mỗi màn tự vẽ tiêu đề bằng `PHeader` nên tắt header mặc định của stack.
 */
export default function EkycNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="EkycCapture" component={EkycCaptureScreen} />
      <Stack.Screen name="Liveness" component={LivenessScreen} />
      <Stack.Screen name="EkycResult" component={EkycResultScreen} />
    </Stack.Navigator>
  );
}
