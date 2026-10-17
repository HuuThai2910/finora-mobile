import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import type { AppStackParamList } from '@/navigation/types';
import { FontFamily, Spacing } from '@/theme';
import AiNoticeSheet from '../components/AiNoticeSheet';
import AssistantReply from '../components/AssistantReply';
import ChatBubble from '../components/ChatBubble';
import ChatComposer from '../components/ChatComposer';
import ChatHeader from '../components/ChatHeader';
import ChatNotice from '../components/ChatNotice';
import SuggestionChips from '../components/SuggestionChips';
import { CHAT_MAX_WIDTH, CHAT_PADDING, DISABLED_MESSAGE, FALLBACK_SUGGESTION_MESSAGE, GREETING } from '../constants';
import { useAiNotice } from '../hooks/useAiNotice';
import { useAssistantChat } from '../hooks/useAssistantChat';
import type { ChatMessage } from '../types';

type Route = RouteProp<AppStackParamList, 'Assistant'>;
type Nav = NativeStackNavigationProp<AppStackParamList, 'Assistant'>;

/**
 * Màn chat của Trợ lý FINORA, mở dạng modal phủ lên tab đang đứng (spec mục 13.1).
 *
 * Màn chỉ điều phối: hội thoại và lời gọi API nằm ở `useAssistantChat`, thông báo AI lần đầu ở
 * `useAiNotice`. Ô nhập bị khóa tới khi người dùng đã đọc thông báo, và khi trợ lý đang tắt.
 */
export default function ChatScreen() {
  const nav = useNavigation<Nav>();
  const { context, suggestionId } = useRoute<Route>().params;
  const insets = useSafeAreaInsets();
  const notice = useAiNotice();
  const chat = useAssistantChat(context);
  const { send, ready, disabled, suggestions } = chat;
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const autoAsked = useRef(false);

  // Mở từ nút có sẵn gợi ý: tự hỏi đúng một lần, sau khi người dùng đã đọc thông báo AI và gợi ý ban
  // đầu đã tải (để câu hiện trong khung chat là nhãn thật của gợi ý).
  useEffect(() => {
    if (!suggestionId || autoAsked.current || notice.status !== 'seen' || !ready || disabled) return;
    autoAsked.current = true;
    const label = suggestions.find(item => item.id === suggestionId)?.label ?? FALLBACK_SUGGESTION_MESSAGE;
    send(label, suggestionId);
  }, [suggestionId, notice.status, ready, disabled, suggestions, send]);

  const locked = notice.status !== 'seen' || disabled;
  const close = () => nav.goBack();

  const submit = () => {
    if (locked || chat.sending || !draft.trim()) return;
    send(draft);
    setDraft('');
  };

  const renderItem = ({ item }: { item: ChatMessage }) =>
    item.role === 'user' ? (
      <ChatBubble role="user" text={item.text} failed={item.failed} />
    ) : (
      <AssistantReply reply={item.reply} rating={item.rating} onRate={rating => chat.rate(item.id, rating)} />
    );

  const footer = (
    <View style={styles.listFooter}>
      {chat.sending ? (
        <ChatBubble role="assistant">
          <View style={styles.typing} accessibilityLiveRegion="polite">
            <ActivityIndicator size="small" color={Colors.authPrimary} />
            <Text style={styles.typingText}>Trợ lý đang trả lời...</Text>
          </View>
        </ChatBubble>
      ) : null}
      {chat.error && !chat.sending ? (
        <ChatNotice
          tone="error"
          message={chat.error}
          action={chat.canRetry && !disabled ? { label: 'Gửi lại', onPress: chat.retry } : undefined}
        />
      ) : null}
      {chat.suggestionsFailed && chat.messages.length === 0 ? (
        <ChatNotice tone="muted" message="Chưa tải được câu hỏi gợi ý. Bạn vẫn có thể gõ câu hỏi bên dưới." />
      ) : null}
    </View>
  );

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.column}>
          <ChatHeader topInset={insets.top} onClose={close} />
          <FlatList
            ref={listRef}
            style={styles.fill}
            contentContainerStyle={styles.list}
            data={chat.messages}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ListHeaderComponent={<ChatBubble role="assistant" text={GREETING} />}
            ListFooterComponent={footer}
            keyboardShouldPersistTaps="handled"
            // Câu mới luôn nằm cuối danh sách: cuộn theo khi có câu hỏi, câu trả lời hay dòng lỗi mới.
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
          <View style={[styles.bottom, { paddingBottom: insets.bottom + Spacing.md }]}>
            {disabled ? (
              <ChatNotice tone="muted" message={DISABLED_MESSAGE} action={{ label: 'Đóng', onPress: close }} />
            ) : (
              <>
                {chat.sending ? null : (
                  <SuggestionChips items={suggestions} disabled={locked} onPick={item => send(item.label, item.id)} />
                )}
                <ChatComposer value={draft} onChange={setDraft} onSend={submit} sending={chat.sending} disabled={locked} />
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
      <AiNoticeSheet visible={notice.status === 'show'} onAccept={notice.acknowledge} onDecline={close} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.homeWaveTop },
  fill: { flex: 1 },
  column: { flex: 1, width: '100%', maxWidth: CHAT_MAX_WIDTH, alignSelf: 'center', paddingHorizontal: CHAT_PADDING },
  list: { gap: Spacing.lg, paddingVertical: Spacing.lg },
  listFooter: { gap: Spacing.lg },
  typing: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  typingText: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20, color: Colors.authMuted },
  bottom: { gap: Spacing.md, paddingTop: Spacing.md },
});
