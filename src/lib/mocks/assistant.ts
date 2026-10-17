import { ApiError } from '@/lib/api';
import type { ChatRequestBody, ChatResponseDto, SuggestionItem } from '@/types/assistant';
import { mockResponse } from './delay';

/**
 * Trợ lý FINORA bằng câu trả lời mẫu, bật khi `EXPO_PUBLIC_MOCK_DOMAINS` có `assistant`. Số liệu là
 * giả nhưng viết sẵn đúng định dạng server trả (chuỗi đã định dạng), để xem giao diện chat mà không
 * cần finora-ai, LLM hay dữ liệu thật.
 *
 * Vài từ khóa trong câu hỏi để xem đủ trạng thái khi demo:
 * - `#nhanh`: lỗi 429 "hỏi hơi nhanh";
 * - `#rutgon`: câu trả lời ở chế độ rút gọn (`mode=fallback`);
 * - `#kiemthu`: thẻ kiểu lạ, nút trỏ màn không có trong app, nút có tham số sai, link không phải
 *   https; app phải ẩn hết những phần đó và chỉ hiện phần hợp lệ.
 */

const HO_SO: SuggestionItem = { id: 'borrower.application.status', label: 'Hồ sơ của tôi đang ở bước nào?' };
const CHUA_GIAI_NGAN: SuggestionItem = { id: 'borrower.application.not_disbursed', label: 'Đã duyệt sao chưa nhận tiền?' };
const TU_CHOI: SuggestionItem = { id: 'borrower.application.why_rejected', label: 'Vì sao hồ sơ bị từ chối?' };
const KY_TOI: SuggestionItem = { id: 'borrower.loan.next_due', label: 'Kỳ tới tôi trả bao nhiêu?' };
const CAN_KY: SuggestionItem = { id: 'borrower.contract.to_sign', label: 'Tôi có hợp đồng nào cần ký?' };
const PIN: SuggestionItem = { id: 'borrower.pin.locked', label: 'Mã PIN của tôi có bị khóa không?' };
const DANH_MUC: SuggestionItem = { id: 'investor.portfolio.summary', label: 'Tóm tắt danh mục của tôi' };
const TIEN_GIU: SuggestionItem = { id: 'investor.money.held', label: 'Tiền của tôi đang bị giữ ở đâu?' };
const LENH: SuggestionItem = { id: 'investor.order.why_not_matched', label: 'Vì sao lệnh của tôi chưa khớp?' };
const AUTO: SuggestionItem = { id: 'investor.autoinvest.skipped', label: 'Vì sao Auto-Invest bỏ qua khoản vay?' };
const KHOAN: SuggestionItem = { id: 'investor.listing.explain', label: 'Giải thích khoản vay này' };

/** Map thay cho object thường: tên màn lạ (kể cả "constructor") không trúng thuộc tính có sẵn. */
const SUGGESTIONS = new Map<string, SuggestionItem[]>([
  ['Home', [HO_SO, KY_TOI, DANH_MUC, TIEN_GIU]],
  ['ApplicationDetail', [CHUA_GIAI_NGAN, TU_CHOI]],
  ['ContractDetail', [CAN_KY, PIN]],
  ['LoanServicingDetail', [KY_TOI, PIN]],
  ['LoanDetail', [KHOAN]],
  ['OrderBook', [LENH]],
  ['MyBookOrders', [LENH, TIEN_GIU]],
  ['AutoInvest', [AUTO]],
  ['Portfolio', [DANH_MUC, TIEN_GIU]],
]);

const turnId = () => `mock-${Date.now().toString(36)}`;
const param = (body: ChatRequestBody, key: string, fallback: string) => body.context?.params?.[key] ?? fallback;

