import { ApiError } from '@/lib/api';
import { hasMockScenario } from '@/lib/mockFlag';
import type {
  EkycConfirmRequest,
  EkycConsent,
  EkycConsentAcceptRequest,
  EkycResultResponse,
  EkycStatus,
  EkycVerifyRequest,
  LivenessAction,
  LivenessChallenge,
  LivenessStep,
  LivenessSubmission,
} from '@/types/ekyc';
import { mockResponse } from './delay';
import { EKYC_CONSENT, EKYC_DRAFT_AI_RESULT, EKYC_DRAFT_RESULT } from './fixtures';

/**
 * Dữ liệu giả cho miền `ekyc` — chạy hết luồng điều khoản → chụp thẻ → liveness → xác nhận
 * trên máy không có backend. Mock đóng vai server theo plan nền tảng EKYC-002 mục 3: giữ trạng
 * thái trong bộ nhớ (mất khi tải lại app), trả đúng mã lỗi/thông điệp server sẽ trả, để màn
 * hình không bị "luôn thành công". Bật thêm nhánh hiếm bằng `EXPO_PUBLIC_MOCK_SCENARIOS`.
 */

const state: {
  acceptedAt: string | null;
  profile: EkycStatus;
  retakeCount: number;
  draft: EkycResultResponse | null;
  challenge: { sessionId: string; expiresAt: number } | null;
  liveness: 'PASS' | 'REVIEW' | null;
  livenessAttempts: number;
  livenessFails: number;
} = {
  acceptedAt: null,
  profile: 'PENDING',
  retakeCount: 0,
  draft: null,
  challenge: null,
  liveness: null,
  livenessAttempts: 0,
  livenessFails: 0,
};

const MAX_RETAKES = 2;
const MAX_LIVENESS_FAILS = 3;
const CHALLENGE_TTL_MS = 90_000;

const reply = (patch: Partial<EkycResultResponse> & Pick<EkycResultResponse, 'resultCode' | 'message'>) =>
  mockResponse<EkycResultResponse>('ekyc', {
    status: state.profile,
    ocrWarnings: [],
    cardType: null,
    reviewRequired: false,
    retake: [],
    draft: null,
    nextStep: 'NONE',
    attemptsLeft: null,
    liveness: null,
    ...patch,
  });

const fail = (status: number, code: string, message: string): Promise<never> =>
  mockResponse('ekyc', null).then(() => {
    throw new ApiError(status, JSON.stringify({ code, message }), code, message);
  });

const currentConsent = (): EkycConsent => ({
  ...EKYC_CONSENT,
  accepted: state.acceptedAt !== null,
  acceptedAt: state.acceptedAt,
});

export const getEkycConsent = (): Promise<EkycConsent> => mockResponse('ekyc', currentConsent());

export const acceptEkycConsent = (request: EkycConsentAcceptRequest): Promise<EkycConsent> => {
  if (request.version !== EKYC_CONSENT.version || request.textSha256 !== EKYC_CONSENT.textSha256) {
    return fail(409, 'CONSENT_VERSION_STALE', 'Điều khoản vừa được cập nhật, vui lòng đọc lại.');
  }
  state.acceptedAt = new Date().toISOString();
  return mockResponse('ekyc', currentConsent());
};

export const withdrawEkycConsent = (): Promise<EkycConsent> => {
  state.acceptedAt = null;
  state.profile = 'PENDING';
  state.draft = null;
  state.challenge = null;
  state.liveness = null;
  return mockResponse('ekyc', currentConsent());
};

