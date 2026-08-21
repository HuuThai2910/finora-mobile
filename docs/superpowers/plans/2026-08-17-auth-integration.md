# Auth Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mocked auth layer with real finora-user API calls for login, register, forgot-password, reset-password, and user profile — including 3 new screens for the forgot-password flow.

**Architecture:** Mobile calls finora-user through the gateway (port 8080). All responses wrapped in `BaseResponse<T>` with `.data` holding the payload. Login returns tokens directly (no OTP); register returns no tokens (user must login separately). A profile mapper converts backend `UserProfileResponse` to the merged mobile `UserProfile`.

**Tech Stack:** React Native 0.81 + Expo SDK 54, TypeScript strict, React Navigation 7 (native-stack), `fetch`-based `apiFetch` client.

## Global Constraints

- TypeScript `strict: true` — no `any`, no `!` assertions, no empty `catch`.
- Comment nghiệp vụ bằng tiếng Việt.
- Dùng design tokens từ `@/theme` và `@/constants/colors` — không hardcode màu/khoảng cách.
- UI components dùng `Screen`, `Button`, `Field`, `InfoNote` từ `@/components`.
- Mock fallback qua `isMocked('auth')` — khi `auth` nằm trong `EXPO_PUBLIC_MOCK_DOMAINS`, trả dữ liệu giả.
- Chỉ gọi API qua gateway/backend. Header `X-Client-Type: mobile` bắt buộc.
- Type-check phải xanh: `npx tsc --noEmit`.

---

### Task 1: Types, API Client & Mapper

**Files:**
- Modify: `src/types/auth.ts` (replace all content)
- Modify: `src/lib/api.ts` (add `X-Client-Type` header, `BaseApiResponse`, `apiFetchData`)
- Create: `src/features/auth/mappers/profileMapper.ts`
- Modify: `src/features/auth/api.ts` (replace mock-only with real+fallback)
- Modify: `src/lib/mocks/auth.ts` (update to match new types)
- Modify: `src/lib/mocks/fixtures.ts` (update `PROFILE` fixture)

**Interfaces:**
- Consumes: `apiFetch` from `src/lib/api.ts`, `isMocked` from `src/lib/mockFlag.ts`
- Produces:
  - Types: `UserRole`, `Gender`, `KycStatus`, `UserProfile`, `Session`, `LoginRequest`, `RegisterRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest`, `AuthResponse`, `UserProfileResponse`
  - API functions: `login(req: LoginRequest): Promise<AuthResponse>`, `register(req: RegisterRequest): Promise<void>`, `forgotPassword(req: ForgotPasswordRequest): Promise<void>`, `resetPassword(req: ResetPasswordRequest): Promise<void>`, `getProfile(accessToken: string): Promise<UserProfile>`, `logout(refreshToken: string): Promise<void>`
  - Mapper: `mapUserProfileResponse(raw: UserProfileResponse): UserProfile`
  - Helper: `apiFetchData<T>(path: string, init?: RequestInit): Promise<T>`

- [ ] **Step 1: Replace `src/types/auth.ts` with updated types**

```typescript
export type UserRole = 'BORROWER' | 'INVESTOR' | 'ADMIN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type KycStatus = 'NOT_STARTED' | 'PENDING_REVIEW' | 'KYC_VERIFIED' | 'REJECTED';

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

export interface Session {
  accessToken: string;
  refreshToken: string;
  profile: UserProfile;
}

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

/** Transport DTO — không dùng trực tiếp trong UI. */
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

- [ ] **Step 2: Add `BaseApiResponse` type and `apiFetchData` helper to `src/lib/api.ts`**

Add these after the existing `apiFetch` export:

```typescript
/** Wrapper chuẩn từ finora-common — mọi response đi qua đây. */
interface BaseApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Gọi API và unwrap `BaseResponse<T>.data`.
 * Dùng cho finora-user và các service trả response chuẩn finora-common.
 */
export const apiFetchData = <T>(path: string, init?: RequestInit): Promise<T> =>
  apiFetch<BaseApiResponse<T>>(path, init).then(r => r.data);
