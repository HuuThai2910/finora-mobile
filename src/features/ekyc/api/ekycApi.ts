import { authFetchWithToken, authUploadWithToken } from '@/lib/api';
import { APP_VERSION, CLIENT_PLATFORM } from '@/lib/appInfo';
import { isMocked } from '@/lib/mockFlag';
import * as ekycMock from '@/lib/mocks/ekyc';
import type {
  EkycConfirmEdits,
  EkycConfirmRequest,
  EkycConsent,
  EkycConsentAcceptRequest,
  EkycResultResponse,
  EkycVerifyRequest,
  LivenessChallenge,
  LivenessSubmission,
} from '@/types/ekyc';
import { normalizeEkycResult, type EkycResultWire } from '../mappers/result';

/**
 * Endpoint định danh điện tử của `finora-user`, gọi qua Gateway bằng token của phiên đăng
 * nhập (eKYC luôn chạy sau khi đã đăng nhập, quyền `user:cccd:scan`).
 *
 * Response bọc trong `BaseResponse` của `finora-common`, nên bóc `data` ngay tại đây. Kết quả
 * nghiệp vụ (kể cả trượt) đến trong body 200 với `resultCode`; riêng bước xin thử thách liveness
 * ném lỗi HTTP (`ApiError.code` = `DRAFT_EXPIRED` / `CONSENT_REQUIRED` / `REVIEW_PENDING` /
 * `RATE_LIMITED`). Không log body — có ảnh giấy tờ và thông tin định danh.
 */

/** Bao response chuẩn của mọi service Java. */
type BaseResponse<T> = { code: number; message: string; data: T };

const CONSENT_PATH = '/users/profile/ekyc/consent';

const DEFAULT_TIMEOUT_MS = 30_000;
/** Đọc thẻ chạy QR + MRZ + chữ in, đôi khi thêm AI — chậm hơn request thường nhiều. */
const VERIFY_TIMEOUT_MS = 90_000;
/** Upload video vài MB qua mạng di động rồi chờ phân tích (server chờ AI tới 60 giây). */
const LIVENESS_TIMEOUT_MS = 120_000;

/** Điều khoản hiện hành và trạng thái đồng ý của người dùng. */
export const getEkycConsent = async (signal?: AbortSignal): Promise<EkycConsent> => {
  if (isMocked('ekyc')) return ekycMock.getEkycConsent();

  const response = await authFetchWithToken<BaseResponse<EkycConsent>>(CONSENT_PATH, {
    signal,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  });
  return response.data;
};

/**
 * Ghi nhận đồng ý cho đúng bản điều khoản vừa hiển thị (`version` + `textSha256`). Điều khoản
 * vừa đổi phía server thì nhận `409 CONSENT_VERSION_STALE` — bên gọi tải lại để đọc bản mới.
 */
export const acceptEkycConsent = async (
  consent: Pick<EkycConsent, 'version' | 'textSha256'>,
): Promise<EkycConsent> => {
  const request: EkycConsentAcceptRequest = {
    version: consent.version,
    textSha256: consent.textSha256,
    platform: CLIENT_PLATFORM,
    appVersion: APP_VERSION,
  };
  if (isMocked('ekyc')) return ekycMock.acceptEkycConsent(request);

  const response = await authFetchWithToken<BaseResponse<EkycConsent>>(CONSENT_PATH, {
    method: 'POST',
    body: JSON.stringify(request),
    timeoutMs: DEFAULT_TIMEOUT_MS,
  });
  return response.data;
};

/**
 * Rút lại đồng ý: server xoá ảnh/video bằng chứng và đưa hồ sơ về chưa xác minh (vẫn giữ số
 * định danh đã mã hoá để chống một CCCD nhiều tài khoản). Trả về điều khoản với `accepted=false`.
 */
