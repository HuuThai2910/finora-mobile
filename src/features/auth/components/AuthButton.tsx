import { StyleSheet } from 'react-native';
import { Button } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/theme';

type Props = React.ComponentProps<typeof Button>;

/** Nút chính của nhóm màn tài khoản theo mockup mới: bo tròn hai đầu, màu `authPrimary`. */
export default function AuthButton({ style, ...rest }: Props) {
  return <Button {...rest} style={[styles.button, style]} />;
}

const styles = StyleSheet.create({
  button: {
    marginTop: Spacing.sm,
    minHeight: 48,
    borderRadius: Radius.pill,
    backgroundColor: Colors.authPrimary,
  },
});
