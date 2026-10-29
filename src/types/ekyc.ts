/**
 * Contract định danh điện tử (eKYC) — khớp `finora-user` theo plan nền tảng
 * `finora-platform/.agents/plans/EKYC-002-cccd-liveness-evidence.md` (mục 3).
 *
 * Luồng: điều khoản → chụp hai mặt CCCD → kiểm tra khuôn mặt (liveness) → soát và
 * xác nhận. Mọi endpoint bọc `BaseResponse<T>`; kết quả nghiệp vụ (kể cả trượt) nằm
 * trong `resultCode` của body HTTP 200. Nhãn tiếng Việt nằm ở lớp UI, không ở đây.
 */

/** Trạng thái eKYC bền vững của hồ sơ. */
export type EkycStatus = 'PENDING' | 'VERIFIED' | 'FAILED' | 'MANUAL_REVIEW';

/** `EkycResultCode` của `finora-common` — lần gọi vừa rồi dừng ở bước nào. */
export type EkycResultCode =
  | 'DRAFT_READY'
  | 'DRAFT_EXPIRED'
  | 'VERIFIED'
  | 'OCR_FAILED'
  | 'ID_MISMATCH'
  | 'ID_TAKEN'
  | 'RATE_LIMITED'
  | 'AI_UNAVAILABLE'
  | 'RETAKE'
  | 'CARD_EXPIRED'
  | 'CARD_UNSUPPORTED'
  | 'UNDERAGE'
  | 'CONSENT_REQUIRED'
  | 'STORAGE_UNAVAILABLE'
  | 'REVIEW_PENDING'
  | 'LIVENESS_REQUIRED'
  | 'CHALLENGE_EXPIRED'
  | 'LIVENESS_PASSED'
  | 'LIVENESS_REVIEW'
  | 'LIVENESS_FAILED'
  | 'FACE_MISMATCH';

/** Mặt thẻ theo cách server gọi. */
export type EkycCardSide = 'FRONT' | 'BACK';

/**
 * Nguồn ảnh thẻ do app tự khai. Trong Expo Go không chứng minh được nguồn nên server
 * chỉ ghi nhật ký; riêng `GALLERY` khiến hồ sơ tối đa là "chờ duyệt".
 */
export type EkycImageSource = 'IN_APP_CAMERA' | 'SYSTEM_CAMERA' | 'GALLERY';

/** Cách app đọc được mã QR trên thẻ. */
export type EkycQrMethod = 'LIVE_SCAN' | 'STILL_SCAN' | 'SCANNER';

export interface EkycQrPayload {
  /** Nguyên văn chuỗi QR, dạng `ID12|CMND9|Họ tên|ddmmyyyy|Giới tính|Địa chỉ|ddmmyyyy`. */
  text: string;
  side: EkycCardSide;
  method: EkycQrMethod;
}

/** `POST /users/profile/ekyc-verify`. Mỗi base64 tối đa 6.000.000 ký tự. */
export interface EkycVerifyRequest {
  cccdFrontBase64: string;
  cccdBackBase64: string;
  frontSource: EkycImageSource;
  backSource: EkycImageSource;
  /** `null` khi app không đọc được QR — server tự giải QR trên ảnh. */
  qr: EkycQrPayload | null;
  /** Phiên bản điều khoản người dùng vừa đồng ý; server vẫn tự kiểm bản ghi đồng ý. */
  consentVersion: string;
}

/* ---------------- Điều khoản và đồng ý ---------------- */

export type EkycConsentPurpose = 'ID_DOCUMENT' | 'FACE_BIOMETRIC' | 'STORAGE_ABROAD' | 'OWN_DOCUMENT';

/** `EkycConsentResponse` — nội dung điều khoản hiện hành và trạng thái đồng ý của người dùng. */
export interface EkycConsent {
  version: string;
  title: string;
  /** Markdown đã điền chỗ trống; `textSha256` băm đúng chuỗi này. */
  body: string;
  consentLabel: string;
  purposes: EkycConsentPurpose[];
  textSha256: string;
  /** `true` khi bản ghi đồng ý mới nhất chưa rút và khớp đúng phiên bản + nội dung hiện hành. */
  accepted: boolean;
  /** ISO-8601 có offset; `null` khi chưa từng đồng ý (hoặc đã rút). */
  acceptedAt: string | null;
}

export type ClientPlatform = 'ios' | 'android' | 'web';

export interface EkycConsentAcceptRequest {
  version: string;
  textSha256: string;
  platform: ClientPlatform;
  appVersion: string;
}

/* ---------------- Kết quả xác minh ---------------- */

export type EkycCardType =
  | 'CCCD_CHIP_2021'
  | 'CAN_CUOC_2024'
  | 'CCCD_CHIP_UNKNOWN'
  | 'CCCD_BARCODE'
  | 'CMND'
  | 'UNKNOWN';

/** Nguồn của một trường: mã QR, dòng MRZ, chữ in (Tesseract), AI, hoặc người dùng tự sửa. */
export type EkycFieldSource = 'QR' | 'MRZ' | 'OCR' | 'AI' | 'USER';

export interface EkycDraftField {
  value: string | null;
  sources: EkycFieldSource[];
  /** Chỉ `true` khi trường do AI đọc (sources == ["AI"]) và thuộc nhóm được sửa. */
  editable: boolean;
}

export type EkycDraftFieldKey =
  | 'idNumber'
  | 'fullName'
  | 'dateOfBirth'
  | 'gender'
  | 'address'
  | 'placeOfOrigin'
  | 'birthRegistrationPlace'
  | 'issueDate'
  | 'expiryDate';

