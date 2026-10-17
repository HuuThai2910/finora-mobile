import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/theme';
import type { SuggestionItem } from '@/types/assistant';

type Props = {
  items: readonly SuggestionItem[];
  onPick: (item: SuggestionItem) => void;
  disabled?: boolean;
};

/**
 * Câu hỏi gợi ý của server (tối đa 4), cuộn ngang trên một hàng để không đẩy ô nhập lên cao. Bấm gợi
 * ý gửi kèm `suggestionId`: server trả lời bằng câu mẫu dựng từ dữ liệu, không tốn lượt gọi LLM.
 */
export default function SuggestionChips({ items, onPick, disabled = false }: Props) {
  if (items.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.row}
      accessibilityLabel="Câu hỏi gợi ý"
    >
      {items.map(item => (
        <Pressable
          key={item.id}
          onPress={() => onPick(item)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          accessibilityState={{ disabled }}
          style={({ pressed }) => [styles.chip, pressed && styles.pressed, disabled && styles.off]}
        >
          <Icon name="sparkles" size={14} color={Colors.authPrimary} />
          <Text style={styles.text} numberOfLines={1} maxFontSizeMultiplier={1.3}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: Spacing.sm, paddingVertical: 2 },
  chip: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.tagBlueBorder,
    backgroundColor: Colors.card,
  },
  pressed: { opacity: 0.7 },
  off: { opacity: 0.45 },
  text: { fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 18, color: Colors.authPrimary },
});
