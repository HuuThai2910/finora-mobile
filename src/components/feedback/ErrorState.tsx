import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing, Text_ } from '@/theme';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';

type Props = {
  /** Nguyên nhân, viết cho người dùng đọc chứ không phải log. */
  message?: string;
  /** Cách khắc phục. Mọi lỗi phải chỉ được lối ra. */
  hint?: string;
  onRetry?: () => void;
};

/** Trạng thái lỗi kèm lối phục hồi. */
export default function ErrorState({
  message = 'Không tải được dữ liệu.',
  hint = 'Kiểm tra kết nối mạng rồi thử lại.',
  onRetry,
}: Props) {
  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <View style={styles.icon}>
        <Icon name="alert" size={IconSize.xl} color={Colors.red} />
      </View>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.hint}>{hint}</Text>
      {onRetry ? <Button label="Thử lại" variant="outline" onPress={onRetry} style={styles.btn} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: Spacing.page, gap: Spacing.lg },
  icon: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    backgroundColor: Colors.redBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  message: { ...Text_.title, color: Colors.ink, textAlign: 'center' },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center' },
  btn: { marginTop: Spacing.md, minWidth: 160 },
});
