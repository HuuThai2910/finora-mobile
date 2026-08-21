# Tích hợp Đăng nhập, Đăng ký, Quên mật khẩu & Hồ sơ người dùng

**Ngày:** 2026-08-17
**Phạm vi:** finora-mobile ↔ finora-user (qua gateway)
**Trạng thái:** DRAFT

---

## 1. Bối cảnh

Hiện tại toàn bộ auth trên mobile là mock (`EXPO_PUBLIC_MOCK_DOMAINS` chứa `auth`).
Backend `finora-user` (port 8085, qua gateway 8080) đã có đầy đủ endpoint cho login, register, forgot-password, reset-password và user profile.

Có ba mismatch chính cần giải quyết:

| # | Mismatch | Giải pháp |
|---|----------|-----------|
| 1 | Mobile dùng phone + password, backend dùng email + password | Sửa mobile theo backend |
| 2 | Mobile có OTP sau login/register, backend trả token trực tiếp (login) hoặc không trả token (register) | Bỏ OTP khỏi luồng login/register |
| 3 | Mobile `UserProfile` khác backend `UserProfileResponse` | Merge: giữ field mobile (để rỗng), thêm field backend |

---

## 2. Luồng người dùng

### 2.1 Đăng nhập

```
LoginScreen
  → POST /api/v1/auth/login { email, password }
  → nhận AuthResponse { userId, email, fullName, roles, accessToken, refreshToken }
  → GET /api/v1/users/me (Authorization: Bearer <accessToken>)
  → nhận UserProfileResponse
  → map sang UserProfile
  → construct Session { accessToken, refreshToken, profile }
  → signIn(session)
  → RootNavigator chuyển sang MainTabs hoặc eKYC (tùy profileCompleted)
```

Không có bước OTP.

### 2.2 Đăng ký

```
RegisterScreen
  → POST /api/v1/auth/register { email, password, fullName }
  → nhận BaseResponse<AuthResponse> (không có token)
  → navigate('Login', { registered: true })
  → LoginScreen hiển thị thông báo "Đăng ký thành công, vui lòng đăng nhập"
```

Backend register không trả token — user phải login riêng.

### 2.3 Quên mật khẩu (3 màn hình)

```
Màn 1: ForgotPasswordScreen
  → nhập email
  → POST /api/v1/auth/forgot-password { email }
  → backend gửi OTP qua email (luôn trả success để chống enumeration)
  → navigate('ForgotPasswordOtp', { email })

Màn 2: ForgotPasswordOtpScreen
  → nhập 6 số OTP
  → KHÔNG gọi API (xác nhận OTP xảy ra ở bước reset)
  → navigate('ResetPassword', { email, otp })

Màn 3: ResetPasswordScreen
  → nhập mật khẩu mới + xác nhận mật khẩu
  → POST /api/v1/auth/reset-password { email, otp, newPassword }
  → thành công: navigate('Login') với thông báo "Đổi mật khẩu thành công"
  → thất bại: hiển thị lỗi (OTP sai/hết hạn, mật khẩu không đạt yêu cầu)
```

### 2.4 Lấy hồ sơ người dùng

```
GET /api/v1/users/me
  Header: Authorization: Bearer <accessToken>
  Header: X-Client-Type: mobile
  → UserProfileResponse → map sang UserProfile
```

Được gọi tự động sau login thành công.

---

## 3. Types

### 3.1 `src/types/auth.ts` — cập nhật toàn bộ

```typescript
/* --- Enums --- */
export type UserRole = 'BORROWER' | 'INVESTOR' | 'ADMIN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type KycStatus = 'NOT_STARTED' | 'PENDING_REVIEW' | 'KYC_VERIFIED' | 'REJECTED';

/* --- User Profile (merge backend + mobile) --- */
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  /** Chữ cái đầu dùng cho ảnh đại diện chữ — computed từ fullName. */
  initial: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  placeOfOrigin: string | null;
  address: string | null;
  idNumber: string | null;
  role: UserRole;
  profileCompleted: boolean;
  /* --- Mở rộng tương lai (chưa có backend) --- */
  kycStatus: KycStatus;
  creditGrade: 'A' | 'B' | 'C' | 'D' | null;
  creditScore: number | null;
  linkedBank: {
    bank: string;
    maskedNumber: string;
    holder: string;
    verified: boolean;
  } | null;
}

/* --- Session --- */
export interface Session {
  accessToken: string;
  refreshToken: string;
  profile: UserProfile;
}

/* --- Request DTOs (khớp backend) --- */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

/* --- Response DTO (transport, không dùng trực tiếp trong UI) --- */
export interface AuthResponse {
  userId: number;
  email: string;
  fullName: string;
  roles: string[];
  accessToken: string | null;
  refreshToken: string | null;
}

/** Response từ GET /users/me — chuyển qua mapper trước khi dùng. */
export interface UserProfileResponse {
  id: number;
  email: string;
  fullName: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  placeOfOrigin: string | null;
  address: string | null;
  idNumber: string | null;
  phone: string | null;
  role: UserRole;
  profileCompleted: boolean;
}
```

