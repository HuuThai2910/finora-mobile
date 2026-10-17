import type { ChatResponseBody, FeedbackRating } from '@/types/assistant';

/**
 * Một dòng trong màn chat. Hội thoại chỉ sống trong bộ nhớ của màn (spec mục 11: không lưu hội
 * thoại); đóng màn là mất, mở lại bắt đầu từ đầu.
 *
 * `failed`: câu hỏi chưa gửi được, hiện nhãn "Chưa gửi được" và không đưa vào lịch sử gửi server.
 * `rating`: góp ý của người dùng cho câu trả lời, mỗi câu chỉ một lần.
 */
export type ChatMessage =
  | { id: string; role: 'user'; text: string; failed: boolean; suggestionId: string | null }
  | { id: string; role: 'assistant'; reply: ChatResponseBody; rating: FeedbackRating | null };

export type UserChatMessage = Extract<ChatMessage, { role: 'user' }>;
