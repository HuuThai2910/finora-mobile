/**
 * Hợp đồng JSON của Trợ lý FINORA (`finora-ai`, `/api/v1/ai/assistant`), spec AI-CHAT-001 mục 5.
 *
 * Tên và kiểu giữ đúng hợp đồng dùng chung với web: JSON camelCase, mọi số liệu trên thẻ là chuỗi
 * server đã định dạng ("2.350.000 đ", "25/10/2026"), app chỉ hiển thị, không tính lại.
 */

export type AssistantSurface = 'mobile' | 'web';

/**
 * Các màn của app gửi kèm ngữ cảnh khi mở trợ lý (spec mục 13.1). Server bỏ qua màn lạ; khai đúng
 * danh sách ở đây để nút "Hỏi trợ lý" không gõ nhầm tên màn.
 */
export type AssistantScreen =
  | 'Home'
  | 'ApplicationDetail'
  | 'ContractDetail'
  | 'LoanServicingDetail'
  | 'LoanDetail'
  | 'OrderBook'
  | 'MyBookOrders'
  | 'AutoInvest'
  | 'Portfolio';

export interface AssistantContext {
  screen?: string;
  params?: Record<string, string>;
  lastErrorCode?: string | null;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequestBody {
  message: string;
  history: ChatTurn[];
  surface: AssistantSurface;
  context?: AssistantContext | null;
  suggestionId?: string | null;
}

export interface CardItem {
  label: string;
  value: string;
}

export interface AssistantCard {
  kind: 'kv' | 'table' | 'progress';
  title: string;
  items: CardItem[];
  columns: string[];
  rows: string[][];
  value: number | null;
  max: number | null;
  label: string | null;
}

export interface ActionTarget {
  screen: string | null;
  params: Record<string, string>;
  path: string | null;
}

export interface AssistantAction {
  key: string;
  label: string;
  target: ActionTarget;
}

export type CitationKind = 'LUAT' | 'CHINH_SACH' | 'CHUA_XAC_MINH' | 'HUONG_DAN';

export interface AssistantCitation {
  id: string;
  kind: CitationKind;
  label: string;
  url: string | null;
  checkedAt: string;
}

export interface SuggestionItem {
  id: string;
  label: string;
}

export type AssistantMode = 'template' | 'llm' | 'fallback';

export interface ChatResponseBody {
  turnId: string;
  answer: string;
  cards: AssistantCard[];
  actions: AssistantAction[];
  citations: AssistantCitation[];
  suggestions: SuggestionItem[];
  mode: AssistantMode;
  disclaimer: string | null;
}

export type FeedbackRating = 'up' | 'down';

/**
 * Khuôn JSON đọc "lỏng" trước khi qua mapper: mảng có thể thiếu, `kind`/`mode` có thể là giá trị
 * server mới thêm mà app chưa biết. Mapper loại phần không hiểu thay vì để màn hình vỡ.
 */
export interface CardDto {
  kind: string;
  title?: string | null;
  items?: CardItem[] | null;
  columns?: string[] | null;
  rows?: string[][] | null;
  value?: number | null;
  max?: number | null;
  label?: string | null;
}

export interface ActionDto {
  key: string;
  label: string;
  target?: { screen?: string | null; params?: Record<string, string> | null; path?: string | null } | null;
}

export interface CitationDto {
  id: string;
  kind: string;
  label: string;
  url?: string | null;
  checkedAt?: string | null;
}

export interface ChatResponseDto {
  turnId: string;
  answer: string;
  cards?: CardDto[] | null;
  actions?: ActionDto[] | null;
  citations?: CitationDto[] | null;
  suggestions?: SuggestionItem[] | null;
  mode?: string | null;
  disclaimer?: string | null;
}
