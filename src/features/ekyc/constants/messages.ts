import type {
  EkycCardType,
  EkycDraftFieldKey,
  EkycFieldSource,
  EkycResultCode,
  EkycRetakeItem,
  EkycRetakeReason,
  LivenessReason,
  LivenessReasonCode,
} from '@/types/ekyc';

/**
 * Thông điệp dự phòng. Backend là nguồn thông điệp chính (trường `message`); app chỉ dùng
 * bảng này khi server không kèm thông điệp. Nội dung theo plan nền tảng EKYC-002 mục 3.6.
 */
export const RESULT_FALLBACK_MESSAGE: Record<EkycResultCode, string> = {
  DRAFT_READY: 'Đã đọc xong thẻ. Tiếp theo là bước kiểm tra khuôn mặt.',
  DRAFT_EXPIRED: 'Phiên xác minh đã hết hạn, vui lòng chụp lại CCCD.',
  VERIFIED: 'Xác minh thành công.',
  OCR_FAILED: 'Chưa đọc được thông tin trên thẻ, vui lòng chụp lại rõ hơn.',
  ID_MISMATCH: 'Số CCCD trên thẻ không khớp với hồ sơ của bạn.',
  ID_TAKEN: 'Số CCCD này đã được đăng ký cho một tài khoản khác.',
  RATE_LIMITED: 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.',
  AI_UNAVAILABLE: 'Dịch vụ xác minh đang bận, vui lòng thử lại sau.',
  RETAKE: 'Cần chụp lại ảnh thẻ cho rõ hơn.',
  CARD_EXPIRED: 'Thẻ căn cước đã hết hạn. Vui lòng dùng thẻ còn hiệu lực.',
  CARD_UNSUPPORTED: 'FINORA chỉ nhận thẻ Căn cước công dân gắn chip hoặc thẻ Căn cước.',
  UNDERAGE: 'Bạn cần đủ 18 tuổi để sử dụng dịch vụ vay và đầu tư.',
  CONSENT_REQUIRED: 'Vui lòng đọc và đồng ý điều khoản trước khi xác minh.',
  STORAGE_UNAVAILABLE: 'Hệ thống lưu trữ đang bận, vui lòng thử lại sau.',
  REVIEW_PENDING: 'Hồ sơ của bạn đang được duyệt. FINORA sẽ thông báo khi có kết quả.',
  LIVENESS_REQUIRED: 'Bạn cần hoàn tất bước kiểm tra khuôn mặt trước khi xác nhận.',
  CHALLENGE_EXPIRED: 'Phiên quay đã hết hạn, vui lòng thử lại.',
  LIVENESS_PASSED: 'Kiểm tra khuôn mặt thành công.',
  LIVENESS_REVIEW: 'Đã ghi nhận. Hồ sơ sẽ được duyệt thêm sau khi bạn xác nhận.',
  LIVENESS_FAILED: 'Chưa làm đúng các động tác. Hãy làm chậm và rõ từng động tác.',
  FACE_MISMATCH: 'Khuôn mặt chưa khớp với ảnh trên thẻ căn cước.',
};

/** Mã kết quả lạ (backend vừa thêm) mà server cũng không kèm thông điệp. */
const GENERIC_RESULT_MESSAGE = 'Chưa xác minh được. Vui lòng thử lại.';

export const RETAKE_REASON_MESSAGE: Record<EkycRetakeReason, string> = {
  BLUR: 'Ảnh bị mờ. Đưa điện thoại ra xa khoảng 20 cm, giữ yên 1 giây rồi chụp lại.',
  GLARE: 'Ảnh bị loá. Nghiêng thẻ một chút hoặc tránh đèn chiếu thẳng.',
  CARD_CUT: 'Chưa thấy đủ 4 góc thẻ. Đặt thẻ gọn trong khung.',
  WRONG_SIDE: 'Có vẻ bạn chụp nhầm mặt thẻ.',
  MRZ_UNREADABLE: 'Chưa đọc được 3 dòng ký tự ở cuối mặt sau. Chụp đủ sáng, rõ nét.',
  QR_UNREADABLE: 'Chưa đọc được mã QR. Đưa mã QR vào giữa khung và giữ yên.',
  PORTRAIT_UNUSABLE:
    'Ảnh chân dung trên thẻ bị mờ hoặc loá, chưa dùng được để so khuôn mặt. Hãy chụp lại mặt trước.',
  TOO_DARK: 'Ảnh quá tối. Ra chỗ sáng hơn.',
  SOURCES_DISAGREE: 'Thông tin đọc được ở hai mặt thẻ chưa khớp. Hãy chụp lại cả hai mặt thật rõ.',
  NO_DATA: 'Chưa đọc được thông tin trên thẻ. Hãy chụp lại rõ hơn.',
};

