import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Field } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/theme';

type Props = {
  error: string | null;
  onSubmit: (password: string) => void;
};

/**
 * Bước đầu của "Quên mã PIN?": nhập lại mật khẩu đăng nhập. Mật khẩu chỉ nằm trong state của
 * bảng cho tới khi gửi cùng PIN mới; backend mới là nơi kiểm tra đúng sai (`PASSWORD_INCORRECT`).
 */
export default function PinPasswordForm({ error, onSubmit }: Props) {
  const [password, setPassword] = useState('');

  return (
    <View style={styles.wrap}>
      <Field
        label="Mật khẩu đăng nhập"
        value={password}
        onChangeText={setPassword}
        secure
        required
        autoComplete="current-password"
        autoCapitalize="none"
        error={error ?? undefined}
      />
      <Button label="Tiếp tục" onPress={() => onSubmit(password)} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: Spacing.xl },
  button: { minHeight: 48, borderRadius: Radius.pill, backgroundColor: Colors.authPrimary },
});