```

Also add `'X-Client-Type': 'mobile'` to the default headers in the `request()` function. Change the headers line in `request()` from:

```typescript
headers: { 'Content-Type': 'application/json', ...(headers as Record<string, string>) },
```

to:

```typescript
headers: {
  'Content-Type': 'application/json',
  'X-Client-Type': 'mobile',
  ...(headers as Record<string, string>),
},
```

- [ ] **Step 3: Create `src/features/auth/mappers/profileMapper.ts`**

```typescript
import type { UserProfile, UserProfileResponse } from '@/types/auth';

/** Chuyển response backend sang model UI — thêm field computed và field demo chưa có backend. */
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
    kycStatus: 'NOT_STARTED',
    creditGrade: null,
    creditScore: null,
    linkedBank: null,
  };
}
```

- [ ] **Step 4: Update `src/lib/mocks/fixtures.ts` — update `PROFILE` to match new `UserProfile`**

Replace the `PROFILE` constant with:

```typescript
export const PROFILE: UserProfile = {
  id: 'U-1021',
  fullName: 'Trần Văn Hùng',
  phone: '09xx xxx 842',
  email: 'hung.tran@gmail.com',
  initial: 'H',
  dateOfBirth: '1990-05-12',
  gender: 'MALE',
  placeOfOrigin: 'Hà Nội',
  address: '123 Nguyễn Trãi, Q. Thanh Xuân, Hà Nội',
  idNumber: null,
  role: 'BORROWER',
  profileCompleted: true,
  kycStatus: 'KYC_VERIFIED',
  creditGrade: 'B',
  creditScore: 78,
  linkedBank: {
    bank: 'Vietcombank',
    maskedNumber: '•••• 8842',
    holder: 'TRẦN VĂN HÙNG',
    verified: true,
  },
};
```

- [ ] **Step 5: Update `src/lib/mocks/auth.ts` — match new API signatures**

Replace all content with:

```typescript
import { mockResponse } from './delay';
import { PROFILE } from './fixtures';
import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '@/types/auth';

/** Mock AuthResponse trả token giả. */
const MOCK_AUTH: AuthResponse = {
  userId: 1021,
  email: PROFILE.email,
  fullName: PROFILE.fullName,
  roles: ['BORROWER'],
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token',
};

export const login = (_req: LoginRequest): Promise<AuthResponse> =>
  mockResponse('auth', MOCK_AUTH);

export const register = (_req: RegisterRequest): Promise<void> =>
  mockResponse('auth', undefined as void);

export const forgotPassword = (): Promise<void> =>
  mockResponse('auth', undefined as void);

export const resetPassword = (): Promise<void> =>
  mockResponse('auth', undefined as void);

export const getProfile = (): Promise<UserProfile> => mockResponse('auth', PROFILE);

export const logout = (): Promise<void> =>
  mockResponse('auth', undefined as void);
```

- [ ] **Step 6: Replace `src/features/auth/api.ts` — real API + mock fallback**

```typescript
import { isMocked } from '@/lib/mockFlag';
import * as authMock from '@/lib/mocks/auth';
import { apiFetchData } from '@/lib/api';
import { mapUserProfileResponse } from './mappers/profileMapper';
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserProfile,
  UserProfileResponse,
} from '@/types/auth';

