import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, MIN_TOUCH, tabularNums } from '@/theme';
import { Icon } from '@/components/ui';
import { Skeleton } from '@/components/feedback';
import { formatDong } from '@/utils/format';
import { WALLET_MASCOT } from '../constant';

export type WalletAction = { icon: IconName; label: string; onPress: () => void };

type Props = {
  /** Số dư khả dụng; null khi chưa tải xong hoặc tải lỗi. */
  available: number | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenWallet: () => void;
  /** Bốn nút tắt dưới số dư (mockup: Nạp, Rút, Vay, Hồ sơ). */
  actions: readonly WalletAction[];
  /** Bề rộng thẻ; mascot và cỡ số dư co giãn theo nó. */
  width: number;
};

/** Nút tròn mở ví ở góc trên-phải; vùng chạm nới ra đủ 44pt bằng hitSlop. */
const OPEN_SIZE = 26;

/** Bề rộng thẻ ví trong mockup (màn 393pt trừ lề hai bên). */
const DESIGN_WIDTH = 361;

/**
 * Số dư và mascot nằm cạnh nhau trên cùng một hàng, nên co giãn cùng tỉ lệ với
 * thẻ: máy màn hẹp vẫn thấy đủ số tiền mà chữ không đè lên đồng xu của mascot.
 * Chặn hai đầu để máy tính bảng không phóng chữ quá to.
 */
function unitFor(width: number): number {
  return Math.min(1.1, Math.max(0.85, width / DESIGN_WIDTH));
}

/**
 * Thẻ ví trên trang chủ: số dư (bấm hình con mắt để che khi đứng nơi đông
 * người), nút mở ví, mascot robot và bốn nút tắt. Mascot vẽ trước nên nằm dưới
 * chữ và các ô nút tắt trong suốt, đúng thứ tự lớp của mockup.
 */
export default function WalletCard({
  available,
  loading,
  error,
  onRetry,
  onOpenWallet,
  actions,
  width,
}: Props) {
  const [hidden, setHidden] = useState(false);
  const u = unitFor(width);
  // Ảnh đã cắt sát hình robot (480×510); đỉnh ăng-ten chạm mép trên thẻ như mockup.
  const mascot = { top: 1, right: 38 * u, width: 116 * u, height: 123 * u };
  const valueSize = { fontSize: Math.round(28 * u), lineHeight: Math.round(36 * u) };

  return (
    <LinearGradient
      colors={[Colors.walletFrom, Colors.walletVia, Colors.walletTo]}
      // Tối ở góc dưới-trái nơi có chữ và nút tắt (đủ tương phản cho chữ trắng),
      // sáng dần lên góc trên-phải nơi chỉ có mascot.
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.card}
    >
      <Image
        source={WALLET_MASCOT}
        resizeMode="contain"
        style={[styles.mascot, mascot]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />

      <Pressable
        onPress={onOpenWallet}
        hitSlop={(MIN_TOUCH - OPEN_SIZE) / 2}
        accessibilityRole="button"
        accessibilityLabel="Mở ví"
        style={({ pressed }) => [styles.open, pressed && styles.pressed]}
      >
        <Icon name="chevronRight" size={16} color={Colors.onDark} strokeWidth={2.4} />
      </Pressable>

      <View style={styles.labelRow}>
        <Text style={styles.label}>Số dư ví</Text>
        <Pressable
          onPress={() => setHidden(h => !h)}
          hitSlop={(MIN_TOUCH - 18) / 2}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Hiện số dư' : 'Ẩn số dư'}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Icon name={hidden ? 'eyeOff' : 'eye'} size={18} color={Colors.onDarkMuted} />
        </Pressable>
      </View>

      <Balance
        available={available}
        hidden={hidden}
        loading={loading}
        error={error}
        onRetry={onRetry}
        valueSize={valueSize}
      />

      <View style={styles.actions}>
        {actions.map(a => (
          <Pressable
            key={a.label}
            onPress={a.onPress}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <View style={styles.tile}>
              <Icon name={a.icon} size={24} color={Colors.onDark} strokeWidth={1.8} />
            </View>
            <Text style={styles.actionLabel} numberOfLines={1} maxFontSizeMultiplier={1.3}>
              {a.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </LinearGradient>
  );
}

type BalanceProps = Pick<Props, 'available' | 'loading' | 'error' | 'onRetry'> & {
  hidden: boolean;
  valueSize: { fontSize: number; lineHeight: number };
};

function Balance({ available, hidden, loading, error, onRetry, valueSize }: BalanceProps) {
  if (available === null && loading) {
    return <Skeleton width={180} height={30} radius={8} style={styles.skeleton} />;
  }

  if (available === null) {
    return (
      <View style={styles.errorRow} accessibilityLiveRegion="polite">
        <Text style={styles.errorText} numberOfLines={2}>
          {error ?? 'Chưa tải được số dư.'}
        </Text>
        <Pressable
          onPress={onRetry}
          hitSlop={(MIN_TOUCH - 30) / 2}
          accessibilityRole="button"
          accessibilityLabel="Tải lại số dư"
          style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  const value = formatDong(available);
  return (
    <Text
      style={[styles.value, valueSize]}
      // Số dư lớn thì thu nhỏ cho vừa một dòng, không lấn sang mascot.
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.6}
      accessibilityLabel={hidden ? 'Số dư đang ẩn' : `Số dư ví ${value}`}
    >
      {hidden ? '••••••••' : value}
    </Text>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  mascot: { position: 'absolute' },
  open: {
    position: 'absolute',
    top: 13,
    right: 13,
    width: OPEN_SIZE,
    height: OPEN_SIZE,
    borderRadius: OPEN_SIZE / 2,
    backgroundColor: Colors.walletChip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.65 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 20 },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onDarkMuted,
  },
  value: {
    fontFamily: FontFamily.bold,
    letterSpacing: -0.3,
    color: Colors.onDark,
    marginTop: 2,
    maxWidth: '64%',
    ...tabularNums,
  },
  skeleton: { marginTop: 5, marginBottom: 3, backgroundColor: Colors.walletTile },
  errorRow: { marginTop: 2, maxWidth: '64%', gap: 6, alignItems: 'flex-start' },
  errorText: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 19,
    color: Colors.onDark,
  },
  retry: {
    minHeight: 30,
    paddingHorizontal: 14,
    borderRadius: 15,
    justifyContent: 'center',
    backgroundColor: Colors.walletTile,
  },
  retryText: { fontFamily: FontFamily.semibold, fontSize: 13, color: Colors.onDark },
  // Hàng nút tắt rộng hơn phần chữ một chút (lề 9pt thay vì 18pt) như mockup.
  actions: { flexDirection: 'row', marginTop: 16, marginHorizontal: -9 },
  action: { flex: 1, alignItems: 'center', minHeight: MIN_TOUCH },
  tile: {
    width: 52,
    height: 48,
    borderRadius: 13,
    backgroundColor: Colors.walletTile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onDark,
    marginTop: 7,
  },
});