Bỏ: `OtpChallenge` (không dùng nữa).

### 3.2 BaseResponse wrapper

Thêm vào `src/lib/api.ts`:

```typescript
/** Wrapper chuẩn từ finora-common. */
interface BaseApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}
```

---

## 4. API Layer

### 4.1 `src/lib/api.ts` — sửa nhỏ

1. Thêm header `X-Client-Type: mobile` vào hàm `request()`.
2. Export thêm `apiFetchData<T>()` unwrap `BaseResponse<T>.data`.
3. Export thêm `apiFetchAuth<T>()` cho request cần JWT (thêm `Authorization: Bearer`).

### 4.2 `src/features/auth/api.ts` — thay mock bằng real

```typescript
import { isMocked } from '@/lib/mockFlag';
import * as authMock from '@/lib/mocks/auth';
import { apiFetchData } from '@/lib/api';
import { mapUserProfileResponse } from './mappers/profileMapper';
import type { ... } from '@/types/auth';

export async function login(req: LoginRequest): Promise<AuthResponse> {
  if (isMocked('auth')) return authMock.login(req);
  return apiFetchData<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function register(req: RegisterRequest): Promise<void> {
  if (isMocked('auth')) { authMock.register(req); return; }
  await apiFetchData<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function forgotPassword(req: ForgotPasswordRequest): Promise<void> {
  if (isMocked('auth')) return;
  await apiFetchData<string>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function resetPassword(req: ResetPasswordRequest): Promise<void> {
  if (isMocked('auth')) return;
  await apiFetchData<string>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function getProfile(accessToken: string): Promise<UserProfile> {
  if (isMocked('auth')) return authMock.getProfile();
  const raw = await apiFetchData<UserProfileResponse>('/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return mapUserProfileResponse(raw);
}

export async function logout(refreshToken: string): Promise<void> {
  if (isMocked('auth')) return;
  await apiFetchData<string>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}
```

### 4.3 Mapper — `src/features/auth/mappers/profileMapper.ts`

```typescript
import type { UserProfile, UserProfileResponse } from '@/types/auth';

export function mapUserProfileResponse(raw: UserProfileResponse): UserProfile {
  return {
    id: String(raw.id),
    email: raw.email,
    fullName: raw.fullName,
    initial: raw.fullName.trim().charAt(0).toUpperCase(),
    phone: raw.phone,
    dateOfBirth: raw.dateOfBirth,
    gender: raw.gender,
    placeOfOrigin: raw.placeOfOrigin,
    address: raw.address,
    idNumber: raw.idNumber,
    role: raw.role,
    profileCompleted: raw.profileCompleted,
    // Mở rộng tương lai — chưa có backend
    kycStatus: 'NOT_STARTED',
    creditGrade: null,
    creditScore: null,
    linkedBank: null,
  };
}
```

---

## 5. Navigation

### 5.1 `AuthStackParamList` cập nhật

```typescript
export type AuthStackParamList = {
  Login: { registered?: boolean; passwordReset?: boolean } | undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ForgotPasswordOtp: { email: string };
  ResetPassword: { email: string; otp: string };
  EkycCapture: undefined;
  Liveness: undefined;
  EkycResult: undefined;
};
```

Bỏ: `Otp: { mode: 'login' | 'register' }`.

### 5.2 `AuthNavigator` cập nhật

Thêm 3 screen mới, bỏ OtpScreen cũ:

```typescript
<Stack.Screen name="Login" component={LoginScreen} />
<Stack.Screen name="Register" component={RegisterScreen} />
<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
<Stack.Screen name="ForgotPasswordOtp" component={ForgotPasswordOtpScreen} />
<Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
<Stack.Screen name="EkycCapture" component={EkycCaptureScreen} />
<Stack.Screen name="Liveness" component={LivenessScreen} />
<Stack.Screen name="EkycResult" component={EkycResultScreen} />
```

---

## 6. Screens

### 6.1 LoginScreen (sửa)

- Field "Số điện thoại" → "Email" (`keyboardType: 'email-address'`, `autoComplete: 'email'`)
- Bỏ demo default values
- Submit: gọi `login()` → `getProfile(token)` → `signIn(session)`
- Thêm link "Quên mật khẩu?" → `nav.navigate('ForgotPassword')`
- Xử lý `route.params?.registered` và `route.params?.passwordReset` → hiện thông báo thành công
- Bỏ nút SSO Keycloak (chưa cần)
- Xử lý lỗi: hiển thị `toUserMessage(error)`

### 6.2 RegisterScreen (sửa)

- Bỏ field "Số điện thoại"
- Giữ: Họ tên, Email, Mật khẩu, Checkbox điều khoản
- Validation: fullName bắt buộc, email hợp lệ, password ≥ 8 ký tự, checkbox checked
- Submit: gọi `register()` → `nav.navigate('Login', { registered: true })`
- Bỏ navigate đến OTP

