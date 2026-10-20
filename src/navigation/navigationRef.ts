import { createNavigationContainerRef } from '@react-navigation/native';
import type { AppStackParamList } from './types';

/**
 * Ref của `NavigationContainer` để điều hướng từ ngoài cây màn hình, ví dụ khi người dùng chạm vào thông báo đẩy.
 * Chỉ dùng sau khi `isReady()`; trong màn hình vẫn dùng `useNavigation`. Gốc là stack của `AppNavigator`: bốn tab nằm
 * trong `Main`, Trợ lý FINORA là modal phủ lên.
 */
export const navigationRef = createNavigationContainerRef<AppStackParamList>();
