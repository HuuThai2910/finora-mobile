/**
 * Contract của finora-notification cho thông báo đẩy (plan W3F của backend, D62/D63).
 * Nhóm lạ do backend bổ sung sau vẫn hiển thị được nhờ kiểu `string`.
 */
export type NotificationCategory =
  | 'FUNDING'
  | 'CONTRACT'
  | 'DISBURSEMENT'
  | 'REPAYMENT'
  | 'DELINQUENCY'
  | 'RESTRUCTURING'
  | 'WALLET'
  | 'GENERAL';

/** Một dòng của `GET /notifications/preferences`. Trong app luôn bật; chỉ push tắt được. */
export type PreferenceItemDto = {
  category: string;
  pushEnabled: boolean;
  inAppEnabled: boolean;
};

export type PreferencesDto = { categories: PreferenceItemDto[] };

export type DevicePlatform = 'IOS' | 'ANDROID' | 'UNKNOWN';

/** Kết quả `POST /notifications/devices`. Backend không trả lại token, chỉ vân tay ngắn `tokenRef`. */
export type RegisteredDeviceDto = {
  deviceId: string;
  status: 'ACTIVE' | 'REVOKED';
  platform: DevicePlatform;
  tokenRef: string;
  lastRegisteredAt: string;
};

/**
 * Trạng thái đăng ký push trên máy này, hiển thị ở màn Cài đặt thông báo.
 * - `unsupported`: web hoặc máy không nhận được push từ xa;
 * - `mocked`: miền `notification` đang chạy dữ liệu giả, không có backend để đăng ký;
 * - `not-configured`: bản build chưa có EAS projectId nên Expo không cấp token;
 * - `denied`: người dùng chưa cho phép thông báo; `canAskAgain=false` thì phải mở cài đặt hệ thống.
 */
export type PushRegistrationState =
  | { kind: 'idle' }
  | { kind: 'unsupported' }
  | { kind: 'mocked' }
  | { kind: 'not-configured' }
  | { kind: 'working' }
  | { kind: 'denied'; canAskAgain: boolean }
  | { kind: 'registered'; tokenRef: string }
  | { kind: 'error'; message: string };
