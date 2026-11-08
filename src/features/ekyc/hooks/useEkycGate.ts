import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { getMyProfile } from '@/features/auth';
import { ApiError } from '@/lib/api';
import { refreshAccessToken } from '@/lib/authSession';
import type { TabParamList } from '@/navigation/types';
import { useAuth } from '@/providers/AuthProvider';
import type { KycStatus } from '@/types/auth';
import { EKYC_REQUIRED_CODE, ekycGateCopy } from '../constants/gate';

export const isEkycRequiredError = (error: unknown): boolean =>
  error instanceof ApiError && error.code === EKYC_REQUIRED_CODE;

/**
 * Chặn các thao tác cần đã định danh (góp vốn, đặt lệnh Note, Auto-Invest) <b>trước</b> khi hỏi
 * mã PIN, và nói rõ lý do thay vì để người dùng nhập PIN xong mới nhận một dòng lỗi.
 *
 * Investment kiểm claim `ekyc_status` trong access token, còn app đọc trạng thái từ hồ sơ. Hai
 * nguồn có thể lệch (nhân viên vừa duyệt, hoặc vừa eKYC xong mà token còn cũ), nên `recheck`
 * tải lại hồ sơ và khi hồ sơ đã duyệt thì làm mới token để claim mới vào token.
 *
 * @param doing cụm động từ của thao tác, dùng trong lời báo ("đầu tư", "giao dịch Note")
 */
export function useEkycGate(doing: string) {
  const nav = useNavigation<NavigationProp<TabParamList>>();
  const { session, updateProfile } = useAuth();
  const status: KycStatus = session?.profile.kycStatus ?? 'NOT_STARTED';

  const recheck = useCallback(async (): Promise<KycStatus> => {
    const profile = await getMyProfile();
    updateProfile(profile);
    if (profile.kycStatus === 'KYC_VERIFIED') await refreshAccessToken();
    return profile.kycStatus;
  }, [updateProfile]);

  const startEkyc = useCallback(() => nav.navigate('Hồ sơ', { screen: 'EkycConsent' }), [nav]);

  const prompt = useCallback(
    (current: KycStatus) => {
      const copy = ekycGateCopy(current, doing);
      Alert.alert(copy.title, copy.message, [
        { text: 'Để sau', style: 'cancel' },
        copy.action.kind === 'start'
          ? { text: copy.action.label, onPress: startEkyc }
          : { text: 'Đã hiểu' },
      ]);
    },
    [doing, startEkyc],
  );

  /** `true` khi đã định danh để đi tiếp (hỏi PIN); `false` khi đã báo cho người dùng. */
  const ensureVerified = useCallback(async (): Promise<boolean> => {
    if (status === 'KYC_VERIFIED') return true;
    const current = await recheck().catch(() => status);
    if (current === 'KYC_VERIFIED') return true;
    prompt(current);
    return false;
  }, [prompt, recheck, status]);

  /**
   * Chạy lời gọi cần định danh. Máy chủ báo `EKYC_REQUIRED` thì kiểm tra lại: hồ sơ đã duyệt
   * (token cũ) thì gửi lại đúng một lần với token mới; chưa duyệt thì báo và trả `null`.
   * Lỗi khác ném tiếp cho nơi gọi.
   */
  const run = useCallback(
    async <T>(call: () => Promise<T>): Promise<T | null> => {
      try {
        return await call();
      } catch (e) {
        if (!isEkycRequiredError(e)) throw e;
      }
      const current = await recheck().catch(() => status);
      if (current !== 'KYC_VERIFIED') {
        prompt(current);
        return null;
      }
      try {
        return await call();
      } catch (e) {
        if (!isEkycRequiredError(e)) throw e;
        prompt('KYC_VERIFIED');
        return null;
      }
    },
    [prompt, recheck, status],
  );

  return {
    status,
    verified: status === 'KYC_VERIFIED',
    copy: ekycGateCopy(status, doing),
    recheck,
    startEkyc,
    ensureVerified,
    run,
  };
}
