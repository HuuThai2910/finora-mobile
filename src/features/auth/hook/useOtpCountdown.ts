import { useEffect, useState } from 'react';
import { OTP_RESEND_SECONDS } from '../constant';

/** Đếm ngược thời gian được phép gửi lại mã, hiển thị dạng mm:ss như mockup. */
export function useOtpCountdown(seconds: number = OTP_RESEND_SECONDS) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const mm = Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0');
  const ss = (remaining % 60).toString().padStart(2, '0');

  return { remaining, label: `${mm}:${ss}`, canResend: remaining <= 0, reset: () => setRemaining(seconds) };
}
