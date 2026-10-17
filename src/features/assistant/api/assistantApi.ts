import { ApiError, assistantFetch } from '@/lib/api';
import { isMocked } from '@/lib/mockFlag';
import * as assistantMock from '@/lib/mocks/assistant';
import type {
  ChatRequestBody,
  ChatResponseBody,
  ChatResponseDto,
  FeedbackRating,
  SuggestionItem,
} from '@/types/assistant';
import { toChatResponse, toSuggestions } from '../mappers/chatResponse';

/** Dưới `AUTH_BASE_URL` (đã gồm `/api/v1`); Gateway chuyển `/api/v1/ai/**` cho finora-ai. */
const BASE = '/ai/assistant';

/**
 * Server giới hạn cả lượt 40 giây (chờ LLM + gọi service). Client chờ thêm 5 giây để lỗi hết giờ đến
 * từ server, có mã và có câu trả lời rút gọn, thay vì app tự cắt ngang trước.
 */
const CHAT_TIMEOUT_MS = 45_000;
const LIGHT_TIMEOUT_MS = 10_000;

/** Gửi một câu hỏi. Bỏ `assistant` khỏi `EXPO_PUBLIC_MOCK_DOMAINS` là gọi finora-ai thật. */
export const sendChat = async (body: ChatRequestBody, signal?: AbortSignal): Promise<ChatResponseBody> => {
  const dto = isMocked('assistant')
    ? await assistantMock.chat(body)
    : await assistantFetch<ChatResponseDto>(`${BASE}/chat`, {
        method: 'POST',
        body: JSON.stringify(body),
        signal,
        timeoutMs: CHAT_TIMEOUT_MS,
      });
  return toChatResponse(dto);
};

/**
 * Gợi ý theo vai trò và màn đang mở (tối đa 4). Ghép query bằng tay vì `URLSearchParams` của React
 * Native không đủ hàm trên mọi bản.
 */
export const getSuggestions = async (screen: string | null, signal?: AbortSignal): Promise<SuggestionItem[]> => {
  if (isMocked('assistant')) return toSuggestions(await assistantMock.suggestions(screen));
  const query = screen ? `surface=mobile&screen=${encodeURIComponent(screen)}` : 'surface=mobile';
  const items = await assistantFetch<SuggestionItem[] | null>(`${BASE}/suggestions?${query}`, {
    signal,
    timeoutMs: LIGHT_TIMEOUT_MS,
  });
  return toSuggestions(items);
};

/** Góp ý hữu ích/chưa đúng cho một câu trả lời; server chỉ ghi siêu dữ liệu, không lưu nội dung. */
export const sendFeedback = async (turnId: string, rating: FeedbackRating): Promise<void> => {
  if (isMocked('assistant')) return assistantMock.feedback();
  await assistantFetch<void>(`${BASE}/feedback`, {
    method: 'POST',
    body: JSON.stringify({ turnId, rating }),
    timeoutMs: LIGHT_TIMEOUT_MS,
  });
};

/**
 * 503 nghĩa là trợ lý đang tắt (`ASSISTANT_DISABLED`) hoặc finora-ai chưa chạy (VM đang ngủ, Gateway
 * trả 503): app coi như tắt, ẩn lối vào và khóa ô nhập thay vì báo lỗi từng câu.
 */
export const isAssistantOff = (error: unknown): boolean => error instanceof ApiError && error.status === 503;