/** POST /auth/login → AuthResponse với accessToken + refreshToken. */
export async function login(req: LoginRequest): Promise<AuthResponse> {
  if (isMocked('auth')) return authMock.login(req);
  return apiFetchData<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/** POST /auth/register → không trả token, user phải login riêng. */
export async function register(req: RegisterRequest): Promise<void> {
  if (isMocked('auth')) return authMock.register(req);
  await apiFetchData<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/** POST /auth/forgot-password → backend gửi OTP qua email (luôn trả success). */
export async function forgotPassword(req: ForgotPasswordRequest): Promise<void> {
  if (isMocked('auth')) return authMock.forgotPassword();
  await apiFetchData<string>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/** POST /auth/reset-password → xác nhận OTP + đặt mật khẩu mới. */
export async function resetPassword(req: ResetPasswordRequest): Promise<void> {
  if (isMocked('auth')) return authMock.resetPassword();
  await apiFetchData<string>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/** GET /users/me → lấy hồ sơ người dùng đã đăng nhập. */
export async function getProfile(accessToken: string): Promise<UserProfile> {
  if (isMocked('auth')) return authMock.getProfile();
  const raw = await apiFetchData<UserProfileResponse>('/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return mapUserProfileResponse(raw);
}

/** POST /auth/logout → thu hồi refresh token. */
export async function logout(refreshToken: string): Promise<void> {
  if (isMocked('auth')) return authMock.logout();
  await apiFetchData<string>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}
```

- [ ] **Step 7: Run type-check**

Run: `npx tsc --noEmit`

Expected: Compilation errors in screen files and AuthProvider (they still reference old types like `OtpChallenge`, old `LoginRequest.phone`, old `Session` without `refreshToken`). These are expected and will be fixed in subsequent tasks.

Verify: No errors in the files modified in this task (`src/types/auth.ts`, `src/lib/api.ts`, `src/features/auth/api.ts`, `src/features/auth/mappers/profileMapper.ts`, `src/lib/mocks/auth.ts`, `src/lib/mocks/fixtures.ts`).

- [ ] **Step 8: Commit**

```
git add src/types/auth.ts src/lib/api.ts src/features/auth/api.ts src/features/auth/mappers/profileMapper.ts src/lib/mocks/auth.ts src/lib/mocks/fixtures.ts
git commit -m "feat(auth): update types, API layer and mapper for finora-user integration

- Replace phone-based LoginRequest with email-based
- Add AuthResponse, UserProfileResponse transport DTOs
- Add ForgotPasswordRequest, ResetPasswordRequest
- Merge UserProfile with backend fields (demo fields nullable)
- Add apiFetchData helper to unwrap BaseResponse<T>
- Add X-Client-Type: mobile header to all requests
- Replace mock-only auth API with real endpoints + isMocked fallback
- Add profileMapper to convert backend response to UI model
- Update mock fixtures to match new UserProfile shape"
```

---

### Task 2: AuthProvider & Navigation

**Files:**
- Modify: `src/providers/AuthProvider.tsx`
- Modify: `src/navigation/types.ts`
- Modify: `src/navigation/AuthNavigator.tsx`
- Modify: `src/features/auth/index.tsx`

**Interfaces:**
- Consumes: `Session`, `UserProfile` from `src/types/auth.ts`; `logout` from `src/features/auth/api.ts`
- Produces:
  - `useAuth()` hook with updated `signIn(session: Session)`, `signOut()` (calls `logout` fire-and-forget)
  - Updated `AuthStackParamList` with `ForgotPassword`, `ForgotPasswordOtp`, `ResetPassword`; without `Otp`
  - Updated `AuthNavigator` registering new screens (screens created in Tasks 3–5)

- [ ] **Step 1: Update `src/providers/AuthProvider.tsx`**

Replace all content with:

```typescript
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { Session, UserProfile } from '@/types/auth';
import { logout as apiLogout } from '@/features/auth/api';

type AuthContextValue = {
  session: Session | null;
  /** Cho phép vào app chính khi profile đã hoàn thiện. */
  kycCompleted: boolean;
  signIn: (session: Session) => void;
  completeKyc: () => void;
  signOut: () => void;
  updateProfile: (profile: UserProfile) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [kycCompleted, setKycCompleted] = useState(false);
  /** Giữ ref để signOut truy cập refreshToken mà không phụ thuộc closure cũ. */
  const sessionRef = useRef<Session | null>(null);

  const signIn = useCallback((s: Session) => {
    setSession(s);
    sessionRef.current = s;
    setKycCompleted(s.profile.profileCompleted);
  }, []);

  const signOut = useCallback(() => {
    const token = sessionRef.current?.refreshToken;
    if (token) {
      /** Fire-and-forget — không chặn UI chờ logout API. */
      apiLogout(token).catch(() => {});
    }
    setSession(null);
    sessionRef.current = null;
    setKycCompleted(false);
  }, []);

  const completeKyc = useCallback(() => setKycCompleted(true), []);

  const updateProfile = useCallback(
    (profile: UserProfile) =>
      setSession(prev => {
        if (!prev) return prev;
        const next = { ...prev, profile };
        sessionRef.current = next;
        return next;
      }),
    [],
  );

  const value = useMemo(
    () => ({ session, kycCompleted, signIn, signOut, completeKyc, updateProfile }),
    [session, kycCompleted, signIn, signOut, completeKyc, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải nằm trong <AuthProvider>');
  return ctx;
}
```

- [ ] **Step 2: Update `src/navigation/types.ts` — replace `Otp` with forgot-password screens**

Replace the `AuthStackParamList` type only (keep all other types unchanged):

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

- [ ] **Step 3: Update `src/features/auth/index.tsx` — export new screens, remove OtpScreen**

Replace all content with:

```typescript
/** Cửa ra công khai của feature `auth`. Feature khác chỉ được import qua đây. */
export { default as LoginScreen } from './component/LoginScreen';
export { default as RegisterScreen } from './component/RegisterScreen';
export { default as ForgotPasswordScreen } from './component/ForgotPasswordScreen';
export { default as ForgotPasswordOtpScreen } from './component/ForgotPasswordOtpScreen';
export { default as ResetPasswordScreen } from './component/ResetPasswordScreen';
export { getProfile } from './api';
export { APP_NAME, APP_TAGLINE } from './constant';
```

- [ ] **Step 4: Update `src/navigation/AuthNavigator.tsx` — register new screens**

Replace all content with:

```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  ForgotPasswordOtpScreen,
  ResetPasswordScreen,
} from '@/features/auth';
import { EkycCaptureScreen, EkycResultScreen, LivenessScreen } from '@/features/ekyc';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Luồng vào ứng dụng: đăng nhập hoặc đăng ký → eKYC.
 * Quên mật khẩu qua 3 bước: nhập email → OTP → đặt lại mật khẩu.
 * Mỗi màn tự vẽ tiêu đề nên tắt header mặc định.
 */
export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ForgotPasswordOtp" component={ForgotPasswordOtpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="EkycCapture" component={EkycCaptureScreen} />
      <Stack.Screen name="Liveness" component={LivenessScreen} />
      <Stack.Screen name="EkycResult" component={EkycResultScreen} />
    </Stack.Navigator>
  );
}
```

- [ ] **Step 5: Run type-check**

Run: `npx tsc --noEmit`

Expected: Errors in `LoginScreen.tsx` and `RegisterScreen.tsx` (still reference old types and old navigation params) and import errors for the 3 new screen files that don't exist yet. These will be fixed in the next tasks.

- [ ] **Step 6: Commit**

```
git add src/providers/AuthProvider.tsx src/navigation/types.ts src/navigation/AuthNavigator.tsx src/features/auth/index.tsx
git commit -m "feat(auth): update AuthProvider and navigation for real API flow

- signIn uses profileCompleted for kycCompleted (replaces kycStatus)
- signOut calls logout API fire-and-forget before clearing state
- Add refreshToken ref for signOut access
- Replace Otp route with ForgotPassword, ForgotPasswordOtp, ResetPassword
- Update AuthNavigator to register new screens
- Update feature index exports"
```

---

### Task 3: LoginScreen & RegisterScreen

**Files:**
- Modify: `src/features/auth/component/LoginScreen.tsx`
- Modify: `src/features/auth/component/RegisterScreen.tsx`

**Interfaces:**
- Consumes: `login`, `getProfile` from `src/features/auth/api.ts`; `useAuth()` from `src/providers/AuthProvider.tsx`; `AuthStackParamList` from `src/navigation/types.ts`; `LoginRequest`, `RegisterRequest`, `Session` from `src/types/auth.ts`
- Produces: Two updated screen components used by `AuthNavigator`

- [ ] **Step 1: Replace `src/features/auth/component/LoginScreen.tsx`**

```typescript
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button, Field, InfoNote } from '@/components/ui';
import { toUserMessage } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import type { AuthStackParamList } from '@/navigation/types';
import BrandMark from './BrandMark';
import { login, getProfile } from '../api';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

/** Màn đăng nhập — email + mật khẩu, gọi API trực tiếp (không qua OTP). */
export default function LoginScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Login'>>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const successMessage = route.params?.registered
    ? 'Đăng ký thành công! Vui lòng đăng nhập.'
    : route.params?.passwordReset
      ? 'Đổi mật khẩu thành công! Vui lòng đăng nhập.'
      : null;

  const onSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const auth = await login({ email, password });
      const token = auth.accessToken;
      const refresh = auth.refreshToken;
      if (!token || !refresh) {
        setError('Không nhận được token từ máy chủ.');
        return;
      }
      const profile = await getProfile(token);
      signIn({ accessToken: token, refreshToken: refresh, profile });
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen light style={styles.screen}>
      <View style={styles.head}>
        <BrandMark />
      </View>

      {successMessage ? (
        <InfoNote tone="success" style={styles.success}>
          {successMessage}
        </InfoNote>
      ) : null}

      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
      />
      <Field
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secure
        autoComplete="current-password"
      />

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button label="Đăng nhập" onPress={onSubmit} loading={submitting} style={styles.primary} />

      <Text style={styles.forgot} onPress={() => nav.navigate('ForgotPassword')}>
        Quên mật khẩu?
      </Text>

      <View style={styles.footer}>
        <Text style={styles.hint}>
          Chưa có tài khoản?{' '}
          <Text style={styles.link} onPress={() => nav.navigate('Register')}>
            Tạo tài khoản
          </Text>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center' },
  head: { paddingTop: Spacing.page, marginBottom: Spacing.section },
  primary: { marginTop: Spacing.md, marginBottom: Spacing.lg },
  success: { marginBottom: Spacing.xl },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
  link: { color: Colors.brand, fontFamily: Text_.microBold.fontFamily },
  forgot: {
    ...Text_.micro,
    color: Colors.brand,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  error: { ...Text_.micro, color: Colors.red, marginBottom: Spacing.lg },
  footer: { marginTop: 'auto', paddingTop: Spacing.xl },
});
```

- [ ] **Step 2: Replace `src/features/auth/component/RegisterScreen.tsx`**

```typescript
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button, Checkbox, Field } from '@/components/ui';
import { toUserMessage } from '@/lib/api';
import type { AuthStackParamList } from '@/navigation/types';
import { PRIVACY_LABEL, TERMS_LABEL } from '../constant';
import { register } from '../api';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

/** Màn tạo tài khoản — gửi email + mật khẩu + họ tên, rồi quay về Login. */
export default function RegisterScreen() {
  const nav = useNavigation<Nav>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'Nhập họ tên đúng như trên CCCD.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Email chưa đúng định dạng.';
    if (password.length < 8) next.password = 'Mật khẩu tối thiểu 8 ký tự.';
    if (!accepted) next.accepted = 'Cần đồng ý điều khoản trước khi tạo tài khoản.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register({ fullName, email, password });
      nav.navigate('Login', { registered: true });
    } catch (e) {
      setErrors({ form: toUserMessage(e) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen light>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          Tạo tài khoản
        </Text>
        <Text style={styles.sub}>Miễn phí · chỉ mất 3 phút</Text>
      </View>

      <Field
        label="Họ và tên (theo CCCD)"
        value={fullName}
        onChangeText={setFullName}
        required
        error={errors.fullName}
        autoComplete="name"
      />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        required
        error={errors.email}
        autoComplete="email"
      />
      <Field
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secure
        required
        error={errors.password}
        helper="Tối thiểu 8 ký tự"
        autoComplete="new-password"
      />

      <Checkbox checked={accepted} onChange={setAccepted} label="Đồng ý điều khoản sử dụng">
        <Text style={styles.terms}>
          Tôi đồng ý <Text style={styles.link}>{TERMS_LABEL}</Text> và{' '}
          <Text style={styles.link}>{PRIVACY_LABEL}</Text>
        </Text>
      </Checkbox>
      {errors.accepted ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {errors.accepted}
        </Text>
      ) : null}
      {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}

      <Button
        label="Tạo tài khoản"
        onPress={onSubmit}
        loading={submitting}
        style={styles.submit}
      />

      <Text style={styles.hint}>
        Đã có tài khoản?{' '}
        <Text style={styles.link} onPress={() => nav.goBack()}>
          Đăng nhập
        </Text>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xxl, paddingTop: Spacing.xl },
  title: { ...Text_.display, color: Colors.ink },
  sub: { ...Text_.micro, color: Colors.ink3 },
  terms: { ...Text_.micro, color: Colors.ink2 },
  link: { color: Colors.brand, fontFamily: FontFamily.bold },
  error: { ...Text_.micro, color: Colors.red, marginBottom: Spacing.md },
  submit: { marginTop: Spacing.lg },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
});
```

- [ ] **Step 3: Run type-check**

Run: `npx tsc --noEmit`

Expected: Errors only for the 3 new screen files that don't exist yet (`ForgotPasswordScreen`, `ForgotPasswordOtpScreen`, `ResetPasswordScreen`). The Login and Register screens should compile cleanly.

- [ ] **Step 4: Commit**

```
git add src/features/auth/component/LoginScreen.tsx src/features/auth/component/RegisterScreen.tsx
git commit -m "feat(auth): update LoginScreen and RegisterScreen for real API

