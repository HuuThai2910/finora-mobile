import type {
  ActionDto,
  AssistantAction,
  AssistantCard,
  AssistantCitation,
  AssistantMode,
  CardDto,
  ChatResponseBody,
  ChatResponseDto,
  CitationDto,
  CitationKind,
  SuggestionItem,
} from '@/types/assistant';

const CARD_KINDS: readonly AssistantCard['kind'][] = ['kv', 'table', 'progress'];
const CITATION_KINDS: readonly CitationKind[] = ['LUAT', 'CHINH_SACH', 'CHUA_XAC_MINH', 'HUONG_DAN'];
const MODES: readonly AssistantMode[] = ['template', 'llm', 'fallback'];
const MAX_SUGGESTIONS = 4;

/**
 * Chỉ mở link https. Căn cứ pháp lý luôn là văn bản trên cổng chính thức; chặn `javascript:`,
 * `intent:`, `tel:`... để một chuỗi lạ trong câu trả lời không mở được ứng dụng khác.
 */
const SAFE_URL = /^https:\/\/\S+$/i;

const strings = (list: readonly unknown[] | null | undefined): string[] =>
  (list ?? []).filter((value): value is string => typeof value === 'string');

const finite = (value: number | null | undefined): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

/** Thẻ kiểu lạ (server thêm kiểu mới) hoặc thiếu dữ liệu bắt buộc thì bỏ, không vẽ thẻ rỗng. */
function toCard(dto: CardDto): AssistantCard | null {
  const kind = CARD_KINDS.find(k => k === dto.kind);
  if (!kind) return null;
  const card: AssistantCard = {
    kind,
    title: dto.title ?? '',
    items: (dto.items ?? []).filter(item => typeof item.label === 'string' && typeof item.value === 'string'),
    columns: strings(dto.columns),
    rows: (dto.rows ?? []).map(row => strings(row)),
    value: finite(dto.value),
    max: finite(dto.max),
    label: dto.label ?? null,
  };
  if (kind === 'kv' && card.items.length === 0) return null;
  if (kind === 'table' && card.columns.length === 0) return null;
  if (kind === 'progress' && (card.value === null || card.max === null || card.max <= 0)) return null;
  return card;
}

/** Nút giữ nguyên đích server gửi; màn nào được mở do `toNavTarget` quyết định lúc vẽ nút. */
function toAction(dto: ActionDto): AssistantAction | null {
  if (!dto.key || !dto.label || !dto.target) return null;
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(dto.target.params ?? {})) {
    if (typeof value === 'string') params[key] = value;
  }
  return {
    key: dto.key,
    label: dto.label,
    target: { screen: dto.target.screen ?? null, params, path: dto.target.path ?? null },
  };
}

/** Loại căn cứ lạ hiện là "Chưa xác minh nguồn": không bao giờ nâng một nguồn chưa rõ thành luật. */
function toCitation(dto: CitationDto): AssistantCitation | null {
  if (!dto.id || !dto.label) return null;
  return {
    id: dto.id,
    kind: CITATION_KINDS.find(k => k === dto.kind) ?? 'CHUA_XAC_MINH',
    label: dto.label,
    url: dto.url && SAFE_URL.test(dto.url) ? dto.url : null,
    checkedAt: dto.checkedAt ?? '',
  };
}

function compact<T, U>(list: readonly T[] | null | undefined, map: (item: T) => U | null): U[] {
  const result: U[] = [];
  for (const item of list ?? []) {
    const mapped = map(item);
    if (mapped !== null) result.push(mapped);
  }
  return result;
}

export function toSuggestions(list: readonly SuggestionItem[] | null | undefined): SuggestionItem[] {
  return (list ?? [])
    .filter(item => typeof item.id === 'string' && typeof item.label === 'string' && item.label.trim() !== '')
    .slice(0, MAX_SUGGESTIONS);
}

/** Đổi JSON server sang khuôn hợp đồng, bỏ phần app không hiểu thay vì làm vỡ màn chat. */
export function toChatResponse(dto: ChatResponseDto): ChatResponseBody {
  const answer = typeof dto.answer === 'string' ? dto.answer.trim() : '';
  return {
    turnId: dto.turnId,
    answer: answer || 'Trợ lý chưa có câu trả lời cho câu này.',
    cards: compact(dto.cards, toCard),
    actions: compact(dto.actions, toAction),
    citations: compact(dto.citations, toCitation),
    suggestions: toSuggestions(dto.suggestions),
    // Mode lạ coi như "llm": không hiện nhãn rút gọn khi không chắc đó là câu dựng sẵn.
    mode: MODES.find(m => m === dto.mode) ?? 'llm',
    disclaimer: dto.disclaimer?.trim() || null,
  };
}

/** "2026-10-15" -> "15/10/2026". Ngày kiểm là ngày thuần, không đổi múi giờ như `formatDate`. */
export function formatCheckedAt(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : null;
}
