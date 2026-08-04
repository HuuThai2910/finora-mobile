import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
  BeVietnamPro_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/be-vietnam-pro';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';

/**
 * Nạp Be Vietnam Pro — đúng font của mockup.
 * Giữ màn chờ cho tới khi font sẵn sàng để chữ không nhảy cỡ sau khi tải xong.
 */
export function FontProvider({ children }: { children: React.ReactNode }) {
  const [loaded, error] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
    BeVietnamPro_800ExtraBold,
  });

  // Không nạp được font thì vẫn cho vào app với font hệ thống, hơn là chặn đứng.
  if (!loaded && !error) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={Colors.cyanBright} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: Colors.navy, alignItems: 'center', justifyContent: 'center' },
});