export const LIVENESS_REASON_MESSAGE: Record<LivenessReasonCode, string> = {
  TOO_DARK: 'Ảnh quá tối, hãy ra chỗ sáng hơn.',
  NO_FACE: 'Không thấy khuôn mặt. Giữ mặt trong khung oval.',
  FACE_TOO_SMALL: 'Mặt ở quá xa. Giữ điện thoại cách mặt khoảng một cánh tay.',
  BLURRY: 'Video bị mờ. Giữ máy yên và quay đầu chậm hơn.',
  VIDEO_UNREADABLE: 'Video không đọc được hoặc quá ngắn, vui lòng quay lại.',
  VIDEO_TOO_SHORT: 'Video không đọc được hoặc quá ngắn, vui lòng quay lại.',
  MULTIPLE_FACES: 'Chỉ một người được xuất hiện trong khung hình.',
  ACTIONS_MISMATCH: 'Chưa làm đúng các động tác theo hướng dẫn.',
  ACTIONS_MISSING: 'Chưa làm đúng các động tác theo hướng dẫn.',
  ACTIONS_EXTRA: 'Chưa làm đúng các động tác theo hướng dẫn.',
  INTERVALS_MISMATCH: 'Động tác chưa khớp nhịp hướng dẫn trên màn hình.',
  IDENTITY_INCONSISTENT: 'Khuôn mặt trong video không nhất quán.',
  FACE_MISMATCH: 'Khuôn mặt chưa khớp với ảnh trên thẻ.',
  FACE_MATCH_GRAY: 'Hệ thống chưa chắc chắn khuôn mặt khớp ảnh trên thẻ, hồ sơ sẽ được duyệt thêm.',
  MEDIA_REPLAYED: 'Video này đã được dùng trước đó.',
};

/** Nhãn nguồn của từng trường trên màn soát (plan nền tảng mục 7). */
export const SOURCE_LABEL: Record<EkycFieldSource, string> = {
  QR: 'Từ mã QR',
  MRZ: 'Từ dòng mã máy đọc',
  OCR: 'Từ chữ in trên thẻ',
  AI: 'AI đọc — hãy kiểm tra',
  USER: 'Bạn đã sửa',
};

export const CARD_TYPE_LABEL: Record<EkycCardType, string> = {
  CCCD_CHIP_2021: 'CCCD gắn chip (mẫu 2021)',
  CAN_CUOC_2024: 'Thẻ Căn cước (mẫu 2024)',
  CCCD_CHIP_UNKNOWN: 'CCCD gắn chip',
  CCCD_BARCODE: 'CCCD mã vạch',
  CMND: 'Chứng minh nhân dân',
  UNKNOWN: 'Chưa nhận diện được loại thẻ',
};

export const FIELD_LABEL: Record<EkycDraftFieldKey, string> = {
  idNumber: 'Số định danh (số CCCD)',
  fullName: 'Họ và tên',
  dateOfBirth: 'Ngày sinh',
  gender: 'Giới tính',
  // Thẻ 2024 in "Nơi cư trú"; thẻ 2021 in "Nơi thường trú" — xem `addressLabel`.
  address: 'Nơi thường trú',
  placeOfOrigin: 'Quê quán',
  birthRegistrationPlace: 'Nơi đăng ký khai sinh',
  issueDate: 'Ngày cấp',
  expiryDate: 'Có giá trị đến',
};

/** Cảnh báo mềm — không chặn xác minh, chỉ để người dùng biết cần kiểm tra lại. */
const WARNING_LABEL: Record<string, string> = {
  FULL_NAME_MISMATCH: 'Họ tên trên thẻ khác họ tên đã có trong hồ sơ.',
  DOB_MISMATCH: 'Ngày sinh trên thẻ khác ngày sinh đã có trong hồ sơ.',
  ID_PROVINCE_UNKNOWN: 'Mã tỉnh trong số định danh chưa có trong danh mục.',
  ID_STRUCTURE_MISMATCH: 'Số định danh chưa khớp với ngày sinh hoặc giới tính.',
  SOURCES_DISAGREE_PERSISTENT: 'Thông tin ở hai mặt thẻ chưa khớp nhau.',
  QR_CLIENT_MISMATCH: 'Mã QR quét trên máy khác mã QR đọc từ ảnh thẻ.',
  MRZ_ID12_CHECK_FAILED: 'Số định danh trong dòng mã máy đọc chưa qua kiểm tra.',
  EXPIRY_MILESTONE_MISMATCH: 'Hạn thẻ chưa khớp mốc đổi thẻ theo tuổi.',
};

const GENERIC_WARNING = 'Một số thông tin cần được kiểm tra thêm.';

const pick = (table: Readonly<Record<string, string>>, key: string): string | undefined =>
  Object.prototype.hasOwnProperty.call(table, key) ? table[key] : undefined;

/** Thông điệp cho một kết quả: server trước, bảng dự phòng sau, cuối cùng là câu chung. */
export function resultMessage(code: string, serverMessage?: string | null): string {
  return serverMessage?.trim() || pick(RESULT_FALLBACK_MESSAGE, code) || GENERIC_RESULT_MESSAGE;
}

export function retakeMessage(item: EkycRetakeItem): string {
  return item.message?.trim() || pick(RETAKE_REASON_MESSAGE, item.reason) || RESULT_FALLBACK_MESSAGE.RETAKE;
}

export function livenessReasonMessage(reason: LivenessReason): string | null {
  return reason.message?.trim() || pick(LIVENESS_REASON_MESSAGE, reason.code) || null;
}

/** Nhãn cảnh báo đã bỏ trùng; mã lạ gộp thành một câu chung thay vì hiện mã thô. */
export function warningLabels(codes: readonly string[]): string[] {
  return Array.from(new Set(codes.map(code => pick(WARNING_LABEL, code) ?? GENERIC_WARNING)));
}

export function addressLabel(cardType: EkycCardType | null): string {
  return cardType === 'CAN_CUOC_2024' ? 'Nơi cư trú' : FIELD_LABEL.address;
}