export const verifyEkyc = (request: EkycVerifyRequest): Promise<EkycResultResponse> => {
  if (state.profile === 'VERIFIED') {
    return reply({ resultCode: 'VERIFIED', message: 'Hồ sơ của bạn đã được xác minh trước đó.' });
  }
  if (state.profile === 'MANUAL_REVIEW') {
    return reply({
      resultCode: 'REVIEW_PENDING',
      message: 'Hồ sơ của bạn đang được duyệt. FINORA sẽ thông báo khi có kết quả.',
    });
  }
  if (!state.acceptedAt) {
    return reply({ resultCode: 'CONSENT_REQUIRED', message: 'Vui lòng đọc và đồng ý điều khoản trước khi xác minh.' });
  }
  if (hasMockScenario('ekyc-reject')) {
    return reply({ resultCode: 'CARD_EXPIRED', message: 'Thẻ căn cước đã hết hạn. Vui lòng dùng thẻ còn hiệu lực.' });
  }
  if (hasMockScenario('ekyc-retake') && state.retakeCount < MAX_RETAKES) {
    state.retakeCount += 1;
    return reply({
      resultCode: 'RETAKE',
      message: 'Cần chụp lại mặt trước.',
      retake: [
        {
          side: 'FRONT',
          reason: 'BLUR',
          message: 'Ảnh mặt trước bị mờ. Đưa điện thoại ra xa khoảng 20 cm, giữ yên 1 giây rồi chụp lại.',
        },
      ],
    });
  }

  // Có QR → nguồn tất định đầy đủ; không QR → một số trường do AI đọc, phải duyệt tay.
  // Ảnh thư viện luôn đưa hồ sơ về duyệt tay (server coi GALLERY là nguồn yếu).
  const base = request.qr && !hasMockScenario('ekyc-retake') ? EKYC_DRAFT_RESULT : EKYC_DRAFT_AI_RESULT;
  const fromGallery = request.frontSource === 'GALLERY' || request.backSource === 'GALLERY';
  const draft: EkycResultResponse = {
    ...base,
    reviewRequired: base.reviewRequired || fromGallery,
  };
  state.retakeCount = 0;
  state.draft = draft;
  state.liveness = null;
  return mockResponse('ekyc', draft);
};

/** Ba hành động khác nhau theo thứ tự ngẫu nhiên, xen bước nhìn thẳng — đúng khuôn server. */
function randomSteps(): LivenessStep[] {
  const pool: LivenessAction[] = ['TURN_LEFT', 'TURN_RIGHT', 'LOOK_UP', 'LOOK_DOWN'];
  const picked = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  const hold = () => 900 + Math.round(Math.random() * 800);
  const steps: LivenessStep[] = [{ action: 'FRONTAL', holdMs: 1500 }];
  picked.forEach(action => {
    steps.push({ action, holdMs: hold() });
    steps.push({ action: 'FRONTAL', holdMs: hold() });
  });
  return steps;
}

