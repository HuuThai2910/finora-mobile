import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';
import { LOAN_HERO_MASCOT } from '../constant';

type Action = { label: string; onPress: () => void };

type Props = {
  /** Biểu tượng trong ô tròn; bỏ trống thì hiện robot cầm đồng xu (dùng khi đặt lệnh xong). */
  icon?: IconName;
  danger?: boolean;
  title: string;
  message: string;
  primary?: Action;
  secondary?: Action;
};

/**
 * Thẻ trạng thái của màn chi tiết khoản vay: lỗi tải, khoản vay không nhận vốn nữa, và kết quả sau
 * khi đặt lệnh (robot chào như màn kết quả đặt lệnh của chợ Notes). Luôn chỉ ra việc làm tiếp theo.
 */
export default function LoanStatusCard({ icon, danger = false, title, message, primary, secondary }: Props) {
  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      {icon ? (
        <View style={[styles.tile, { backgroundColor: danger ? Colors.redBg : Colors.tintBlue }]}>
          <Icon name={icon} size={26} color={danger ? Colors.red : Colors.authPrimary} />
        </View>
      ) : (
        <Image
          source={LOAN_HERO_MASCOT}
          resizeMode="contain"
          style={styles.mascot}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      )}
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {primary ? (
        <Pressable
          onPress={primary.onPress}
          accessibilityRole="button"
          accessibilityLabel={primary.label}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText} maxFontSizeMultiplier={1.3}>{primary.label}</Text>
        </Pressable>
      ) : null}
      {secondary ? (
        <Pressable
          onPress={secondary.onPress}
          accessibilityRole="button"
          accessibilityLabel={secondary.label}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText} maxFontSizeMultiplier={1.3}>{secondary.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  tile: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  // Ảnh robot 480×510 đã cắt sát; giữ đúng tỉ lệ.
  mascot: { width: 132, height: 140, marginBottom: Spacing.sm },
  title: { fontFamily: FontFamily.extrabold, fontSize: 18, lineHeight: 26, color: Colors.authInk, textAlign: 'center' },
  message: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 21, color: Colors.authMuted, textAlign: 'center' },
  primary: {
    alignSelf: 'stretch',
    minHeight: 48,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
    backgroundColor: Colors.authPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 22, color: Colors.onDark },
  secondary: { minHeight: MIN_TOUCH, paddingHorizontal: Spacing.xl, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.authPrimary },
  pressed: { opacity: 0.75 },
});
