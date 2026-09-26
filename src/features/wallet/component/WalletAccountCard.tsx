import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Skeleton } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import { formatDong } from '@/utils/format';

type Props = {
  /** Số dư khả dụng; null khi chưa tải xong hoặc tải lỗi. */
  available: number | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

/** Ô icon ví; khung giả lúc tải dùng cùng số đo. */
const TILE = 44;

/**
 * Thẻ tài khoản đầu danh sách (mockup 26/09/2026): bên trái là ví Finora, bên
 * phải là số dư khả dụng hiện tại. Số dư tải riêng với danh sách giao dịch nên
 * có trạng thái tải/lỗi của riêng nó, không chặn danh sách bên dưới.
 */
export default function WalletAccountCard({ available, loading, error, onRetry }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.account} accessible accessibilityLabel="Tài khoản ví: Ví Finora">
        <View style={styles.tile}>
          <Icon name="wallet" size={22} color={Colors.authPrimary} />
        </View>
        <View style={styles.accountText}>
          <Text style={styles.label} maxFontSizeMultiplier={1.4}>
            Tài khoản ví
          </Text>
          <Text style={styles.name} numberOfLines={1} maxFontSizeMultiplier={1.4}>
            Ví Finora
          </Text>
        </View>
      </View>

      <View style={styles.balance}>
        <Text style={styles.label} maxFontSizeMultiplier={1.4}>
          Số dư hiện tại
        </Text>
        <Balance available={available} loading={loading} error={error} onRetry={onRetry} />
      </View>
    </View>
  );
}

function Balance({ available, loading, error, onRetry }: Props) {
  if (available === null && loading) {
    return <Skeleton width={120} height={22} radius={6} style={styles.skeleton} />;
  }

  if (available === null) {
    return (
      <Pressable
        onPress={onRetry}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel={`${error ?? 'Chưa tải được số dư'}. Tải lại số dư`}
        style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
      >
        <Icon name="refreshCw" size={14} color={Colors.authPrimary} strokeWidth={2.2} />
        <Text style={styles.retryText}>Thử lại</Text>
      </Pressable>
    );
  }

  const value = formatDong(available);
  return (
    <Text
      style={styles.value}
      // Số dư lớn thì thu nhỏ cho vừa một dòng, không bẻ đôi con số.
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.7}
      maxFontSizeMultiplier={1.4}
      accessibilityLabel={`Số dư hiện tại ${value}`}
    >
      {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  account: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 12,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountText: { flexShrink: 1, minWidth: 0 },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.authMuted,
  },
  name: {
    marginTop: 2,
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.authInk,
  },
  // Cột số dư canh phải và không co: con số luôn đủ, phần tên ví nhường chỗ.
  balance: { flexShrink: 0, maxWidth: '58%', alignItems: 'flex-end' },
  value: {
    marginTop: 2,
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
    color: Colors.authInk,
    ...tabularNums,
  },
  skeleton: { marginTop: 4 },
  retry: {
    minHeight: MIN_TOUCH - 18,
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  retryText: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authPrimary },
  pressed: { opacity: 0.6 },
});
