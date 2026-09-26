import { useEffect } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/providers/AuthProvider';
import { getMyProfile } from '../api';

/**
 * Hồ sơ `GET /users/me` cho các màn của tab Hồ sơ.
 *
 * Luồng eKYC xác nhận xong thì cập nhật hồ sơ trong phiên (`AuthProvider`) rồi
 * quay về màn Hồ sơ, nơi vẫn giữ bản tải từ trước khi định danh. Khi trạng thái
 * định danh trong phiên khác bản đang hiển thị thì tải lại một lần, để nhãn
 * "chưa định danh" và tên mới đổi ngay thay vì đợi người dùng kéo làm mới.
 */
export function useMyProfile() {
  const state = useAsync(getMyProfile, []);
  const sessionKyc = useAuth().session?.profile.kycStatus;
  const shownKyc = state.data?.kycStatus;

  useEffect(() => {
    if (sessionKyc && shownKyc && sessionKyc !== shownKyc) state.reload();
    // `reload` đổi tham chiếu mỗi lần render nhưng luôn tăng cùng một bộ đếm; chỉ
    // chạy lại khi một trong hai trạng thái đổi. Tải lại mà máy chủ vẫn trả trạng
    // thái cũ thì hai giá trị không đổi nữa, nên không thành vòng lặp.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKyc, shownKyc]);

  return state;
}