export const withdrawEkycConsent = async (): Promise<EkycConsent> => {
  if (isMocked('ekyc')) return ekycMock.withdrawEkycConsent();

  const response = await authFetchWithToken<BaseResponse<EkycConsent>>(CONSENT_PATH, {
    method: 'DELETE',
    timeoutMs: DEFAULT_TIMEOUT_MS,
  });
  return response.data;
};

/**
 * Bước quét: gửi ảnh hai mặt CCCD, nhận `DRAFT_READY` (sang liveness), `RETAKE` (chụp lại
 * đúng mặt) hoặc một mã từ chối. Hồ sơ chưa được lưu gì ở bước này.
 */
export const verifyEkyc = async (request: EkycVerifyRequest): Promise<EkycResultResponse> => {
  if (isMocked('ekyc')) return ekycMock.verifyEkyc(request);

  const response = await authFetchWithToken<BaseResponse<EkycResultWire>>('/users/profile/ekyc-verify', {
    method: 'POST',
    body: JSON.stringify(request),
    timeoutMs: VERIFY_TIMEOUT_MS,
  });
  return normalizeEkycResult(response.data);
};

/** Xin thử thách liveness dùng một lần (sống 90 giây) — gọi ngay trước khi quay. */
export const requestLivenessChallenge = async (): Promise<LivenessChallenge> => {
  if (isMocked('ekyc')) return ekycMock.requestLivenessChallenge();

  const response = await authFetchWithToken<BaseResponse<LivenessChallenge>>(
    '/users/profile/ekyc/liveness/challenge',
    { method: 'POST', timeoutMs: DEFAULT_TIMEOUT_MS },
  );
  return response.data;
};

/**
 * React Native gửi phần tệp dạng `{ uri, name, type }` và tự đọc tệp từ đĩa khi gửi; kiểu
 * `FormData` của DOM chỉ khai báo `string | Blob` nên phải ép kiểu tại đúng chỗ này.
 */
const appendFile = (form: FormData, field: string, file: { uri: string; name: string; type: string }) =>
  form.append(field, file as unknown as Blob);

function toLivenessForm(submission: LivenessSubmission): FormData {
  const form = new FormData();
  form.append('sessionId', submission.sessionId);
  form.append('captureMode', submission.captureMode);
  form.append('platform', submission.platform);

  if (submission.captureMode === 'VIDEO') {
    appendFile(form, 'video', submission.video);
  } else {
    submission.frames.forEach(frame => appendFile(form, 'frames', frame));
    form.append('frameTimesMs', JSON.stringify(submission.frameTimesMs));
  }
  return form;
}

/** Gửi video (hoặc loạt ảnh) liveness bằng multipart — không bao giờ qua base64. */
export const submitLiveness = async (submission: LivenessSubmission): Promise<EkycResultResponse> => {
  if (isMocked('ekyc')) return ekycMock.submitLiveness(submission);

  const response = await authUploadWithToken<BaseResponse<EkycResultWire>>(
    '/users/profile/ekyc/liveness',
    toLivenessForm(submission),
    { timeoutMs: LIVENESS_TIMEOUT_MS },
  );
  return normalizeEkycResult(response.data);
};

/**
 * Bước xác nhận. Chỉ gửi `edits` cho trường người dùng đã sửa (server chỉ nhận trường
 * `editable`, trường khác → `400 EDIT_NOT_ALLOWED`). Kết quả: `VERIFIED` hoặc `REVIEW_PENDING`.
 */
export const confirmEkyc = async (edits?: EkycConfirmEdits): Promise<EkycResultResponse> => {
  const request: EkycConfirmRequest = edits && Object.keys(edits).length > 0 ? { edits } : {};
  if (isMocked('ekyc')) return ekycMock.confirmEkyc(request);

  const response = await authFetchWithToken<BaseResponse<EkycResultWire>>('/users/profile/ekyc-confirm', {
    method: 'POST',
    body: JSON.stringify(request),
    timeoutMs: DEFAULT_TIMEOUT_MS,
  });
  return normalizeEkycResult(response.data);
};
