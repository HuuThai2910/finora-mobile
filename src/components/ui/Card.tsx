import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, Shadow, Spacing } from '@/theme';

type Props = {
  children: React.ReactNode;
  /** Bỏ padding khi nội dung tự quản lý lề (ví dụ danh sách chia dòng). */
  flush?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** `.card` của mockup — nền trắng, viền `--line`, bóng nhẹ bậc `sm`. */
export default function Card({ children, flush = false, style }: Props) {
  return <View style={[styles.card, !flush && styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.xl,
    ...Shadow.sm,
  },
  padded: { padding: Spacing.xl },
});
