import { useCallback, useEffect, useRef, useState } from 'react';
import { getLastApiErrorCode } from '@/lib/lastApiError';
import type { AssistantContext, ChatTurn, FeedbackRating, SuggestionItem } from '@/types/assistant';
import { getSuggestions, isAssistantOff, sendChat, sendFeedback } from '../api/assistantApi';
import { MAX_MESSAGE_CHARS } from '../constants';
import { chatErrorMessage } from '../mappers/chatError';
import { toHistory, toRequestContext } from '../mappers/chatRequest';
import type { ChatMessage, UserChatMessage } from '../types';
import { forgetAssistantAvailability } from './useAssistantAvailable';

export type AssistantChat = {
  messages: ChatMessage[];
  suggestions: SuggestionItem[];
  /** Đã tải xong gợi ý ban đầu (được hay không), để màn biết lúc tự hỏi theo `suggestionId`. */
  ready: boolean;
  suggestionsFailed: boolean;
  sending: boolean;
  error: string | null;
  /** Câu cuối cùng là câu hỏi chưa gửi được: hiện nút "Gửi lại". */
  canRetry: boolean;
  /** Trợ lý đang tắt (503): khóa ô nhập, chỉ còn nút đóng. */
  disabled: boolean;
  send: (text: string, suggestionId?: string | null) => void;
  retry: () => void;
  rate: (messageId: string, rating: FeedbackRating) => void;
};

let sequence = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(sequence += 1)}`;

/**
 * Điều phối một cuộc trò chuyện: gợi ý ban đầu theo màn, gửi câu hỏi kèm 6 lượt gần nhất và ngữ cảnh
 * màn, gửi lại khi lỗi, góp ý cho câu trả lời.
 *
 * Mỗi lúc chỉ một câu đang chờ (chống bấm hai lần). Rời màn thì hủy câu đang chờ: câu trả lời tới
 * muộn không còn chỗ hiển thị. Không tự thử lại: lỗi hiện kèm nút "Gửi lại" để người dùng quyết định.
 */
export function useAssistantChat(context: AssistantContext | undefined): AssistantChat {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [ready, setReady] = useState(false);
  const [suggestionsFailed, setSuggestionsFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  // Bản mới nhất của danh sách cho các callback (dựng lịch sử) mà không phải tạo lại callback mỗi lượt.
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const inFlight = useRef<AbortController | null>(null);
  const screen = context?.screen ?? null;

  const markOff = useCallback(() => {
    setDisabled(true);
    forgetAssistantAvailability();
  }, []);

  // Gợi ý ban đầu theo màn đang mở; 503 ở đây nghĩa là trợ lý đã tắt từ trước khi người dùng gõ.
  useEffect(() => {
    const controller = new AbortController();
    getSuggestions(screen, controller.signal)
      .then(items => {
        if (!controller.signal.aborted) setSuggestions(items);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        if (isAssistantOff(e)) markOff();
        else setSuggestionsFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setReady(true);
      });
    return () => controller.abort();
  }, [screen, markOff]);

  useEffect(() => () => inFlight.current?.abort(), []);

  const deliver = useCallback(
    async (message: UserChatMessage, history: ChatTurn[]) => {
      const controller = new AbortController();
      inFlight.current = controller;
      setSending(true);
      setError(null);
      try {
        const reply = await sendChat(
          {
            message: message.text,
            history,
            surface: 'mobile',
            context: toRequestContext(context, getLastApiErrorCode()),
            suggestionId: message.suggestionId,
          },
          controller.signal,
        );
        if (controller.signal.aborted) return;
        // Id riêng của app: server trả lại đúng phản hồi cũ (cùng turnId) khi bấm trùng trong 60 giây.
        setMessages(prev => [...prev, { id: nextId('a'), role: 'assistant', reply, rating: null }]);
        setSuggestions(reply.suggestions);
      } catch (e) {
        if (controller.signal.aborted) return;
        if (isAssistantOff(e)) markOff();
        setMessages(prev => prev.map(m => (m.id === message.id ? { ...message, failed: true } : m)));
        setError(chatErrorMessage(e));
      } finally {
        if (inFlight.current === controller) inFlight.current = null;
        if (!controller.signal.aborted) setSending(false);
      }
    },
    [context, markOff],
  );

  const send = useCallback(
    (raw: string, suggestionId: string | null = null) => {
      const text = raw.trim().slice(0, MAX_MESSAGE_CHARS);
      if (!text || inFlight.current || disabled) return;
      const message: UserChatMessage = { id: nextId('u'), role: 'user', text, failed: false, suggestionId };
      const history = toHistory(messagesRef.current);
      setMessages(prev => [...prev, message]);
      void deliver(message, history);
    },
    [deliver, disabled],
  );

  const retry = useCallback(() => {
    const all = messagesRef.current;
    const last = all[all.length - 1];
    if (!last || last.role !== 'user' || !last.failed || inFlight.current) return;
    const again: UserChatMessage = { ...last, failed: false };
    setMessages(prev => prev.map(m => (m.id === again.id ? again : m)));
    void deliver(again, toHistory(all.slice(0, -1)));
  }, [deliver]);

  const rate = useCallback((messageId: string, rating: FeedbackRating) => {
    const target = messagesRef.current.find(m => m.id === messageId);
    if (!target || target.role !== 'assistant' || target.rating) return;
    const setRating = (value: FeedbackRating | null) =>
      setMessages(prev => prev.map(m => (m.id === messageId && m.role === 'assistant' ? { ...m, rating: value } : m)));
    setRating(rating);
    // Góp ý không đáng chặn người dùng: gửi lỗi thì chỉ bỏ dấu đã chọn để họ bấm lại.
    sendFeedback(target.reply.turnId, rating).catch(() => setRating(null));
  }, []);

  const last = messages[messages.length - 1];
  const canRetry = !sending && last?.role === 'user' && last.failed;

  return { messages, suggestions, ready, suggestionsFailed, sending, error, canRetry, disabled, send, retry, rate };
}
