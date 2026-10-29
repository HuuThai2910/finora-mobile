import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/types';
import type { EkycResultResponse } from '@/types/ekyc';
import { useEkycSession } from './useEkycSession';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

/**
 * Các bước chuyển màn dùng chung của luồng eKYC, để mọi màn xử lý cùng một mã kết quả theo
 * cùng một cách.
 *
 * Màn chụp được đăng ký với `getId` theo mặt thẻ, nên `navigate('EkycCapture', { side })`
 * quay về đúng màn mặt đó nếu nó còn trong stack (bỏ các màn phía trên) thay vì chồng thêm.
 */
export function useEkycFlow() {
  const nav = useNavigation<Nav>();
  const session = useEkycSession();

  return {
    /** Kết quả cần người dùng xem (bản nháp sau liveness, bị từ chối...) — có thể quay lại. */
    showResult(result: EkycResultResponse) {
      session.setOutcome(result);
      nav.navigate('EkycResult');
    },
    /**
     * Trạng thái cuối của hồ sơ (đã xác minh / chờ duyệt): dọn các bước phía sau để nút quay
     * lại về thẳng màn Hồ sơ, không quay lại màn chụp với dữ liệu đã dùng xong.
     */
    showFinal(result: EkycResultResponse) {
      session.setOutcome(result);
      nav.reset({ index: 1, routes: [{ name: 'Profile' }, { name: 'EkycResult' }] });
    },
    /** Chụp lại từ mặt trước, giữ phiên bản điều khoản đã đồng ý. */
    restartCapture() {
      nav.navigate('EkycCapture', { side: 'front' });
      session.restartCapture();
    },
    /** Đồng ý không còn hiệu lực (điều khoản đổi hoặc đã rút) — đọc lại điều khoản từ đầu. */
    restartFromConsent() {
      nav.reset({ index: 1, routes: [{ name: 'Profile' }, { name: 'EkycConsent' }] });
      session.reset();
    },
    /** Kết thúc luồng, về màn Hồ sơ và xoá sạch dữ liệu phiên. */
    finish() {
      nav.popToTop();
      session.reset();
    },
  };
}
