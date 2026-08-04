import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Session, UserProfile } from '@/types/auth';

type AuthContextValue = {
  session: Session | null;
  /** eKYC đã xong hay chưa — quyết định có vào được app chính không. */
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

  const signIn = useCallback((s: Session) => {
    setSession(s);
    setKycCompleted(s.profile.kycStatus === 'KYC_VERIFIED');
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    setKycCompleted(false);
  }, []);

  const completeKyc = useCallback(() => setKycCompleted(true), []);

  const updateProfile = useCallback(
    (profile: UserProfile) => setSession(prev => (prev ? { ...prev, profile } : prev)),
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
