import { createNavigationContainerRef } from '@react-navigation/native';
import type { TabParamList } from './types';

/**
 * Ref của `NavigationContainer` để điều hướng từ ngoài cây màn hình, ví dụ khi người dùng chạm vào thông báo đẩy.
 * Chỉ dùng sau khi `isReady()`; trong màn hình vẫn dùng `useNavigation`.
 */
export const navigationRef = createNavigationContainerRef<TabParamList>();
