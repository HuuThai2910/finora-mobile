import type { Gender, KycStatus, UserProfile, UserRole } from '@/types/auth';

/** `UserProfileResponse` của `finora-user`. */
export type UserProfileDto = {
  id: number;
  email: string;
  fullName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  placeOfOrigin: string | null;
  address: string | null;
  idNumber: string | null;
  phone: string | null;
  role: string | null;
  profileCompleted: boolean;
  /**
   * `EkycStatus` của finora-user (`PENDING | VERIFIED | FAILED | MANUAL_REVIEW`). Tuỳ chọn để
   * vẫn chạy với bản server cũ chưa trả trường này.
   */
  ekycStatus?: string | null;
};

const ROLES: readonly UserRole[] = ['BORROWER', 'INVESTOR', 'ADMIN'];
const GENDERS: readonly Gender[] = ['MALE', 'FEMALE', 'OTHER'];

/**
 * Vai trò lạ (backend thêm role mới) không được làm vỡ UI; coi như người vay,
 * là quyền hẹp nhất trong ba vai trò hiện có.
 */
function toRole(raw: string | null): UserRole {
  return ROLES.find(r => r === raw) ?? 'BORROWER';
}

/** Giá trị lạ coi như chưa khai — UI hiển thị "Chưa cập nhật" thay vì chuỗi thô. */
function toGender(raw: string | null): Gender | null {
  return GENDERS.find(g => g === raw) ?? null;
}

const EKYC_TO_KYC: Record<string, KycStatus> = {
  VERIFIED: 'KYC_VERIFIED',
  MANUAL_REVIEW: 'PENDING_REVIEW',
  FAILED: 'REJECTED',
  PENDING: 'NOT_STARTED',
};

/**
 * Trạng thái định danh lấy theo `ekycStatus` (nguồn sự thật của luồng eKYC): chờ duyệt tay,
 * bị từ chối, và quan trọng là **rút lại đồng ý** — khi đó hồ sơ về `PENDING` nhưng vẫn còn
 * họ tên + số định danh nên `profileCompleted` vẫn `true`; đọc cờ này sẽ hiện nhầm "đã định
 * danh". Chỉ rơi về `profileCompleted` khi server cũ chưa trả `ekycStatus` (hoặc trả mã lạ).
 */
function toKycStatus(dto: UserProfileDto): KycStatus {
  const mapped = dto.ekycStatus ? EKYC_TO_KYC[dto.ekycStatus] : undefined;
  if (mapped) return mapped;
  return dto.profileCompleted ? 'KYC_VERIFIED' : 'NOT_STARTED';
}

function toInitial(fullName: string | null, email: string): string {
  const source = fullName?.trim() || email;
  return source.charAt(0).toUpperCase();
}

export function toUserProfile(dto: UserProfileDto): UserProfile {
  return {
    id: String(dto.id),
    // Không giả tên bằng email: chưa quét eKYC thì hồ sơ đúng nghĩa là chưa có
    // tên — nơi hiển thị tự quyết định để trống hay dùng nhãn thay thế.
    fullName: dto.fullName,
    phone: dto.phone,
    email: dto.email,
    initial: toInitial(dto.fullName, dto.email),
    kycStatus: toKycStatus(dto),
    role: toRole(dto.role),
    dateOfBirth: dto.dateOfBirth,
    gender: toGender(dto.gender),
    placeOfOrigin: dto.placeOfOrigin,
    address: dto.address,
    idNumber: dto.idNumber,
    // Ba trường dưới thuộc miền chấm điểm và liên kết ngân hàng, chưa có contract.
    creditGrade: null,
    creditScore: null,
    linkedBank: null,
  };
}
