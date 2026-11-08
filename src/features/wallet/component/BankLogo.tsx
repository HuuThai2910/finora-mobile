import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Radius } from '@/theme';

type Props = {
  uri?: string | null;
  size?: number;
};

/**
 * Logo ngân hàng từ CDN của VietQR, đặt trên nền trắng bo góc vì logo có nền trong suốt. Chưa có URL, mất mạng hay
 * ảnh lỗi thì hiện biểu tượng ngân hàng chung thay vì ô trống. Logo chỉ để nhận diện nhanh nên ẩn khỏi trình đọc màn
 * hình; tên ngân hàng luôn có ở chữ bên cạnh.
 */
export default function BankLogo({ uri, size = 40 }: Props) {
  const [failed, setFailed] = useState(false);
  const box = { width: size, height: size };

  return (
    <View style={[styles.box, box]} accessible={false} importantForAccessibility="no-hide-descendants">
      {uri && !failed ? (
        <Image source={{ uri }} style={styles.image} resizeMode="contain" onError={() => setFailed(true)} />
      ) : (
        <Icon name="bank" size={size * 0.5} color={Colors.authPrimary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    backgroundColor: Colors.card,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
});
