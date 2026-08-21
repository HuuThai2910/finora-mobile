import { NavigationContainer, type Theme } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
import { Screen } from '@/components/phone';
import { LoadingScreen } from '@/components/feedback';
import { useAuth } from '@/providers/AuthProvider';
import AuthNavigator from './AuthNavigator';
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
 * Chọn luồng theo trạng thái phiên: chưa đăng nhập thì vào luồng xác thực,
 * có phiên là vào thẳng app chính. eKYC không còn bị ép sau đăng nhập —
 * nó là chức năng tuỳ chọn trong tab Hồ sơ.
 *
 * Lúc mở app phải chờ khôi phục phiên cũ xong mới quyết định, nếu không người
 * dùng đã đăng nhập vẫn thấy màn đăng nhập nhấp nháy một nhịp.
 */
export default function RootNavigator() {
  const { session, restoring } = useAuth();

  if (restoring) {
    return (
      <Screen light>
        <LoadingScreen cards={2} />
      </Screen>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {session ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
