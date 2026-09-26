import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';
import DetailButton from './DetailButton';

type Props = {
  /** Nguyên nhân viết cho người dùng đọc (đã qua `toLoadError`). */
  message: string;
  retrying: boolean;
  onRetry: () => void;
};

/**
 * Không tải được hồ sơ: thẻ trắng nằm dưới đầu trang (vẫn có nút quay lại và mã
 * hồ sơ) thay vì cả màn trống, luôn chỉ ra lối thử lại.
 */
export default function ApplicationDetailError({ message, retrying, onRetry }: Props) {
  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <View style={styles.tile}>
        <Icon name="alert" size={26} color={Colors.red} />
      </View>
      <Text style={styles.title}>{message}</Text>
      <Text style={styles.hint}>Kiểm tra kết nối mạng rồi thử lại.</Text>
      <View style={styles.action}>
        <DetailButton label="Thử lại" onPress={onRetry} loading={retrying} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xxxl,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  tile: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    backgroundColor: Colors.redBg,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    lineHeight: 24,
    color: Colors.authInk,
    textAlign: 'center',
  },
  hint: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.authMuted,
    textAlign: 'center',
  },
  action: { minWidth: 180, marginTop: Spacing.md },
});
