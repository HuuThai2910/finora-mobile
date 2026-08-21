import { Linking, StyleSheet, Text, View } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { Button, Icon } from '@/components/ui';

/**
 * Chỉ dựng camera khi người dùng đã cho quyền.
 *
 * Hai trạng thái từ chối phải xử lý khác nhau: lần đầu còn hỏi lại được, còn
 * khi hệ điều hành đã chặn vĩnh viễn (`canAskAgain === false`) thì chỉ mở được
 * Cài đặt. Gộp chung sẽ tạo nút bấm không có tác dụng gì.
 */
export default function CameraPermissionGate({ children }: { children: React.ReactNode }) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.body}>Đang kiểm tra quyền camera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    const blockedForever = !permission.canAskAgain;

    return (
      <View style={styles.center}>
        <Icon name="scan" size={56} color={Colors.brand} />
        <Text style={styles.title} accessibilityRole="header">
          Cần quyền camera
        </Text>
        <Text style={styles.body}>
          {blockedForever
            ? 'Bạn đã tắt quyền camera cho FINORA. Hãy bật lại trong Cài đặt để tiếp tục định danh.'
            : 'FINORA cần camera để chụp CCCD và xác minh khuôn mặt. Ảnh chỉ dùng cho lần xác minh này.'}
        </Text>
        <Button
          label={blockedForever ? 'Mở Cài đặt' : 'Cho phép truy cập'}
          icon="scan"
          onPress={() => {
            if (blockedForever) {
              void Linking.openSettings();
              return;
            }
            void requestPermission();
          }}
          style={styles.action}
        />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    // Không dùng flex:1 — component này nằm trong ScrollView của `Screen`,
    // flex:1 ở đó sẽ co về 0 và làm mất phần giải thích.
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.section,
    paddingHorizontal: Spacing.xl,
  },
  title: { ...Text_.heading, color: Colors.ink, textAlign: 'center' },
  body: { ...Text_.body, color: Colors.ink3, textAlign: 'center' },
  action: { marginTop: Spacing.lg, alignSelf: 'stretch' },
});