- LoginScreen: email field, direct token flow (no OTP), forgot password link, success banners
- RegisterScreen: remove phone field, navigate to Login on success"
```

---

### Task 4: Forgot Password Screens (3 new screens)

**Files:**
- Create: `src/features/auth/component/ForgotPasswordScreen.tsx`
- Create: `src/features/auth/component/ForgotPasswordOtpScreen.tsx`
- Create: `src/features/auth/component/ResetPasswordScreen.tsx`

**Interfaces:**
- Consumes: `forgotPassword`, `resetPassword` from `src/features/auth/api.ts`; `useOtpCountdown` from `src/features/auth/hook/useOtpCountdown.ts`; `OTP_LENGTH`, `OTP_MAX_ATTEMPTS`, `OTP_LOCK_MINUTES` from `src/features/auth/constant.ts`; `AuthStackParamList` from `src/navigation/types.ts`
- Produces: Three screen components already registered in `AuthNavigator` (Task 2)

- [ ] **Step 1: Create `src/features/auth/component/ForgotPasswordScreen.tsx`**

```typescript
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button, Field } from '@/components/ui';
import { toUserMessage } from '@/lib/api';
import type { AuthStackParamList } from '@/navigation/types';
import { forgotPassword } from '../api';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

/** Màn 1/3 quên mật khẩu — nhập email để nhận mã OTP. */
export default function ForgotPasswordScreen() {
  const nav = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email chưa đúng định dạng.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await forgotPassword({ email });
      nav.navigate('ForgotPasswordOtp', { email });
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen light style={styles.screen}>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          Quên mật khẩu
        </Text>
        <Text style={styles.sub}>Nhập email để nhận mã xác nhận</Text>
      </View>

      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button
        label="Gửi mã xác nhận"
        onPress={onSubmit}
        loading={submitting}
        style={styles.submit}
      />

      <Text style={styles.back} onPress={() => nav.goBack()}>
        ← Quay lại đăng nhập
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center' },
  head: { alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xxl, paddingTop: Spacing.page },
  title: { ...Text_.display, color: Colors.ink },
  sub: { ...Text_.micro, color: Colors.ink3 },
  error: { ...Text_.micro, color: Colors.red, marginBottom: Spacing.lg },
  submit: { marginTop: Spacing.lg },
  back: { ...Text_.micro, color: Colors.brand, textAlign: 'center', marginTop: Spacing.xl },
});
```

- [ ] **Step 2: Create `src/features/auth/component/ForgotPasswordOtpScreen.tsx`**

```typescript
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button } from '@/components/ui';
import { toUserMessage } from '@/lib/api';
import type { AuthStackParamList } from '@/navigation/types';
import { OTP_LENGTH, OTP_LOCK_MINUTES, OTP_MAX_ATTEMPTS } from '../constant';
import { useOtpCountdown } from '../hook/useOtpCountdown';
import { forgotPassword } from '../api';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPasswordOtp'>;

