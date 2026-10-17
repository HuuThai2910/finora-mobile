import { Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { AppStackParamList } from '@/navigation/types';
import { SoftShadow, Spacing } from '@/theme';
import type { AssistantScreen } from '@/types/assistant';
import { useAssistantAvailable } from '../hooks/useAssistantAvailable';

type Props = { context: { screen: AssistantScreen; params?: Record<string, string> } };

const SIZE = 56;

/**
 * Nút tròn nổi góc phải dưới trang chủ, lối vào chung của Trợ lý FINORA. Chỉ hiện khi
 * `GET /suggestions` trả 200 (spec mục 16), nên trợ lý đang tắt thì trang chủ như cũ.
 *
 * Nằm tuyệt đối trong khung màn (ngoài ScrollView) để đứng yên khi cuộn; trang chủ đã chừa 72pt ở
 * đáy nên nút không che thẻ cuối.
 */
export default function AssistantFab({ context }: Props) {
  const nav = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const available = useAssistantAvailable();
  if (!available) return null;

  return (
    <Pressable
      onPress={() => nav.navigate('Assistant', { context })}
      accessibilityRole="button"
      accessibilityLabel="Mở Trợ lý FINORA"
      accessibilityHint="Hỏi về hồ sơ, khoản vay hoặc khoản đầu tư của bạn"
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
    >
      <Icon name="robot" size={28} color={Colors.onDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.authPrimary,
    ...SoftShadow.raised,
  },
  pressed: { opacity: 0.85 },
});