### 6.3 ForgotPasswordScreen (mới)

- Header: "Quên mật khẩu"
- Sub: "Nhập email để nhận mã xác nhận"
- 1 field: Email
- 1 nút: "Gửi mã xác nhận"
- Submit: gọi `forgotPassword()` → `nav.navigate('ForgotPasswordOtp', { email })`
- Link "Quay lại đăng nhập" → `nav.goBack()`

### 6.4 ForgotPasswordOtpScreen (mới)

- Tái sử dụng pattern UI từ OtpScreen cũ (6 ô số, hidden TextInput, countdown)
- Text: "Mã 6 số đã gửi tới email {email}"
- Khi nhập đủ 6 số và nhấn "Xác nhận": `nav.navigate('ResetPassword', { email, otp })`
- Nút "Gửi lại mã": gọi lại `forgotPassword({ email })` + reset countdown
- KHÔNG gọi API verify ở bước này

### 6.5 ResetPasswordScreen (mới)

- Header: "Đặt mật khẩu mới"
- 2 field: Mật khẩu mới + Xác nhận mật khẩu
- Validation: ≥ 8 ký tự, hai field khớp nhau
- Submit: gọi `resetPassword({ email, otp, newPassword })`
- Thành công: `nav.navigate('Login', { passwordReset: true })`
- Thất bại: hiển thị lỗi (OTP sai → quay lại nhập OTP, mật khẩu yếu → hiện lỗi tại field)

---

## 7. AuthProvider (`src/providers/AuthProvider.tsx`)

Thay đổi:

1. `Session` type mới có `refreshToken`.
2. `signIn`: nhận session đầy đủ, dùng `profileCompleted` thay cho `kycStatus` để xác định `kycCompleted`.
3. `signOut`: gọi `logout(session.refreshToken)` (fire-and-forget) rồi clear state.
4. Giữ session trong React state (không dùng SecureStore).

---

## 8. Mock fallback

- Hệ thống `isMocked('auth')` giữ nguyên.
- Khi `auth` nằm trong `EXPO_PUBLIC_MOCK_DOMAINS`, các hàm trong `api.ts` trả mock data.
- Cập nhật mock functions trong `src/lib/mocks/auth.ts` để khớp với type mới.
- Cập nhật `PROFILE` fixture trong `src/lib/mocks/fixtures.ts` theo `UserProfile` mới.
- Khi backend sẵn sàng: bỏ `auth` khỏi `EXPO_PUBLIC_MOCK_DOMAINS`.

---

## 9. Cấu hình

- `EXPO_PUBLIC_API_URL`: đổi sang gateway `http://192.168.1.153:8080/api/v1` (thay vì 8081 trực tiếp loan service).
- Giữ `EXPO_PUBLIC_MOCK_DOMAINS` chứa `auth` cho đến khi backend chạy ổn.

---

## 10. File thay đổi dự kiến

| File | Hành động |
|------|-----------|
| `src/types/auth.ts` | Sửa toàn bộ types |
| `src/lib/api.ts` | Thêm `X-Client-Type`, `apiFetchData`, `apiFetchAuth` |
| `src/features/auth/api.ts` | Thay mock bằng real API + fallback |
| `src/features/auth/mappers/profileMapper.ts` | Mới — map response → UI model |
| `src/features/auth/component/LoginScreen.tsx` | Sửa: email field, bỏ OTP, thêm quên MK |
| `src/features/auth/component/RegisterScreen.tsx` | Sửa: bỏ phone, navigate Login |
| `src/features/auth/component/ForgotPasswordScreen.tsx` | Mới |
| `src/features/auth/component/ForgotPasswordOtpScreen.tsx` | Mới |
| `src/features/auth/component/ResetPasswordScreen.tsx` | Mới |
| `src/features/auth/component/OtpScreen.tsx` | Bỏ khỏi navigator (giữ file) |
| `src/features/auth/constant.ts` | Giữ nguyên (OTP constants vẫn dùng) |
| `src/features/auth/index.tsx` | Cập nhật exports |
| `src/navigation/types.ts` | Cập nhật AuthStackParamList |
| `src/navigation/AuthNavigator.tsx` | Thay OtpScreen bằng 3 screen mới |
| `src/providers/AuthProvider.tsx` | Cập nhật Session type, signIn/signOut |
| `src/lib/mocks/auth.ts` | Cập nhật mock theo type mới |
| `src/lib/mocks/fixtures.ts` | Cập nhật PROFILE fixture |
| `.env` | Đổi API_URL sang gateway port |

---

## 11. Ngoài phạm vi

- Token persistence (SecureStore) — tương lai.
- Refresh token tự động khi hết hạn — tương lai.
- SSO/OpenID Connect — tương lai.
- Biometric login (Face ID / vân tay) — tương lai.
- eKYC integration — đã có, không sửa.
