import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { AppStackParamList } from '@/navigation/types';
import { useAuth } from '@/providers/AuthProvider';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';
import type { AssistantScreen } from '@/types/assistant';
import { ASK_LABEL, ASK_ROLES } from '../constants';
import { useAssistantAvailable } from '../hooks/useAssistantAvailable';

type Props = {
  /** Màn đang mở và mã nghiệp vụ trên màn đó, đúng khóa ở spec mục 13.1. */
  context: { screen: AssistantScreen; params?: Record<string, string> };
  /** Có thì màn chat tự hỏi gợi ý này ngay khi mở. */
  suggestionId?: string;
};

/**
 * Nút "Hỏi trợ lý" đặt trong luồng thẻ của một màn chi tiết. Mở màn chat kèm ngữ cảnh để trợ lý lấy
 * đúng hồ sơ/khoản/lệnh đang xem thay vì hỏi lại người dùng.
 *
 * Ẩn khi trợ lý không dùng được (`useAssistantAvailable`) hoặc khi vai trò hiện tại không có công cụ
 * cho màn này (`ASK_ROLES`). Ẩn chỉ là trải nghiệm; quyền thật do server và service đích kiểm.
 */
export default function AskAssistantButton({ context, suggestionId }: Props) {
  const nav = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { session } = useAuth();
  const available = useAssistantAvailable();
  const roles = ASK_ROLES[context.screen];
  const allowed = !roles || (session !== null && roles.includes(session.profile.role));
  if (!available || !allowed) return null;

  const label = ASK_LABEL[context.screen];
  return (
    <Pressable
      onPress={() => nav.navigate('Assistant', { context, suggestionId })}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Mở Trợ lý FINORA với thông tin của màn này"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Icon name="robot" size={20} color={Colors.authPrimary} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <Icon name="chevronRight" size={20} color={Colors.chevronMuted} />
    </Pressable>
  );
}

const ICON = 34;

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TOUCH + Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  pressed: { opacity: 0.8 },
  icon: {
    width: ICON,
    height: ICON,
    borderRadius: ICON / 2,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.authInk },
});
