import { useCallback, useEffect, useState } from 'react';
import { readPreference, writePreference } from '@/lib/preferences';
import { AI_NOTICE_KEY, AI_NOTICE_VERSION } from '../constants';

export type AiNoticeStatus = 'checking' | 'show' | 'seen';

/**
 * Thông báo lần đầu mở trợ lý (spec mục "Ai tham gia"): đang nói chuyện với AI, dữ liệu đi tới nhà
 * cung cấp nào, không nhập CCCD/PIN/OTP. Đọc cờ đã xem một lần lúc mở màn; trong lúc đọc
 * (`checking`) ô nhập bị khóa để không câu hỏi nào đi trước khi người dùng được báo.
 *
 * `readPreference`/`writePreference` không ném lỗi: bộ nhớ hỏng thì thông báo chỉ hiện lại lần sau.
 */
export function useAiNotice(): { status: AiNoticeStatus; acknowledge: () => void } {
  const [status, setStatus] = useState<AiNoticeStatus>('checking');

  useEffect(() => {
    let alive = true;
    void readPreference(AI_NOTICE_KEY).then(value => {
      if (alive) setStatus(value === AI_NOTICE_VERSION ? 'seen' : 'show');
    });
    return () => {
      alive = false;
    };
  }, []);

  const acknowledge = useCallback(() => {
    setStatus('seen');
    void writePreference(AI_NOTICE_KEY, AI_NOTICE_VERSION);
  }, []);

  return { status, acknowledge };
}