/** Màn 2/3 quên mật khẩu — nhập mã OTP 6 số đã gửi qua email. */
export default function ForgotPasswordOtpScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<AuthStackParamList, 'ForgotPasswordOtp'>>();
  const { email } = route.params;
  const input = useRef<TextInput>(null);

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { label, canResend, reset } = useOtpCountdown();

  const onSubmit = () => {
    if (code.length !== OTP_LENGTH) {
      setError(`Mã gồm ${OTP_LENGTH} chữ số.`);
      return;
    }
    nav.navigate('ResetPassword', { email, otp: code });
  };

  const onResend = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await forgotPassword({ email });
      reset();
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen light style={styles.screen}>
      <Text style={styles.title} accessibilityRole="header">
        Xác thực OTP
      </Text>
      <Text style={styles.sub}>Mã 6 số đã gửi tới {email}</Text>

      <Pressable
        onPress={() => input.current?.focus()}
        accessibilityRole="button"
        accessibilityLabel="Nhập mã OTP"
        style={styles.boxes}
      >
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <View key={i} style={[styles.box, i === code.length && styles.boxActive]}>
            <Text style={styles.digit}>{code[i] ?? ''}</Text>
          </View>
        ))}
      </Pressable>

      <TextInput
        ref={input}
        value={code}
        onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, OTP_LENGTH))}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={OTP_LENGTH}
        autoFocus
        style={styles.hiddenInput}
        accessibilityLabel="Mã xác thực gồm 6 chữ số"
      />

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button label="Xác nhận" variant="emerald" onPress={onSubmit} loading={submitting} />

      <Text style={styles.hint}>
        {canResend ? (
          <Text style={styles.link} onPress={onResend}>
            Gửi lại mã
          </Text>
        ) : (
          `Gửi lại sau ${label}`
        )}
        {` · sai ${OTP_MAX_ATTEMPTS} lần khóa ${OTP_LOCK_MINUTES} phút`}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center' },
  title: { ...Text_.display, color: Colors.ink, textAlign: 'center', marginTop: Spacing.page },
  sub: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.md },
  boxes: {
    flexDirection: 'row',
    gap: Spacing.lg,
    justifyContent: 'center',
    marginVertical: Spacing.section,
  },
  box: {
    width: 51,
    height: 66,
    borderWidth: 2,
    borderColor: Colors.brand,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { backgroundColor: Colors.brand50 },
  digit: { fontFamily: FontFamily.extrabold, fontSize: FontSize.display, color: Colors.ink },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  error: { ...Text_.micro, color: Colors.red, textAlign: 'center', marginBottom: Spacing.lg },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
  link: { color: Colors.brand, fontFamily: FontFamily.semibold },
});
```

- [ ] **Step 3: Create `src/features/auth/component/ResetPasswordScreen.tsx`**

```typescript
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { Screen } from '@/components/phone';
import { Button, Field } from '@/components/ui';
import { toUserMessage } from '@/lib/api';
import type { AuthStackParamList } from '@/navigation/types';
import { resetPassword } from '../api';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;

