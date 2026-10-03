import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius } from '@/theme';
import type { OrderSide } from '@/types/orderBook';
import PinnedBar from './PinnedBar';

/** Cao 48pt như nút chính của các màn đã vẽ lại. */
const BUTTON_HEIGHT = 48;

/**
 * Hai nút Mua / Bán ghim đáy sổ lệnh, cùng cặp nút đặc + nút viền xanh `authPrimary` của các màn
 * khác. Hai khối xanh lá và đỏ đặc cạnh nhau đè lên thẻ giá xanh dương nên bỏ; chiều lệnh vẫn ghi
 * rõ bằng chữ, còn màu xanh lá/đỏ để dành cho bậc giá trong sổ và công tắc chiều ở form đặt lệnh.
 */
export default function BookActionBar({ onOrder }: { onOrder: (side: OrderSide) => void }) {
  return (
    <PinnedBar>
      <SideButton label="Mua Note" onPress={() => onOrder('BID')} />
      <SideButton label="Bán Note" variant="outline" onPress={() => onOrder('ASK')} />
    </PinnedBar>
  );
}

/** Nút pill của chợ Notes; dùng cả ở đáy sổ lệnh và đáy form đặt lệnh. */
export function SideButton({
  label,
  onPress,
  variant = 'solid',
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
  disabled?: boolean;
  loading?: boolean;
}) {
  const inactive = disabled || loading;
  const outline = variant === 'outline';
  const fg = outline ? Colors.authPrimary : Colors.onDark;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      android_ripple={{ color: outline ? Colors.tintBlue : Colors.onDarkFaint }}
      style={({ pressed }) => [
        styles.button,
        outline ? styles.outline : styles.solid,
        pressed && styles.pressed,
        inactive && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <Text style={[styles.label, { color: fg }]} maxFontSizeMultiplier={1.3}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: BUTTON_HEIGHT,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solid: { backgroundColor: Colors.authPrimary },
  outline: { borderWidth: 1.5, borderColor: Colors.authPrimary, backgroundColor: Colors.card },
  pressed: { opacity: 0.85 },
  inactive: { opacity: 0.45 },
  label: { fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 22 },
});
