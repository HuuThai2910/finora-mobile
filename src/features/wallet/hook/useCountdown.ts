import { useEffect, useState } from 'react';

const secondsUntil = (deadline: string) =>
  Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 1000));

/**
 * Số giây còn lại tới `deadline` (ISO-8601 của backend), đếm lùi mỗi giây; `null` khi không có hạn.
 *
 * Chỉ dùng để hiển thị hạn thanh toán, không tự đổi trạng thái lệnh: hết giờ hay chưa là việc của
 * backend. Bộ đếm chỉ chạy khi `active` và còn thời gian, tự dừng ở 0 và được dọn khi rời màn.
 */
export function useCountdown(deadline: string | null, active: boolean): number | null {
  const [left, setLeft] = useState(() => (deadline ? secondsUntil(deadline) : null));

  useEffect(() => {
    if (!deadline) {
      setLeft(null);
      return;
    }
    setLeft(secondsUntil(deadline));
    if (!active) return;
    // Tính lại từ đồng hồ mỗi lần thay vì trừ dần 1, để app bị treo/chạy nền một lúc vẫn đúng giờ.
    const timer = setInterval(() => {
      const next = secondsUntil(deadline);
      setLeft(next);
      if (next === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline, active]);

  return left;
}
