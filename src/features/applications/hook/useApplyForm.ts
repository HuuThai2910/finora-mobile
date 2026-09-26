import { useRef, useState } from 'react';
import { generateIdempotencyKey } from '@/lib/api';
import type { LoanApplication, LoanPurpose } from '@/types/loan';
import { PRICING_DISCLOSURE_VERSION } from '../constant';
import { useCreateApplicationMutation } from '../api/applicationApi';
import {
  buildApplicationRequest,
  type ApplicationFormErrors,
  type ApplicationFormValues,
} from '../schemas/applicationForm';

/** Lựa chọn khoản vay mang từ bước 1 qua params; bước 3 chỉ đọc lại, không cho sửa. */
export type ApplyFormSelection = {
  productId: number;
  amount: number;
  termMonths: number;
  expectedDisbursementDate: string;
};

export type ApplyFormSubmitOutcome =
  | { status: 'invalid'; errors: ApplicationFormErrors }
  | { status: 'created'; application: LoanApplication }
  | { status: 'failed' }
  | { status: 'busy' };

export type UpdateApplyFormField = <K extends keyof ApplicationFormValues>(
  key: K,
  value: ApplicationFormValues[K],
) => void;

const initialValues: ApplicationFormValues = {
  purposeCode: null,
  purposeDetail: '',
  monthlyIncome: '',
  monthlyDebt: '0',
  employmentMonths: '',
  educationLevel: null,
  homeOwnership: null,
  accepted: false,
};

const ERROR_KEY_BY_FIELD: Partial<Record<keyof ApplicationFormValues, keyof ApplicationFormErrors>> = {
  purposeCode: 'purpose',
  purposeDetail: 'purposeDetail',
  monthlyIncome: 'income',
  monthlyDebt: 'debt',
  employmentMonths: 'employment',
  homeOwnership: 'home',
  accepted: 'accepted',
};

function mutationMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return 'Không thể nộp hồ sơ. Vui lòng kiểm tra kết nối và thử lại.';
}

/**
 * State và thao tác nộp hồ sơ ở bước 3/3.
 *
 * - Input: lựa chọn khoản vay từ params và danh mục mục đích vay (để biết mục
 *   đích nào bắt buộc mô tả phương án sử dụng vốn).
 * - Output: giá trị/lỗi của form, `update` xoá lỗi của đúng ô vừa sửa, `submit`
 *   trả kết quả để màn quyết định cuộn tới lỗi hay báo đã nộp.
 * - Side effect: `POST /loan-applications` kèm `Idempotency-Key`; thành công thì
 *   RTK Query tự làm mới danh sách hồ sơ của tôi.
 */
export function useApplyForm(selection: ApplyFormSelection, purposes: LoanPurpose[] | undefined) {
  const [createApplication, createState] = useCreateApplicationMutation();
  // Cùng một ý định nộp thì giữ nguyên key qua các lần thử lại; chỉ đổi key sau
  // khi backend xác nhận đã tạo hồ sơ, để lần nộp kế tiếp là một hồ sơ mới.
  const idempotencyKey = useRef(generateIdempotencyKey());
  // Chặn lần bấm thứ hai lọt vào trước khi `isLoading` kịp khoá nút (hai chạm
  // trong cùng một khung hình); key trùng đã chặn hồ sơ trùng ở backend, nhưng
  // không cần gửi request thừa.
  const inFlight = useRef(false);
  const [values, setValues] = useState<ApplicationFormValues>(initialValues);
  const [errors, setErrors] = useState<ApplicationFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedPurpose = purposes?.find((item) => item.code === values.purposeCode);
  const purposeRequiresDetail = selectedPurpose?.requiresDetail ?? false;

  const update: UpdateApplyFormField = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
    const errorKey = ERROR_KEY_BY_FIELD[key];
    if (errorKey) setErrors((current) => ({ ...current, [errorKey]: undefined }));
  };

  const submit = async (): Promise<ApplyFormSubmitOutcome> => {
    if (inFlight.current) return { status: 'busy' };
    const result = buildApplicationRequest(
      {
        productId: selection.productId,
        amount: selection.amount,
        termMonths: selection.termMonths,
        expectedDisbursementDate: selection.expectedDisbursementDate,
        pricingDisclosureVersion: PRICING_DISCLOSURE_VERSION,
      },
      values,
      purposeRequiresDetail,
    );
    setErrors(result.errors);
    if (!result.request) return { status: 'invalid', errors: result.errors };

    setSubmitError(null);
    inFlight.current = true;
    try {
      const created = await createApplication({
        body: result.request,
        idempotencyKey: idempotencyKey.current,
      }).unwrap();
      idempotencyKey.current = generateIdempotencyKey();
      return { status: 'created', application: created };
    } catch (error) {
      // Giữ nguyên key nếu chưa biết backend đã nhận request hay chưa để lần thử lại không tạo hồ sơ trùng.
      setSubmitError(mutationMessage(error));
      return { status: 'failed' };
    } finally {
      inFlight.current = false;
    }
  };

  return {
    values,
    errors,
    update,
    submit,
    submitting: createState.isLoading,
    submitError,
    purposeRequiresDetail,
  };
}
