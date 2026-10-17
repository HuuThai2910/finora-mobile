import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import type { IconName } from '@/constants/icons';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/theme';
import type { ChatResponseBody, FeedbackRating } from '@/types/assistant';
import { FALLBACK_MODE_NOTE } from '../constants';
import ActionButtons from './ActionButtons';
import AssistantCardView from './AssistantCardView';
import ChatBubble from './ChatBubble';
import CitationList from './CitationList';

type Props = {
  reply: ChatResponseBody;
  rating: FeedbackRating | null;
  onRate: (rating: FeedbackRating) => void;
};

/**
 * Một câu trả lời đầy đủ theo thứ tự đọc: lời giải thích, nhãn "chế độ rút gọn" nếu có, thẻ số liệu,
 * nút mở màn, căn cứ, câu miễn trừ, rồi ô góp ý.
 */
export default function AssistantReply({ reply, rating, onRate }: Props) {
  return (
    <ChatBubble role="assistant" text={reply.answer}>
      {reply.mode === 'fallback' ? (
        <View style={styles.fallback}>
          <Icon name="info" size={16} color={Colors.warnText} />
          <Text style={styles.fallbackText}>{FALLBACK_MODE_NOTE}</Text>
        </View>
      ) : null}
      {reply.cards.map((card, index) => (
        <AssistantCardView key={`${card.kind}-${index}`} card={card} />
      ))}
      <ActionButtons actions={reply.actions} />
      <CitationList citations={reply.citations} />
      {reply.disclaimer ? <Text style={styles.disclaimer}>{reply.disclaimer}</Text> : null}
      <Feedback rating={rating} onRate={onRate} />
    </ChatBubble>
  );
}

const CHOICES: readonly { rating: FeedbackRating; label: string; icon: IconName }[] = [
  { rating: 'up', label: 'Hữu ích', icon: 'check' },
  { rating: 'down', label: 'Chưa đúng', icon: 'x' },
];

/** Góp ý một lần cho mỗi câu; server chỉ ghi siêu dữ liệu (turnId, đánh giá), không lưu nội dung. */
function Feedback({ rating, onRate }: { rating: FeedbackRating | null; onRate: (rating: FeedbackRating) => void }) {
  if (rating) {
    return <Text style={styles.thanks}>Cảm ơn bạn đã góp ý.</Text>;
  }
  return (
    <View style={styles.feedback}>
      {CHOICES.map(choice => (
        <Pressable
          key={choice.rating}
          onPress={() => onRate(choice.rating)}
          accessibilityRole="button"
          accessibilityLabel={`Đánh giá câu trả lời: ${choice.label}`}
          hitSlop={6}
          style={({ pressed }) => [styles.choice, pressed && styles.pressed]}
        >
          <Icon name={choice.icon} size={14} color={Colors.authMuted} />
          <Text style={styles.choiceText}>{choice.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    backgroundColor: Colors.warnBg,
  },
  fallbackText: { flex: 1, fontFamily: FontFamily.medium, fontSize: 12, lineHeight: 17, color: Colors.warnText },
  disclaimer: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  feedback: { flexDirection: 'row', gap: Spacing.md },
  choice: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.authBorder,
  },
  pressed: { opacity: 0.6 },
  choiceText: { fontFamily: FontFamily.medium, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  thanks: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
});