/** Bốn trường duy nhất server cho sửa ở bước xác nhận (khi `editable`). */
export type EkycEditableFieldKey = 'fullName' | 'address' | 'placeOfOrigin' | 'birthRegistrationPlace';

/**
 * Bản nháp thông tin đọc từ thẻ. Trường không thu (ví dụ quê quán trên thẻ 2024) là
 * `null`; server cũng có thể bỏ hẳn khoá — UI coi hai trường hợp như nhau.
 */
export type EkycDraft = { [K in EkycDraftFieldKey]?: EkycDraftField | null };

export type EkycRetakeReason =
  | 'BLUR'
  | 'GLARE'
  | 'CARD_CUT'
  | 'TOO_DARK'
  | 'WRONG_SIDE'
  | 'MRZ_UNREADABLE'
  | 'QR_UNREADABLE'
  | 'PORTRAIT_UNUSABLE'
  | 'SOURCES_DISAGREE'
  | 'NO_DATA';

export interface EkycRetakeItem {
  side: EkycCardSide;
  reason: EkycRetakeReason;
  /** Thông điệp tiếng Việt của server — ưu tiên hơn bản dự phòng ở app. */
  message: string | null;
}

export type EkycNextStep = 'LIVENESS' | 'CONFIRM' | 'NONE';

export type LivenessResult = 'PASSED' | 'REVIEW' | 'FAILED' | 'RETAKE';

/** Mã lý do liveness đã biết (plan nền tảng mục 3.6); server có thể thêm mã mới. */
export type LivenessReasonCode =
  | 'TOO_DARK'
  | 'NO_FACE'
  | 'FACE_TOO_SMALL'
  | 'BLURRY'
  | 'VIDEO_UNREADABLE'
  | 'VIDEO_TOO_SHORT'
  | 'MULTIPLE_FACES'
  | 'ACTIONS_MISMATCH'
  | 'ACTIONS_MISSING'
  | 'ACTIONS_EXTRA'
  | 'INTERVALS_MISMATCH'
  | 'IDENTITY_INCONSISTENT'
  | 'FACE_MISMATCH'
  | 'FACE_MATCH_GRAY'
  | 'MEDIA_REPLAYED';

export interface LivenessReason {
  /** Giữ kiểu chuỗi: mã lạ không được làm vỡ màn hình. */
  code: string;
  message: string | null;
}

export interface EkycLivenessSummary {
  result: LivenessResult;
  /** Cosine 0..1 giữa khuôn mặt trong video và chân dung trên thẻ. */
  faceMatchScore: number | null;
  reasons: LivenessReason[];
}

/** `EkycResultResponse` — dùng chung cho verify, liveness và confirm. */
export interface EkycResultResponse {
  status: EkycStatus;
  resultCode: EkycResultCode;
  message: string;
  ocrWarnings: string[];
  cardType: EkycCardType | null;
  /** Hồ sơ sẽ vào duyệt tay sau khi xác nhận (nguồn yếu, ảnh thư viện, liveness vùng xám...). */
  reviewRequired: boolean;
  /** Chỉ có phần tử khi `resultCode === 'RETAKE'` ở bước quét thẻ. */
  retake: EkycRetakeItem[];
  draft: EkycDraft | null;
  nextStep: EkycNextStep;
  /** Số lần thử liveness còn lại trong 24 giờ; `null` khi không áp dụng. */
  attemptsLeft: number | null;
  liveness: EkycLivenessSummary | null;
}

/* ---------------- Liveness ---------------- */

export type LivenessAction = 'FRONTAL' | 'TURN_LEFT' | 'TURN_RIGHT' | 'LOOK_UP' | 'LOOK_DOWN';

export interface LivenessStep {
  action: LivenessAction;
  /** Thời gian giữ tư thế, mili giây — server sinh ngẫu nhiên và chấm theo đúng nhịp này. */
  holdMs: number;
}

export interface LivenessVideoSpec {
  /** Giá trị `videoQuality` của expo-camera, hiện là "4:3" (640×480). */
  quality: string;
  /** Bit/giây. */
  bitrate: number;
  mute: boolean;
}

/** `POST /users/profile/ekyc/liveness/challenge` — thử thách dùng một lần, sống 90 giây. */
export interface LivenessChallenge {
  sessionId: string;
  expiresAt: string;
  maxDurationSec: number;
  steps: LivenessStep[];
  video: LivenessVideoSpec;
}

export type LivenessCaptureMode = 'VIDEO' | 'STILLS';

/** Một tệp gửi trong multipart — React Native đọc thẳng từ `uri`, không qua base64. */
export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

/** `POST /users/profile/ekyc/liveness` (multipart): video, hoặc loạt ảnh khi máy không quay được. */
export type LivenessSubmission =
  | { sessionId: string; captureMode: 'VIDEO'; platform: ClientPlatform; video: UploadFile }
  | {
      sessionId: string;
      captureMode: 'STILLS';
      platform: ClientPlatform;
      frames: UploadFile[];
      /** Thời điểm chụp từng ảnh tính từ lúc bắt đầu lịch nhắc, cùng thứ tự với `frames`. */
      frameTimesMs: number[];
    };

/* ---------------- Xác nhận ---------------- */

export type EkycConfirmEdits = Partial<Record<EkycEditableFieldKey, string>>;

/** `POST /users/profile/ekyc-confirm` — body tuỳ chọn, chỉ gửi trường người dùng đã sửa. */
export interface EkycConfirmRequest {
  edits?: EkycConfirmEdits;
}
