import { createContext, useContext } from 'react';
import type { PinSavedAction, PinScope } from '../types';

export type PinGuardValue = {
  /**
   * Hỏi mã PIN trước một thao tác nhạy cảm. Trả `pinToken` để gửi kèm đúng một lời gọi API
   * (header `X-Pin-Token`), hoặc `null` khi người dùng đóng bảng — lúc đó thao tác phải dừng
   * lặng lẽ, không báo lỗi. Chưa có PIN thì bảng tự chuyển sang tạo PIN rồi đi tiếp luôn.
   */
  requirePin: (scope: PinScope) => Promise<string | null>;
  /** Mở luồng tạo/đổi mã PIN từ màn Hồ sơ; `null` nếu người dùng đóng giữa chừng. */
  managePin: () => Promise<PinSavedAction | null>;
};

export const PinGuardContext = createContext<PinGuardValue | null>(null);

/**
 * Cửa vào duy nhất của bảng nhập PIN cho mọi feature.
 *
 * Token sống 3 phút và chỉ hợp lệ cho đúng `scope`, nên gọi `requirePin` ngay trước lời gọi
 * mạng (sau khi người dùng bấm nút xác nhận cuối), dùng xong bỏ; không giữ lại cho lần sau.
 */
export function usePinGuard(): PinGuardValue {
  const ctx = useContext(PinGuardContext);
  if (!ctx) throw new Error('usePinGuard phải nằm trong <PinProvider>');
  return ctx;
}
