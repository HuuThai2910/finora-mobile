import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { AppStackParamList } from '@/navigation/types';
import { FontFamily, MIN_TOUCH, Radius, Spacing } from '@/theme';
import type { AssistantAction } from '@/types/assistant';
import { toNavTarget, type AssistantNavTarget } from '../mappers/navigationTarget';

type Nav = NativeStackNavigationProp<AppStackParamList>;

/**
 * Nút mở màn liên quan trong câu trả lời. Trợ lý chỉ đọc, nên mọi thao tác (trả nợ, nạp tiền, ký)
 * chỉ là nút mở đúng màn có sẵn; người dùng tự làm ở màn đó, có PIN như bình thường.
 *
 * Nút có đích không nằm trong danh sách màn của app (`toNavTarget` trả `null`) bị ẩn. Điều hướng
 * tới `Main` đóng modal trợ lý rồi mở màn trong đúng tab.
 */
export default function ActionButtons({ actions }: { actions: readonly AssistantAction[] }) {
  const nav = useNavigation<Nav>();
  const items = actions.flatMap(action => {
    const target = toNavTarget(action.target);
    return target ? [{ action, target }] : [];
  });
  if (items.length === 0) return null;

  const open = (target: AssistantNavTarget) => {
    switch (target.tab) {
      case 'Hồ sơ':
        return nav.navigate('Main', { screen: 'Hồ sơ', params: target.params });
      case 'Sàn':
        return nav.navigate('Main', { screen: 'Sàn', params: target.params });
      case 'Ví':
        return nav.navigate('Main', { screen: 'Ví', params: target.params });
    }
  };

  return (
    <View style={styles.wrap}>
      {items.map(({ action, target }, index) => (
        <Pressable
          key={`${action.key}-${index}`}
          onPress={() => open(target)}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          accessibilityHint="Đóng trợ lý và mở màn này"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.label} numberOfLines={2}>
            {action.label}
          </Text>
          <Icon name="arrowUpRight" size={18} color={Colors.authPrimary} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  button: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    backgroundColor: Colors.tintBlue,
  },
  pressed: { opacity: 0.75 },
  label: { flex: 1, fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authPrimary },
});
