import { NavigationContainer, type Theme } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
import { Screen } from '@/components/phone';
import { LoadingScreen } from '@/components/feedback';
import { useAuth } from '@/providers/AuthProvider';
import AuthNavigator from './AuthNavigator';
import EkycNavigator from './EkycNavigator';
import MainTabs from './MainTabs';

/** Chủ đề điều hướng khớp bảng màu của mockup. */
const navTheme: Theme = {
  dark: false,
  colors: {
    primary: Colors.brand,
    background: Colors.bg,
    card: Colors.card,
    text: Colors.ink,
    border: Colors.line,
    notification: Colors.red,
  },
};

/**
 * Chọn luồng theo trạng thái phiên, thay vì để từng màn hình tự điều hướng:
 * chưa đăng nhập thì vào luồng xác thực, đã đăng nhập nhưng chưa xong eKYC thì
 * vào luồng định danh, xong cả hai mới vào app chính.
 *
 * Lúc mở app phải chờ khôi phục phiên cũ xong mới quyết định, nếu không người
 * dùng đã đăng nhập vẫn thấy màn đăng nhập nhấp nháy một nhịp.
 */
export default function RootNavigator() {
  const { session, kycCompleted, restoring } = useAuth();

  if (restoring) {
    return (
      <Screen light>
        <LoadingScreen cards={2} />
      </Screen>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {!session ? <AuthNavigator /> : !kycCompleted ? <EkycNavigator /> : <MainTabs />}
    </NavigationContainer>
  );
}
