import { NavigationContainer, type Theme } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
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

/** Vào được app chính khi đã đăng nhập và hoàn tất eKYC. */
export default function RootNavigator() {
  const { session, kycCompleted } = useAuth();
  const signedIn = !!session && kycCompleted;

  return (
    <NavigationContainer theme={navTheme}>
      {signedIn ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