/** Màn 3/3 quên mật khẩu — đặt mật khẩu mới sau khi nhập OTP. */
export default function ResetPasswordScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<AuthStackParamList, 'ResetPassword'>>();
  const { email, otp } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (newPassword.length < 8) next.newPassword = 'Mật khẩu tối thiểu 8 ký tự.';
    if (newPassword !== confirmPassword) next.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await resetPassword({ email, otp, newPassword });
      nav.navigate('Login', { passwordReset: true });
    } catch (e) {
      setErrors({ form: toUserMessage(e) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen light style={styles.screen}>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          Đặt mật khẩu mới
        </Text>
        <Text style={styles.sub}>Tạo mật khẩu mới cho tài khoản {email}</Text>
      </View>

      <Field
        label="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        secure
        required
        error={errors.newPassword}
        helper="Tối thiểu 8 ký tự"
        autoComplete="new-password"
      />
      <Field
        label="Xác nhận mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secure
        required
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      {errors.form ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {errors.form}
        </Text>
      ) : null}

      <Button
        label="Đặt lại mật khẩu"
        onPress={onSubmit}
        loading={submitting}
        style={styles.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center' },
  head: { alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xxl, paddingTop: Spacing.page },
  title: { ...Text_.display, color: Colors.ink },
  sub: { ...Text_.micro, color: Colors.ink3, textAlign: 'center' },
  error: { ...Text_.micro, color: Colors.red, marginBottom: Spacing.lg },
  submit: { marginTop: Spacing.lg },
});
```

- [ ] **Step 4: Run type-check**

Run: `npx tsc --noEmit`

Expected: PASS — all files should compile. If there are errors, they are likely from the `Field` component's `autoCapitalize` prop or the `InfoNote` import. Fix any remaining type errors.

- [ ] **Step 5: Commit**

```
git add src/features/auth/component/ForgotPasswordScreen.tsx src/features/auth/component/ForgotPasswordOtpScreen.tsx src/features/auth/component/ResetPasswordScreen.tsx
git commit -m "feat(auth): add forgot password flow (3 screens)

- ForgotPasswordScreen: email input, calls forgot-password API
- ForgotPasswordOtpScreen: 6-digit OTP input with countdown, resend
- ResetPasswordScreen: new password + confirm, calls reset-password API"
```

---

### Task 5: Config & Cleanup

**Files:**
- Modify: `.env` (update API URL to gateway)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Working app with correct gateway URL, full type-check passing

- [ ] **Step 1: Update `.env` — point API URL to gateway**

Change:

```
EXPO_PUBLIC_API_URL=http://192.168.1.153:8081/api/v1
```

to:

```
EXPO_PUBLIC_API_URL=http://192.168.1.153:8080/api/v1
```

This routes all API calls through the gateway, which forwards `/api/v1/auth/**` and `/api/v1/users/**` to finora-user (port 8085) and `/api/v1/loans/**` to finora-loan (port 8081).

- [ ] **Step 2: Run full type-check**

Run: `npx tsc --noEmit`

Expected: PASS — zero errors. All types, screens, navigation, and API layer should be consistent.

If there are errors from other features importing from `@/types/auth` (e.g. `OtpChallenge` no longer exported), fix those imports. The old `OtpScreen.tsx` file still exists but is no longer imported by `AuthNavigator` or `index.tsx` — it may have internal type errors which are acceptable since it's unused.

- [ ] **Step 3: Verify OtpScreen.tsx is truly disconnected**

Confirm `OtpScreen.tsx` is NOT imported anywhere:
- `src/features/auth/index.tsx` — should NOT export it
- `src/navigation/AuthNavigator.tsx` — should NOT register it

The file remains on disk as reference but has no effect on the app.

- [ ] **Step 4: Commit**

```
git add .env
git commit -m "chore: point API URL to gateway (port 8080) for multi-service routing"
```

- [ ] **Step 5: Final verification summary**

List what was done:
- ✅ `src/types/auth.ts` — new types matching backend contract
- ✅ `src/lib/api.ts` — `X-Client-Type: mobile` header, `apiFetchData` helper
- ✅ `src/features/auth/mappers/profileMapper.ts` — backend → UI mapper
- ✅ `src/features/auth/api.ts` — real API with mock fallback
- ✅ `src/lib/mocks/auth.ts` + `fixtures.ts` — updated mock data
- ✅ `src/providers/AuthProvider.tsx` — `profileCompleted`-based kycCompleted, fire-and-forget logout
- ✅ `src/navigation/types.ts` — updated `AuthStackParamList`
- ✅ `src/navigation/AuthNavigator.tsx` — 3 new screens, removed OtpScreen
- ✅ `src/features/auth/index.tsx` — updated exports
- ✅ `src/features/auth/component/LoginScreen.tsx` — email, direct token flow, success banners
- ✅ `src/features/auth/component/RegisterScreen.tsx` — no phone, navigate to Login
- ✅ `src/features/auth/component/ForgotPasswordScreen.tsx` — new
- ✅ `src/features/auth/component/ForgotPasswordOtpScreen.tsx` — new
- ✅ `src/features/auth/component/ResetPasswordScreen.tsx` — new
- ✅ `.env` — gateway URL

Mock fallback: auth is still in `EXPO_PUBLIC_MOCK_DOMAINS`. Remove `auth` from that list when backend is running.
