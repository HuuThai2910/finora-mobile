import { useRef, useState } from 'react';
import { ApiError, generateIdempotencyKey, toUserMessage } from '@/lib/api';
import { submitRescheduleRequest } from '../api/servicingApi';
import { RESCHEDULE_EXTRA_TERMS_MIN } from '../constants';
import { validateReschedule, type RescheduleField, type RescheduleValues } from '../schemas/reschedule';
import type { RescheduleRequest } from '../types';

/**
 * Hai lỗi nghĩa là số liệu trên màn đã cũ: điều khoản vừa đổi phiên bản, hoặc khoản vay
 * vừa có một đề nghị khác đang xử lý. Gặp hai lỗi này thì tải lại màn để người vay thấy
 * đúng điều khoản/đề nghị hiện hành.
 */
const STALE_CODES: ReadonlySet<string> = new Set(['RESTRUCTURE_TERMS_CHANGED', 'ACTIVE_RESTRUCTURE_REQUEST_EXISTS']);

type Options = {
  loanNumber: string;
  /** Phiên bản điều khoản người vay đang đọc, gửi kèm để backend đối chiếu. */
  termsVersion: string;
  today: string;
  defaultFromDate: string;
  onSubmitted: (request: RescheduleRequest) => void;
  onStale: () => void;
};

/**
 * Trạng thái và thao tác gửi của biểu mẫu đề nghị cơ cấu.
 *
 * - State giữ cục bộ trong biểu mẫu; rời màn là bỏ bản nháp (chưa gửi thì chưa có gì).
 * - Một khoá idempotency cho cả màn: bấm gửi lại sau lỗi mạng vẫn là cùng một ý định,
 *   backend trả lại đúng đề nghị đã lưu thay vì tạo bản thứ hai.
 * - Chống bấm lặp bằng cờ `busy`; lỗi ô chỉ báo đỏ sau lần gửi đầu (trừ lỗi sai dạng).
 */
export function useRescheduleForm({ loanNumber, termsVersion, today, defaultFromDate, onSubmitted, onStale }: Options) {
  const key = useRef(generateIdempotencyKey()).current;
  const [values, setValues] = useState<RescheduleValues>({
    type: 'TERM_EXTENSION',
    fromDate: defaultFromDate,
    adjustedDate: '',
    extraTerms: RESCHEDULE_EXTRA_TERMS_MIN,
    reason: '',
    accepted: false,
  });
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errors = validateReschedule(values, today);
  const valid = Object.keys(errors).length === 0;

  const set = <K extends keyof RescheduleValues>(field: K, value: RescheduleValues[K]) =>
    setValues(current => ({ ...current, [field]: value }));

  const errorOf = (field: RescheduleField): string | undefined => {
    const item = errors[field];
    return item && (attempted || !item.blank) ? item.message : undefined;
  };

  const submit = async () => {
    setAttempted(true);
    if (busy || !valid) return;
    setBusy(true);
    setError(null);
    try {
      const created = await submitRescheduleRequest(
        loanNumber,
        {
          requestType: values.type,
          rescheduleFromDate: values.fromDate.trim(),
          ...(values.type === 'TERM_EXTENSION'
            ? { extraTerms: values.extraTerms }
            : { adjustedDueDate: values.adjustedDate.trim() }),
          reasonComment: values.reason.trim(),
          confirmedTermsVersion: termsVersion,
        },
        key,
      );
      onSubmitted(created);
    } catch (cause) {
      setError(toUserMessage(cause));
      if (cause instanceof ApiError && STALE_CODES.has(cause.code)) onStale();
    } finally {
      setBusy(false);
    }
  };

  return { values, set, errorOf, submit, busy, error };
}
