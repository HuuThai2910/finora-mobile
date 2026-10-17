import type { TagTone } from '@/components/ui';
import type { UserRole } from '@/types/auth';
import type { AssistantScreen, CitationKind } from '@/types/assistant';

/** Giới hạn khớp `ChatRequest` của server (spec mục 5): vượt là 422, nên cắt ngay ở app. */
export const MAX_MESSAGE_CHARS = 1000;
export const MAX_HISTORY_TURNS = 6;
export const MAX_HISTORY_CONTENT_CHARS = 2000;
/** Bộ đếm ký tự chỉ hiện khi câu hỏi đã dài, để ô nhập gọn trong lúc gõ câu ngắn. */
export const COUNTER_FROM = 800;

/** Trên web/máy tính bảng giữ cột chat cỡ điện thoại như các màn khác. */
export const CHAT_MAX_WIDTH = 520;
export const CHAT_PADDING = 16;

export const AI_NOTICE_KEY = 'finora.assistant.aiNotice';
/**
 * Giá trị lưu khi người dùng đã đọc thông báo. Đổi chuỗi này khi nội dung thông báo đổi (thêm nhà
 * cung cấp, đổi cách dùng dữ liệu) để mọi người phải đọc lại.
 */
export const AI_NOTICE_VERSION = '2026-10-16';

/** Nhà cung cấp nhận dữ liệu đã lược định danh (làn USER_DATA, spec mục 7.1). */
export const AI_PROVIDERS = 'Cloudflare, Groq, OpenRouter';

export const AI_NOTICE_POINTS: readonly string[] = [
  'Trợ lý FINORA là chương trình AI. Câu trả lời có thể chưa đúng; số liệu trên thẻ được lấy thẳng từ hệ thống FINORA.',
  `Để trả lời, câu hỏi và dữ liệu cần thiết của bạn (đã bỏ họ tên, CCCD, số điện thoại, email, số tài khoản) được gửi tới nhà cung cấp AI ở nước ngoài: ${AI_PROVIDERS}. Câu hỏi chung không kèm dữ liệu của bạn có thể được gửi tới Google Gemini.`,
  'Trợ lý chỉ đọc và giải thích. Trợ lý không chuyển tiền, không ký hợp đồng và không thay đổi gì trong tài khoản; mọi thao tác bạn tự làm ở màn tương ứng.',
  'Không nhập số CCCD, mật khẩu, mã PIN hay mã OTP vào khung chat.',
  'Thông tin chỉ để tham khảo, không phải tư vấn đầu tư hay tư vấn pháp lý.',
];

export const GREETING =
  'Xin chào! Mình là Trợ lý FINORA. Mình giải thích trạng thái hồ sơ, khoản vay, lệnh đầu tư và chính sách của FINORA bằng dữ liệu của chính bạn. Bạn chọn một câu gợi ý hoặc gõ câu hỏi nhé.';

/** Câu gửi đi khi mở trợ lý kèm `suggestionId` mà không tìm được nhãn của gợi ý đó. */
export const FALLBACK_SUGGESTION_MESSAGE = 'Giải thích giúp tôi màn này';

export const FALLBACK_MODE_NOTE =
  'Trợ lý đang ở chế độ rút gọn: câu trả lời được dựng sẵn từ dữ liệu của bạn, chưa qua AI.';

export const DISABLED_MESSAGE =
  'Trợ lý đang tạm tắt. Các chức năng khác của ứng dụng vẫn dùng bình thường.';

export const SENSITIVE_HINT = 'Không nhập CCCD, mật khẩu, mã PIN hay OTP.';

/** Nhãn của ba loại căn cứ phải tách bạch (spec mục 2): luật, chính sách FINORA, chưa xác minh. */
export const CITATION_KIND: Record<CitationKind, { label: string; tone: TagTone }> = {
  LUAT: { label: 'Quy định pháp luật', tone: 'blue' },
  CHINH_SACH: { label: 'Chính sách FINORA', tone: 'violet' },
  CHUA_XAC_MINH: { label: 'Chưa xác minh nguồn', tone: 'amber' },
  HUONG_DAN: { label: 'Hướng dẫn', tone: 'gray' },
};

/** Nhãn nút "Hỏi trợ lý" theo màn, nói rõ trợ lý sẽ hỏi về cái gì. */
export const ASK_LABEL: Record<AssistantScreen, string> = {
  Home: 'Hỏi Trợ lý FINORA',
  ApplicationDetail: 'Hỏi trợ lý về hồ sơ này',
  ContractDetail: 'Hỏi trợ lý về hợp đồng này',
  LoanServicingDetail: 'Hỏi trợ lý về khoản vay này',
  LoanDetail: 'Hỏi trợ lý về khoản vay này',
  OrderBook: 'Hỏi trợ lý về sổ lệnh này',
  MyBookOrders: 'Hỏi trợ lý về lệnh của tôi',
  AutoInvest: 'Hỏi trợ lý về Auto-Invest',
  Portfolio: 'Hỏi trợ lý về danh mục',
};

/**
 * Màn mà cả hai vai trò cùng mở được nhưng trợ lý chỉ có công cụ cho một vai trò. Màn khoản vay trên
 * Sàn người vay cũng xem được, còn công cụ đọc khoản đó (`chi_tiet_khoan`) chỉ có cho nhà đầu tư.
 */
export const ASK_ROLES: Partial<Record<AssistantScreen, readonly UserRole[]>> = {
  LoanDetail: ['INVESTOR'],
};
