import type { AssistantContext, ChatTurn } from '@/types/assistant';
import { MAX_HISTORY_CONTENT_CHARS, MAX_HISTORY_TURNS } from '../constants';
import type { ChatMessage } from '../types';

/** Cùng khuôn `MA_NGHIEP_VU` và khóa tham số của server: giá trị lạ làm cả request bị 422. */
const PARAM_VALUE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;
const PARAM_KEY = /^[A-Za-z][A-Za-z0-9]{0,39}$/;
const MAX_PARAMS = 8;
const MAX_SCREEN_CHARS = 64;

/**
 * Lịch sử gửi kèm câu hỏi: tối đa 6 lượt gần nhất (spec mục 5). Câu chưa gửi được không đưa vào vì
 * server chưa từng trả lời câu đó. Server chỉ coi lịch sử là ngữ cảnh, không coi là dữ kiện.
 */
export function toHistory(messages: readonly ChatMessage[]): ChatTurn[] {
  const turns: ChatTurn[] = [];
  for (const message of messages) {
    if (message.role === 'user' && !message.failed) {
      turns.push({ role: 'user', content: message.text.slice(0, MAX_HISTORY_CONTENT_CHARS) });
    }
    if (message.role === 'assistant') {
      turns.push({ role: 'assistant', content: message.reply.answer.slice(0, MAX_HISTORY_CONTENT_CHARS) });
    }
  }
  return turns.slice(-MAX_HISTORY_TURNS);
}

/**
 * Ngữ cảnh gửi đi: màn đang mở, mã nghiệp vụ trên màn đó và mã lỗi API gần nhất. Tham số không đúng
 * khuôn bị bỏ ở đây để một mã lạ không làm hỏng cả câu hỏi.
 */
export function toRequestContext(
  context: AssistantContext | undefined,
  lastErrorCode: string | null,
): AssistantContext | null {
  const params: Record<string, string> = {};
  const entries = Object.entries(context?.params ?? {}).slice(0, MAX_PARAMS);
  for (const [key, value] of entries) {
    if (PARAM_KEY.test(key) && PARAM_VALUE.test(value)) params[key] = value;
  }
  const screen = context?.screen && context.screen.length <= MAX_SCREEN_CHARS ? context.screen : undefined;
  if (!screen && Object.keys(params).length === 0 && !lastErrorCode) return null;
  return { screen, params, lastErrorCode };
}