function chuaGiaiNgan(body: ChatRequestBody): ChatResponseDto {
  const applicationNumber = param(body, 'applicationNumber', 'LA-2026-000123');
  return {
    turnId: turnId(),
    answer:
      'Hồ sơ đã được duyệt, nghĩa là được mời ký và gọi vốn, chưa phải giải ngân. Hiện đã gọi được 12.000.000 đ trên 30.000.000 đ; khi đủ vốn, nhà đầu tư và bạn ký hợp đồng rồi tiền mới được chuyển.',
    cards: [
      { kind: 'progress', title: 'Tiến độ gọi vốn', value: 12000000, max: 30000000, label: '12.000.000 đ / 30.000.000 đ (40%)' },
      {
        kind: 'kv',
        title: `Hồ sơ ${applicationNumber}`,
        items: [
          { label: 'Trạng thái', value: 'Đã duyệt' },
          { label: 'Gọi vốn', value: 'Đang gọi vốn' },
          { label: 'Hạn đóng gọi vốn', value: '25/10/2026' },
        ],
      },
    ],
    actions: [{ key: 'mo_ho_so', label: 'Mở hồ sơ', target: { screen: 'ApplicationDetail', params: { applicationNumber } } }],
    citations: [{ id: 'NV-DUYET-GIAI-NGAN-01', kind: 'CHINH_SACH', label: 'Quy trình duyệt và giải ngân FINORA', checkedAt: '2026-10-15' }],
    suggestions: [KY_TOI, CAN_KY],
    mode: 'template',
  };
}

function kyToi(body: ChatRequestBody): ChatResponseDto {
  const loanNumber = param(body, 'loanNumber', 'LN-2026-000045');
  return {
    turnId: turnId(),
    answer: 'Kỳ tới của khoản vay đến hạn ngày 25/10/2026, số tiền 2.350.000 đ. Hiện khoản vay không có số tiền quá hạn.',
    cards: [
      { kind: 'kv', title: `Khoản vay ${loanNumber}`, items: [{ label: 'Kỳ tới', value: '25/10/2026' }, { label: 'Số tiền', value: '2.350.000 đ' }, { label: 'Quá hạn', value: '0 đ' }] },
      {
        kind: 'table',
        title: 'Ba kỳ gần nhất',
        columns: ['Kỳ', 'Ngày', 'Số tiền'],
        rows: [['3', '25/10/2026', '2.350.000 đ'], ['4', '25/11/2026', '2.350.000 đ'], ['5', '25/12/2026', '2.350.000 đ']],
      },
    ],
    actions: [
      { key: 'tra_no', label: 'Thanh toán khoản vay', target: { screen: 'LoanPayment', params: { loanNumber } } },
      { key: 'mo_khoan_vay', label: 'Mở khoản vay', target: { screen: 'LoanServicingDetail', params: { loanNumber } } },
    ],
    citations: [{ id: 'NV-LICH-TRA-01', kind: 'HUONG_DAN', label: 'Đọc lịch trả nợ', checkedAt: '2026-10-15' }],
    suggestions: [PIN],
    mode: 'llm',
  };
}

function tienGiu(): ChatResponseDto {
  return {
    turnId: turnId(),
    answer:
      'Ví của bạn đang giữ 5.000.000 đ: 3.000.000 đ cho cam kết góp vốn chưa thành Note và 2.000.000 đ cho lệnh mua đang chờ khớp. Tiền giữ trả về ví khi lệnh bị hủy hoặc đợt gọi vốn không đủ vốn.',
    cards: [
      {
        kind: 'kv',
        title: 'Ví nhà đầu tư',
        items: [
          { label: 'Khả dụng', value: '95.000.000 đ' },
          { label: 'Giữ cho cam kết góp vốn', value: '3.000.000 đ' },
          { label: 'Giữ cho lệnh mua', value: '2.000.000 đ' },
        ],
      },
    ],
    actions: [
      { key: 'lenh_cua_toi', label: 'Lệnh của tôi', target: { screen: 'MyBookOrders', params: {} } },
      { key: 'danh_muc', label: 'Danh mục đầu tư', target: { screen: 'Portfolio', params: {} } },
    ],
    citations: [{ id: 'NDT-GIU-TIEN-01', kind: 'CHINH_SACH', label: 'Tiền giữ trên chợ Notes', checkedAt: '2026-10-15' }],
    suggestions: [LENH, DANH_MUC],
    mode: 'template',
    disclaimer: 'Thông tin chỉ để tham khảo, không phải tư vấn đầu tư.',
  };
}

