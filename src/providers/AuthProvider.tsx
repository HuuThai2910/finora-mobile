import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getMyProfile, logout as revokeSession, refreshTokens } from '@/features/auth/api';
import { setAccessToken, setRefreshHandler } from '@/lib/authSession';
import { clearRefreshToken, readRefreshToken, saveRefreshToken } from '@/lib/secureStorage';
import type { AuthTokens, Session, UserProfile } from '@/types/auth';

type AuthContextValue = {
  session: Session | null;
  /** Đang thử khôi phục phiên cũ lúc mở app — chưa biết người dùng đã đăng nhập hay chưa. */
  restoring: boolean;
  /** eKYC đã xong hay chưa — quyết định có vào được app chính không. */
  kycCompleted: boolean;
  /** Nhận cặp token vừa lấy được, tải hồ sơ rồi mở phiên. */
  signIn: (tokens: AuthTokens) => Promise<void>;
  completeKyc: () => void;
  signOut: () => void;
  updateProfile: (profile: UserProfile) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [kycCompleted, setKycCompleted] = useState(false);
  const [restoring, setRestoring] = useState(true);

  /**
   * Refresh token mới nhất, giữ trong ref để tầng HTTP đọc được ngay cả khi
   * lời gọi làm mới xảy ra giữa hai lần render.
   */
  const refreshTokenRef = useRef<string | null>(null);

  const applyTokens = useCallback(async (tokens: AuthTokens) => {
    setAccessToken(tokens.accessToken);
    refreshTokenRef.current = tokens.refreshToken;
    await saveRefreshToken(tokens.refreshToken);
  }, []);

  const clearSession = useCallback(async () => {
    setAccessToken(null);
    refreshTokenRef.current = null;
    setSession(null);
    setKycCompleted(false);
    await clearRefreshToken();
  }, []);

  const signIn = useCallback(
    async (tokens: AuthTokens) => {
      await applyTokens(tokens);

      // Hồ sơ nằm ở endpoint khác với đăng nhập; phải có nó mới biết eKYC xong chưa.
      const profile = await getMyProfile();
      setSession({ tokens, profile });
      setKycCompleted(profile.kycStatus === 'KYC_VERIFIED');
    },
    [applyTokens],
  );

  const signOut = useCallback(() => {
    const refreshToken = refreshTokenRef.current;

    // Thu hồi token phía Keycloak là best-effort: mất mạng thì vẫn phải cho
    // người dùng thoát khỏi phiên trên máy.
    if (refreshToken) {
      void revokeSession(refreshToken).catch(() => undefined);
    }

    void clearSession();
  }, [clearSession]);

  const completeKyc = useCallback(() => setKycCompleted(true), []);

  const updateProfile = useCallback((profile: UserProfile) => {
    setSession(prev => (prev ? { ...prev, profile } : prev));
    setKycCompleted(profile.kycStatus === 'KYC_VERIFIED');
  }, []);

  /**
   * Cho tầng HTTP một cách lấy access token mới khi gặp 401. Refresh token của
   * Keycloak xoay vòng nên phải ghi đè giá trị đang giữ, nếu không lần làm mới
   * sau sẽ dùng token đã bị thu hồi.
   */
  useEffect(() => {
    setRefreshHandler(async () => {
      const current = refreshTokenRef.current;
      if (!current) return null;

      try {
        const renewed = await refreshTokens(current);
        await applyTokens(renewed);
        setSession(prev => (prev ? { ...prev, tokens: renewed } : prev));
        return renewed.accessToken;
      } catch {
        // Refresh token hỏng hoặc đã bị thu hồi — buộc đăng nhập lại
        await clearSession();
        return null;
      }
    });

    return () => setRefreshHandler(null);
  }, [applyTokens, clearSession]);

  /**
   * Khôi phục phiên khi mở app: chỉ refresh token được lưu lâu dài, nên phải đổi
   * lấy access token mới rồi tải lại hồ sơ. Chạy đúng một lần lúc mount.
   */
  useEffect(() => {
    let alive = true;

    const restore = async () => {
      try {
        const stored = await readRefreshToken();
        if (!stored) return;

        const tokens = await refreshTokens(stored);
        if (!alive) return;

        await signIn(tokens);
      } catch {
        // Phiên cũ không dùng được nữa — xoá đi và để người dùng đăng nhập lại
        await clearSession();
      } finally {
        if (alive) setRestoring(false);
      }
    };

    void restore();

    return () => {
      alive = false;
    };
    // Chỉ chạy lúc mount: khôi phục phiên là việc một lần của vòng đời app
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ session, restoring, kycCompleted, signIn, signOut, completeKyc, updateProfile }),
    [session, restoring, kycCompleted, signIn, signOut, completeKyc, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải nằm trong <AuthProvider>');
  return ctx;
}
