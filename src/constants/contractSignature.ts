/**
 * Ký hợp đồng PAdES nhiều bên (R5, W3C): mã lỗi và câu hiển thị dùng chung cho màn hợp đồng của người vay
 * (`applications`) và nhà đầu tư (`investment`), để hai phía nói cùng một điều về cùng một tình huống.
 */

/** 409: một bên khác đang có phiên ký chờ trên hợp đồng; thử lại sau, cùng ý định (giữ idempotency key). */
export const SIGNATURE_IN_PROGRESS_CODE = 'CONTRACT_SIGNATURE_IN_PROGRESS';

/** 503: chữ ký nhà cung cấp trả về không khớp chứng thư; backend đã hủy lần ký và trả bên ký về chờ ký. */
export const SIGNATURE_REJECTED_CODE = 'SIGNATURE_PROVIDER_INVALID_SIGNATURE';

export const SIGNATURE_IN_PROGRESS_MESSAGE =
  'Một bên khác đang ký số hợp đồng này. Các bên ký lần lượt trên cùng tệp PDF, bạn hãy đợi vài phút rồi bấm ký lại.';

export const SIGNATURE_REJECTED_MESSAGE =
  'Chữ ký trả về không khớp chứng thư nên lần ký này đã bị hủy và chưa có chữ ký nào được thêm vào hợp đồng. Bạn có thể ký lại.';

/**
 * Chữ ký hiện có trong FINORA đều chưa có giá trị pháp lý (W3C mục 11): MOCK ký bằng chứng thư demo tự sinh, VNPT
 * SmartCA chỉ dùng thuê bao môi trường thử nghiệm (UAT). Câu này phải đi kèm mọi chỗ hiển thị chữ ký.
 */
export function padesLegalNotice(provider: 'MOCK' | 'VNPT_SMART_CA'): string {
  return provider === 'MOCK'
    ? 'Chữ ký trong tệp dùng chứng thư demo “FINORA DEMO - KHONG CO GIA TRI PHAP LY” nên không có giá trị pháp lý.'
    : 'Chữ ký trong tệp dùng chứng thư VNPT SmartCA môi trường thử nghiệm (UAT) nên chưa có giá trị pháp lý.';
}
