import { ApiError, toUserMessage } from '@/lib/api';
import { DISABLED_MESSAGE } from '../constants';

/**
 * Câu báo lỗi khi gửi câu hỏi. Mã lỗi riêng của trợ lý (spec mục 5) được nói bằng lời của trợ lý;
 * lỗi mạng và hết giờ giữ thông điệp sẵn có của `api.ts` ("Máy chủ phản hồi quá lâu...").
 *
 * Lỗi của nhà cung cấp LLM không tới đây: server vẫn trả 200 với `mode=fallback`.
 */
export function chatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return 'Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại rồi hỏi tiếp.';
      case 403:
        return 'Trợ lý trên ứng dụng dành cho tài khoản người vay và nhà đầu tư.';
      case 422:
        return 'Câu hỏi chưa gửi được. Hãy viết ngắn lại rồi thử lại.';
      case 429:
        return 'Bạn hỏi hơi nhanh, thử lại sau ít phút.';
      case 503:
        return DISABLED_MESSAGE;
    }
  }
  return toUserMessage(error);
}
