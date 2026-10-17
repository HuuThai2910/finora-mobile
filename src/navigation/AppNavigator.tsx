import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AssistantChatScreen } from '@/features/assistant';
import MainTabs from './MainTabs';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Stack gốc của phiên đăng nhập: bốn tab ở `Main`, trợ lý là modal toàn màn hình trượt từ đáy.
 *
 * Dùng `fullScreenModal` thay cho `modal`: trên iOS `modal` là tấm trang chừa mép trên nên khoảng an
 * toàn đo được không khớp đầu màn chat; toàn màn hình thì đầu màn và ô nhập luôn đúng chỗ trên mọi
 * máy. Android và web hiển thị như nhau ở cả hai kiểu.
 */
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="Assistant"
        component={AssistantChatScreen}
        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
