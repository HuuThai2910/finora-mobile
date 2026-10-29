import { useState } from 'react';
import type { EkycConfirmEdits, EkycEditableFieldKey } from '@/types/ekyc';
import { isEditableKey, type DraftRow } from '../mappers/draftFields';

/** Server giới hạn mỗi trường sửa tối đa 500 ký tự. */
const MAX_EDIT_LENGTH = 500;

/**
 * Bản sửa của người dùng cho các trường AI đọc (`editable`) trên màn soát — form state giữ
 * ngay trong màn, không đưa vào session.
 *
 * Chỉ trường thực sự đổi so với giá trị AI đọc mới được gửi trong `edits` (server đổi nguồn
 * trường đó thành `USER`). Kiểm tra phía app chỉ để báo sớm; server vẫn kiểm lại.
 */
export function useDraftEdits(rows: readonly DraftRow[]) {
  const [edits, setEdits] = useState<EkycConfirmEdits>({});

  const original = (row: DraftRow): string => row.field.value ?? '';

  const valueOf = (row: DraftRow): string => {
    const edited = isEditableKey(row.key) ? edits[row.key] : undefined;
    return edited ?? original(row);
  };

  const isEdited = (row: DraftRow): boolean => row.editable && valueOf(row).trim() !== original(row).trim();

  const errorOf = (row: DraftRow): string | null => {
    if (!isEdited(row)) return null;
    const value = valueOf(row).trim();
    if (!value) return 'Vui lòng nhập thông tin này.';
    if (value.length > MAX_EDIT_LENGTH) return `Tối đa ${MAX_EDIT_LENGTH} ký tự.`;
    return null;
  };

  const setValue = (key: EkycEditableFieldKey, value: string) => setEdits(prev => ({ ...prev, [key]: value }));

  /** Các trường đã đổi, đã cắt khoảng trắng — gửi kèm khi xác nhận. */
  const changedEdits = (): EkycConfirmEdits => {
    const result: EkycConfirmEdits = {};
    rows.forEach(row => {
      if (isEditableKey(row.key) && isEdited(row)) result[row.key] = valueOf(row).trim();
    });
    return result;
  };

  return {
    valueOf,
    isEdited,
    errorOf,
    setValue,
    changedEdits,
    hasErrors: rows.some(row => errorOf(row) !== null),
  };
}
