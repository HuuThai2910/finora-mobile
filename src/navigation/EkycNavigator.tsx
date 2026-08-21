import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EkycCaptureScreen, EkycResultScreen, EkycSessionProvider } from '@/features/ekyc';
import type { EkycStackParamList } from './types';

const Stack = createNativeStackNavigator<EkycStackParamList>();

/**
 * Định danh điện tử — chạy sau khi đã có phiên đăng nhập và trước khi vào app chính.
 * Mỗi màn tự vẽ tiêu đề bằng `PHeader` nên tắt header mặc định của stack.
 *
 * Ảnh CCCD phải đi từ màn chụp sang màn xác minh mà không qua navigation params,
 * nên `EkycSessionProvider` bọc cả stack và chết cùng luồng định danh.
 */
export default function EkycNavigator() {
  return (
    <EkycSessionProvider>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="EkycCapture" component={EkycCaptureScreen} />
        <Stack.Screen name="EkycResult" component={EkycResultScreen} />
      </Stack.Navigator>
    </EkycSessionProvider>
  );
}