function kyHan(): ChatResponseDto {
  return {
    turnId: turnId(),
    answer: 'Hợp đồng vay ngang hàng trong cơ chế thử nghiệm không được quá 02 năm, nên kỳ hạn tối đa trên FINORA là 24 tháng.',
    citations: [
      {
        id: 'LAW-P2P-2025',
        kind: 'LUAT',
        label: 'Nghị định 94/2025/NĐ-CP, Điều 11 khoản 1 điểm c',
        url: 'https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/5/94-ndcp.signed.pdf',
        checkedAt: '2026-10-10',
      },
    ],
    mode: 'llm',
    disclaimer: 'Đây là tóm tắt để tham khảo, không thay thế văn bản chính thức.',
  };
}

function kiemThu(): ChatResponseDto {
  return {
    turnId: turnId(),
    answer: 'Câu trả lời kiểm thử: chỉ thẻ "Hợp lệ", nút "Danh mục đầu tư" và căn cứ không có link được hiện.',
    cards: [
      { kind: 'chart', title: 'Thẻ kiểu lạ' },
      { kind: 'progress', title: 'Tiến độ thiếu số' },
      { kind: 'kv', title: 'Hợp lệ', items: [{ label: 'Khóa', value: 'Giá trị' }] },
    ],
    actions: [
      { key: 'la', label: 'Màn không có', target: { screen: 'AdminPanel', params: {} } },
      { key: 'so_lenh', label: 'Sổ lệnh sai tham số', target: { screen: 'OrderBook', params: { listingId: 'abc' } } },
      { key: 'web', label: 'Đích web', target: { path: '/dashboard' } },
      { key: 'danh_muc', label: 'Danh mục đầu tư', target: { screen: 'Portfolio', params: {} } },
    ],
    citations: [{ id: 'X-1', kind: 'MOI', label: 'Căn cứ có link lạ', url: 'javascript:alert(1)', checkedAt: '2026-10-15' }],
    mode: 'khac',
  };
}

function macDinh(body: ChatRequestBody): ChatResponseDto {
  const screen = body.context?.screen ?? 'Home';
  return {
    turnId: turnId(),
    answer: 'Đây là câu trả lời mẫu của Trợ lý FINORA. Hãy chọn một câu gợi ý bên dưới để xem thẻ số liệu và nút mở màn.',
    suggestions: SUGGESTIONS.get(screen) ?? [HO_SO, DANH_MUC],
    mode: 'llm',
  };
}

function reply(body: ChatRequestBody): ChatResponseDto {
  const text = body.message.toLowerCase();
  const id = body.suggestionId ?? '';
  if (text.includes('#kiemthu')) return kiemThu();
  if (text.includes('#rutgon')) return { ...kyToi(body), mode: 'fallback' };
  if (id === CHUA_GIAI_NGAN.id || id === HO_SO.id || text.includes('giải ngân')) return chuaGiaiNgan(body);
  if (id === KY_TOI.id || text.includes('kỳ tới')) return kyToi(body);
  if (id === TIEN_GIU.id || id === DANH_MUC.id || text.includes('bị giữ')) return tienGiu();
  if (text.includes('24 tháng') || text.includes('tối đa')) return kyHan();
  return macDinh(body);
}

export const chat = async (body: ChatRequestBody): Promise<ChatResponseDto> => {
  if (body.message.includes('#nhanh')) {
    await mockResponse('assistant', null);
    throw new ApiError(429, 'mock rate limit', 'ASSISTANT_RATE_LIMITED', 'Bạn hỏi hơi nhanh, thử lại sau ít phút.');
  }
  return mockResponse('assistant', reply(body));
};

export const suggestions = (screen: string | null): Promise<SuggestionItem[]> =>
  mockResponse('assistant', SUGGESTIONS.get(screen ?? 'Home') ?? []);

export const feedback = async (): Promise<void> => {
  await mockResponse('assistant', null);
};
