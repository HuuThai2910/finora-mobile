import { RESCHEDULE_EXTRA_TERMS_MIN, RESCHEDULE_REASON_MAX } from '../constants';
import { isLocalDate } from '../mappers/servicing';
import type { RescheduleType } from '../types';

export type RescheduleValues = {
  type: RescheduleType;
  fromDate: string;
  adjustedDate: string;
  extraTerms: number;
  reason: string;
  accepted: boolean;
};

export type RescheduleField = 'fromDate' | 'adjustedDate' | 'extraTerms' | 'reason' | 'accepted';

/** `blank`: ô còn trống. Lỗi này chỉ báo sau lần bấm gửi đầu, để biểu mẫu vừa mở không đỏ cả màn. */
export type FieldError = { message: string; blank: boolean };

/** Ngày luôn đến từ bảng chọn hoặc ngày gợi ý; câu này chỉ phòng dữ liệu lạ. */
const DATE_INVALID = 'Ngày chưa hợp lệ, hãy chọn lại.';

/**
 * Kiểm tra phía app cho biểu mẫu đề nghị cơ cấu, cùng các điều kiện Loan Service kiểm lại:
 * đổi ngày đến hạn thì phải chọn kỳ và ngày mới sau kỳ đó; gia hạn chỉ nhập số kỳ,
 * backend tự chọn kỳ chưa hoàn thành gần nhất. Chỉ để báo sớm; backend vẫn
 * là nơi quyết định.
 */
export function validateReschedule(
  values: RescheduleValues,
  today: string,
  maximumExtraTerms: number,
  maximumTotalTerms: number,
): Partial<Record<RescheduleField, FieldError>> {
  const errors: Partial<Record<RescheduleField, FieldError>> = {};
  if (values.type === 'INSTALLMENT_ADJUSTMENT') {
    const from = values.fromDate.trim();
    if (!from) errors.fromDate = { message: 'Chọn kỳ muốn đổi ngày trả.', blank: true };
    else if (!isLocalDate(from)) errors.fromDate = { message: DATE_INVALID, blank: false };
    const adjusted = values.adjustedDate.trim();
    if (!adjusted) errors.adjustedDate = { message: 'Chọn ngày đến hạn mới.', blank: true };
    else if (!isLocalDate(adjusted)) errors.adjustedDate = { message: DATE_INVALID, blank: false };
    else if (adjusted < today) {
      errors.adjustedDate = { message: 'Ngày trả mới không được ở quá khứ.', blank: false };
    }
    else if (!errors.fromDate && adjusted <= from) {
      errors.adjustedDate = { message: 'Ngày đến hạn mới phải sau ngày bắt đầu áp dụng.', blank: false };
    }
  } else if (
    !Number.isInteger(values.extraTerms) ||
    values.extraTerms < RESCHEDULE_EXTRA_TERMS_MIN ||
    values.extraTerms > maximumExtraTerms
  ) {
    errors.extraTerms = {
      message: maximumExtraTerms > 0
        ? `Khoản vay này chỉ được gia hạn từ ${RESCHEDULE_EXTRA_TERMS_MIN} đến ${maximumExtraTerms} kỳ để tổng thời hạn không vượt quá ${maximumTotalTerms} tháng.`
        : `Khoản vay đã đạt thời hạn tối đa ${maximumTotalTerms} tháng nên không thể gia hạn thêm kỳ.`,
      blank: false,
    };
  }

  const reason = values.reason.trim();
  if (!reason) errors.reason = { message: 'Cho FINORA biết lý do bạn cần cơ cấu.', blank: true };
  else if (reason.length > RESCHEDULE_REASON_MAX) {
    errors.reason = { message: `Lý do tối đa ${RESCHEDULE_REASON_MAX} ký tự.`, blank: false };
  }

  if (!values.accepted) errors.accepted = { message: 'Hãy xác nhận điều khoản cơ cấu trước khi gửi.', blank: true };
  return errors;
}
