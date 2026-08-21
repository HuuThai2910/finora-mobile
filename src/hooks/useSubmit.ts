import { useCallback, useRef, useState } from 'react';
import { toUserMessage } from '@/lib/api';

export type SubmitState<TArgs extends unknown[], TResult> = {
  submit: (...args: TArgs) => Promise<TResult | null>;
  submitting: boolean;
  /** Thông điệp đã dịch sang ngôn ngữ người dùng, `null` nếu chưa lỗi. */
  error: string | null;
  clearError: () => void;
};

/**
 * Bọc một mutation thành ba trạng thái đang gửi / lỗi / kết quả.
 *
 * Trả `null` khi thất bại để màn hình phân biệt được với kết quả thật mà không
 * phải tự viết `try/catch`. Lỗi không bị nuốt: nó được dịch sang thông điệp
 * người dùng và giữ lại cho màn hình hiển thị.
 *
 * Cờ chống bấm lặp nằm ở `ref` chứ không phải state vì hai lần chạm liên tiếp
 * xảy ra trong cùng một chu kỳ render, lúc đó state chưa kịp cập nhật.
 */
export function useSubmit<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
): SubmitState<TArgs, TResult> {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);

  const submit = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      if (running.current) return null;

      running.current = true;
      setSubmitting(true);
      setError(null);

      try {
        return await action(...args);
      } catch (e) {
        setError(toUserMessage(e));
        return null;
      } finally {
        running.current = false;
        setSubmitting(false);
      }
    },
    [action],
  );

  return { submit, submitting, error, clearError: () => setError(null) };
}
