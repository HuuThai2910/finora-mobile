import {
  RESCHEDULE_EXTRA_TERMS_MAX,
  RESCHEDULE_EXTRA_TERMS_MIN,
  RESCHEDULE_REASON_MAX,
} from '../constants';
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
 * ngày bắt đầu không ở quá khứ (`RESCHEDULE_DATE_IN_PAST`), đổi ngày đến hạn thì ngày mới
 * phải sau ngày bắt đầu, gia hạn 1–120 kỳ, lý do 1–500 ký tự. Chỉ để báo sớm; backend vẫn
 * là nơi quyết định.
 */
export function validateReschedule(
  values: RescheduleValues,
  today: string,
): Partial<Record<RescheduleField, FieldError>> {
  const errors: Partial<Record<RescheduleField, FieldError>> = {};
  const from = values.fromDate.trim();
  if (!from) errors.fromDate = { message: 'Chọn kỳ bắt đầu áp dụng.', blank: true };
  else if (!isLocalDate(from)) errors.fromDate = { message: DATE_INVALID, blank: false };
  else if (from < today) errors.fromDate = { message: 'Ngày bắt đầu không được trước hôm nay.', blank: false };

  if (values.type === 'INSTALLMENT_ADJUSTMENT') {
    const adjusted = values.adjustedDate.trim();
    if (!adjusted) errors.adjustedDate = { message: 'Chọn ngày đến hạn mới.', blank: true };
    else if (!isLocalDate(adjusted)) errors.adjustedDate = { message: DATE_INVALID, blank: false };
    else if (!errors.fromDate && adjusted <= from) {
      errors.adjustedDate = { message: 'Ngày đến hạn mới phải sau ngày bắt đầu áp dụng.', blank: false };
    }
  } else if (
    !Number.isInteger(values.extraTerms) ||
    values.extraTerms < RESCHEDULE_EXTRA_TERMS_MIN ||
    values.extraTerms > RESCHEDULE_EXTRA_TERMS_MAX
  ) {
    errors.extraTerms = {
      message: `Số kỳ gia hạn từ ${RESCHEDULE_EXTRA_TERMS_MIN} đến ${RESCHEDULE_EXTRA_TERMS_MAX}.`,
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