export const requestLivenessChallenge = (): Promise<LivenessChallenge> => {
  if (state.profile === 'MANUAL_REVIEW') {
    return fail(409, 'REVIEW_PENDING', 'Hồ sơ của bạn đang được duyệt. FINORA sẽ thông báo khi có kết quả.');
  }
  if (!state.acceptedAt) {
    return fail(409, 'CONSENT_REQUIRED', 'Vui lòng đọc và đồng ý điều khoản trước khi xác minh.');
  }
  if (!state.draft) {
    return fail(409, 'DRAFT_EXPIRED', 'Phiên xác minh đã hết hạn, vui lòng chụp lại CCCD.');
  }

  const steps = randomSteps();
  const total = steps.reduce((sum, step) => sum + step.holdMs, 0);
  const expiresAt = Date.now() + CHALLENGE_TTL_MS;
  const sessionId = `mock-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  state.challenge = { sessionId, expiresAt };

  return mockResponse('ekyc', {
    sessionId,
    expiresAt: new Date(expiresAt).toISOString(),
    maxDurationSec: Math.ceil(total / 1000) + 3,
    steps,
    video: { quality: '4:3', bitrate: 1_500_000, mute: true },
  });
};

/** Trượt liveness: đếm lần trượt, đủ 3 lần thì hồ sơ chuyển duyệt tay. */
function livenessFailure(code: 'LIVENESS_FAILED' | 'FACE_MISMATCH'): Promise<EkycResultResponse> {
  state.livenessFails += 1;
  if (state.livenessFails >= MAX_LIVENESS_FAILS) {
    state.profile = 'MANUAL_REVIEW';
    state.draft = null;
    return reply({
      status: 'MANUAL_REVIEW',
      resultCode: 'REVIEW_PENDING',
      message: 'Hồ sơ của bạn đang được duyệt. FINORA sẽ thông báo khi có kết quả.',
      reviewRequired: true,
    });
  }
  const failed = code === 'FACE_MISMATCH';
  return reply({
    resultCode: code,
    message: failed
      ? 'Khuôn mặt chưa khớp với ảnh trên thẻ căn cước.'
      : 'Chưa làm đúng các động tác. Hãy làm chậm và rõ từng động tác.',
    nextStep: 'LIVENESS',
    attemptsLeft: MAX_LIVENESS_FAILS - state.livenessFails,
    liveness: {
      result: 'FAILED',
      faceMatchScore: failed ? 0.12 : null,
      reasons: [
        failed
          ? { code: 'FACE_MISMATCH', message: 'Khuôn mặt chưa khớp với ảnh trên thẻ.' }
          : { code: 'ACTIONS_MISMATCH', message: 'Chưa làm đúng các động tác theo hướng dẫn.' },
      ],
    },
  });
}

export const submitLiveness = (submission: LivenessSubmission): Promise<EkycResultResponse> => {
  const challenge = state.challenge;
  state.challenge = null; // dùng một lần, như GETDEL phía server
  if (!challenge || challenge.sessionId !== submission.sessionId || Date.now() > challenge.expiresAt) {
    return reply({ resultCode: 'CHALLENGE_EXPIRED', message: 'Phiên quay đã hết hạn, vui lòng thử lại.', nextStep: 'LIVENESS' });
  }
  const draft = state.draft;
  if (!draft) {
    return reply({ resultCode: 'DRAFT_EXPIRED', message: 'Phiên xác minh đã hết hạn, vui lòng chụp lại CCCD.' });
  }

  state.livenessAttempts += 1;
  if (hasMockScenario('ekyc-liveness-fail')) {
    if (state.livenessAttempts === 1) {
      return reply({
        resultCode: 'RETAKE',
        message: 'Cần quay lại.',
        nextStep: 'LIVENESS',
        liveness: { result: 'RETAKE', faceMatchScore: null, reasons: [{ code: 'TOO_DARK', message: 'Ảnh quá tối, hãy ra chỗ sáng hơn.' }] },
      });
    }
    return livenessFailure(state.livenessAttempts === 2 ? 'LIVENESS_FAILED' : 'FACE_MISMATCH');
  }

  // Chế độ ảnh liên tiếp không chứng minh được video liền mạch nên tối đa là "chờ duyệt".
  const gray = hasMockScenario('ekyc-review') || submission.captureMode === 'STILLS';
  state.liveness = gray ? 'REVIEW' : 'PASS';
  return reply({
    resultCode: gray ? 'LIVENESS_REVIEW' : 'LIVENESS_PASSED',
    message: gray
      ? 'Đã ghi nhận. Hồ sơ sẽ được duyệt thêm sau khi bạn xác nhận.'
      : 'Kiểm tra khuôn mặt thành công.',
    cardType: draft.cardType,
    reviewRequired: draft.reviewRequired || gray,
    ocrWarnings: draft.ocrWarnings,
    draft: draft.draft,
    nextStep: 'CONFIRM',
    liveness: {
      result: gray ? 'REVIEW' : 'PASSED',
      faceMatchScore: gray ? 0.38 : 0.71,
      reasons: gray ? [{ code: submission.captureMode === 'STILLS' ? 'STILLS_MODE' : 'FACE_MATCH_GRAY', message: null }] : [],
    },
  });
};

export const confirmEkyc = (request: EkycConfirmRequest): Promise<EkycResultResponse> => {
  const draft = state.draft;
  if (!draft) {
    return reply({ resultCode: 'DRAFT_EXPIRED', message: 'Phiên xác minh đã hết hạn, vui lòng chụp lại CCCD.' });
  }
  if (!state.liveness) {
    return reply({
      resultCode: 'LIVENESS_REQUIRED',
      message: 'Bạn cần hoàn tất bước kiểm tra khuôn mặt trước khi xác nhận.',
      nextStep: 'LIVENESS',
    });
  }
  const notEditable = Object.keys(request.edits ?? {}).find(
    key => !draft.draft?.[key as keyof NonNullable<EkycResultResponse['draft']>]?.editable,
  );
  if (notEditable) {
    return fail(400, 'EDIT_NOT_ALLOWED', 'Thông tin này được đọc trực tiếp từ thẻ nên không sửa được.');
  }

  const needsReview = draft.reviewRequired || state.liveness === 'REVIEW';
  state.draft = null;
  state.liveness = null;
  state.livenessAttempts = 0;
  state.livenessFails = 0;
  state.profile = needsReview ? 'MANUAL_REVIEW' : 'VERIFIED';

  return needsReview
    ? reply({
        status: 'MANUAL_REVIEW',
        resultCode: 'REVIEW_PENDING',
        message: 'Hồ sơ của bạn đang được duyệt. FINORA sẽ thông báo khi có kết quả.',
        reviewRequired: true,
      })
    : reply({ status: 'VERIFIED', resultCode: 'VERIFIED', message: 'Xác minh eKYC thành công.' });
};
