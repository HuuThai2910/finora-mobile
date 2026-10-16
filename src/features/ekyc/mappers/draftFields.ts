import type {
  EkycCardType,
  EkycDraft,
  EkycDraftField,
  EkycDraftFieldKey,
  EkycEditableFieldKey,
  EkycResultResponse,
} from '@/types/ekyc';
import { addressLabel, FIELD_LABEL } from '../constants/messages';

/** Thứ tự hiển thị như trên thẻ: định danh trước, ngày cấp/hết hạn sau cùng. */
const FIELD_ORDER: readonly EkycDraftFieldKey[] = [
  'idNumber',
  'fullName',
  'dateOfBirth',
  'gender',
  'address',
  'placeOfOrigin',
  'birthRegistrationPlace',
  'issueDate',
  'expiryDate',
];

/** Bốn trường server cho sửa; trường khác dù server lỡ đánh `editable` cũng không mở ô sửa. */
const EDITABLE_KEYS: readonly EkycEditableFieldKey[] = ['fullName', 'address', 'placeOfOrigin', 'birthRegistrationPlace'];

export const isEditableKey = (key: EkycDraftFieldKey): key is EkycEditableFieldKey =>
  (EDITABLE_KEYS as readonly EkycDraftFieldKey[]).includes(key);

export type DraftRow = {
  key: EkycDraftFieldKey;
  label: string;
  field: EkycDraftField;
  editable: boolean;
};

/** Các dòng của màn soát; trường không thu (`null` hoặc thiếu khoá) bị ẩn hẳn. */
export function toDraftRows(draft: EkycDraft, cardType: EkycCardType | null): DraftRow[] {
  return FIELD_ORDER.flatMap(key => {
    const field = draft[key];
    if (!field) return [];
    return [
      {
        key,
        label: key === 'address' ? addressLabel(cardType) : FIELD_LABEL[key],
        field,
        editable: field.editable && isEditableKey(key),
      },
    ];
  });
}

/**
 * Ghép dữ liệu cho màn soát. Kết quả liveness có thể không kèm bản nháp (server chỉ bắt buộc
 * trả ở bước quét), nên lấy bản nháp của bước quét làm dự phòng; cần duyệt tay nếu một trong
 * hai bước báo vậy, và cảnh báo của hai bước được gộp lại.
 */
export function reviewData(outcome: EkycResultResponse, scan: EkycResultResponse | null) {
  return {
    draft: outcome.draft ?? scan?.draft ?? null,
    cardType: outcome.cardType ?? scan?.cardType ?? null,
    reviewRequired: outcome.reviewRequired || (scan?.reviewRequired ?? false),
    warnings: [...outcome.ocrWarnings, ...(scan?.ocrWarnings ?? [])],
  };
}
