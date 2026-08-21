import { useState } from 'react';
import { isValid, type FieldErrors } from '../schemas/authForms';

/**
 * Quản lý lỗi form theo từng ô nhập cho các màn auth.
 *
 * Nguyên tắc trải nghiệm: chỉ báo lỗi khi người dùng rời ô (blur) hoặc bấm gửi,
 * không báo theo từng phím gõ; nhưng khi họ quay lại sửa thì xoá lỗi ngay để
 * không mắng người đang sửa sai.
 */
export function useFieldErrors<T>(validateAll: (values: T) => FieldErrors) {
  const [errors, setErrors] = useState<FieldErrors>({});

  /** Gọi trong `onBlur`: chỉ cập nhật lỗi của đúng ô vừa rời, giữ nguyên các ô khác. */
  const validateField = (values: T, field: string) => {
    const found = validateAll(values);
    setErrors(prev => {
      const next = { ...prev };
      if (found[field]) next[field] = found[field];
      else delete next[field];
      return next;
    });
  };

  /** Gọi trong `onChangeText`: người dùng đang sửa thì gỡ lỗi của ô đó. */
  const clearField = (field: string) => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  /** Gọi khi bấm gửi: validate toàn bộ, trả về `true` nếu hợp lệ. */
  const validateSubmit = (values: T): boolean => {
    const found = validateAll(values);
    setErrors(found);
    return isValid(found);
  };

  return { errors, validateField, clearField, validateSubmit };
}
