import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

const MINUTE = 60_000;

export type Countdown = {
  expired: boolean;
  /** Ví dụ "còn 2 ngày 4 giờ"; rỗng khi đã hết hạn. */
  label: string;
  /** Cảnh báo khi còn dưới 24 giờ để UI đổi tông. */
  urgent: boolean;
};

function describe(remainingMs: number): Countdown {
  if (remainingMs <= 0) return { expired: true, label: '', urgent: true };

  const minutes = Math.floor(remainingMs / MINUTE);
  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = minutes % 60;

  const label =
    days > 0
      ? `còn ${days} ngày ${hours} giờ`
      : hours > 0
        ? `còn ${hours} giờ ${mins} phút`
        : `còn ${Math.max(1, mins)} phút`;

  return { expired: false, label, urgent: days === 0 };
}

/**
 * Đếm ngược tới mốc hạn của backend.
 *
 * Bản cũ tính `Date.now()` ngay trong thân render nên hợp đồng vừa hết hạn vẫn
 * hiện nút ký cho tới khi người dùng tự tải lại. Ở đây thời gian là state có
 * nhịp cập nhật riêng: chạy mỗi phút, dừng hẳn khi đã hết hạn hoặc khi app
 * xuống nền, và tính lại ngay lúc app trở lại để không hiển thị số cũ.
 */
export function useCountdown(targetIso: string | null): Countdown {
  const target = targetIso ? new Date(targetIso).getTime() : Number.NaN;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!Number.isFinite(target)) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      stop();
      const current = Date.now();
      setNow(current);
      if (current >= target) return;
      timer = setInterval(() => {
        const tick = Date.now();
        setNow(tick);
        if (tick >= target) stop();
      }, MINUTE);
    };

    start();

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') start();
      else stop();
    });

    return () => {
      stop();
      subscription.remove();
    };
  }, [target]);

  if (!Number.isFinite(target)) return { expired: false, label: '', urgent: false };
  return describe(target - now);
}
