import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Brightness from 'expo-brightness';

const describe = (e: unknown): string => (e instanceof Error ? e.message : 'lỗi không xác định');

/**
 * Tăng độ sáng màn hình lên tối đa trong lúc quay liveness — màn hình trắng quanh khung oval
 * thành đèn phụ chiếu lên mặt, giảm lỗi "quá tối"/"mờ" ở phía server.
 *
 * Luôn trả lại độ sáng cũ: khi quay xong, khi lỗi, khi app xuống nền và khi rời màn. iOS giữ
 * độ sáng đã đặt cho tới lúc khoá máy nên không trả lại là người dùng bị chói ở app khác;
 * Android chỉ ghi đè trong Activity nên trả về độ sáng hệ thống bằng `restoreSystemBrightnessAsync`.
 * Lỗi đổi độ sáng chỉ ghi cảnh báo — không được chặn việc quay video.
 */
export function useScreenBrightness() {
  const saved = useRef<number | null>(null);
  const raised = useRef(false);

  const restore = useCallback(async () => {
    if (!raised.current) return;
    raised.current = false;
    try {
      if (Platform.OS === 'android') {
        await Brightness.restoreSystemBrightnessAsync();
      } else if (saved.current !== null) {
        await Brightness.setBrightnessAsync(saved.current);
      }
    } catch (e) {
      console.warn('Không trả lại được độ sáng màn hình:', describe(e));
    }
  }, []);

  const raise = useCallback(async () => {
    if (raised.current) return;
    try {
      if (!(await Brightness.isAvailableAsync())) return;
      saved.current = await Brightness.getBrightnessAsync();
      // Đánh dấu trước khi đặt để `restore` vẫn chạy nếu lệnh đặt lỗi giữa chừng.
      raised.current = true;
      await Brightness.setBrightnessAsync(1);
    } catch (e) {
      console.warn('Không tăng được độ sáng màn hình:', describe(e));
    }
  }, []);

  // AppState: xuống nền giữa lúc quay thì trả độ sáng ngay. Cleanup: rời màn bất kỳ lúc nào.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => {
      if (next !== 'active') void restore();
    });
    return () => {
      subscription.remove();
      void restore();
    };
  }, [restore]);

  return { raise, restore };
}
