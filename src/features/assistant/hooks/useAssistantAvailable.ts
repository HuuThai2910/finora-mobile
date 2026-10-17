import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { getSuggestions } from '../api/assistantApi';

/** Mỗi màn có nút "Hỏi trợ lý" không phải hỏi lại server trong 5 phút. */
const TTL_MS = 5 * 60 * 1000;

type Entry = { userId: string; available: boolean; at: number };

// Bộ nhớ đệm cấp module: dùng chung cho mọi nút trên mọi màn, khóa theo người dùng để đăng xuất
// rồi đăng nhập tài khoản khác (vai trò khác) thì kiểm lại.
let cached: Entry | null = null;
let pending: { userId: string; promise: Promise<boolean> } | null = null;

const fresh = (userId: string | null): Entry | null =>
  cached && userId && cached.userId === userId && Date.now() - cached.at < TTL_MS ? cached : null;

/**
 * Trợ lý chỉ hiện khi `GET /suggestions` trả 200 (spec mục 16). Mọi lỗi khác (503 đang tắt, 403 vai
 * trò không hỗ trợ, 404 khi finora-ai chưa có module, mất mạng) đều nghĩa là "không dùng được": ẩn
 * nút còn hơn để người dùng bấm vào một màn chỉ báo lỗi.
 */
function check(userId: string): Promise<boolean> {
  if (pending && pending.userId === userId) return pending.promise;
  const promise = getSuggestions('Home')
    .then(() => true)
    .catch(() => false)
    .then(available => {
      cached = { userId, available, at: Date.now() };
      pending = null;
      return available;
    });
  pending = { userId, promise };
  return promise;
}

/** Màn chat gặp 503 thì xóa kết quả cũ để các nút kiểm lại ở lần mở màn sau. */
export function forgetAssistantAvailability(): void {
  cached = null;
}

/**
 * Có hiện lối vào trợ lý (nút nổi, nút "Hỏi trợ lý") hay không. Trả `false` trong lúc đang kiểm để
 * nút không hiện rồi biến mất khi trợ lý đang tắt.
 */
export function useAssistantAvailable(): boolean {
  const { session } = useAuth();
  const userId = session?.profile.id ?? null;
  const [available, setAvailable] = useState(() => fresh(userId)?.available ?? false);

  // Kiểm khi người dùng đổi (đăng nhập/đăng xuất); `alive` chặn cập nhật sau khi màn đã đóng.
  useEffect(() => {
    if (!userId) {
      setAvailable(false);
      return;
    }
    const hit = fresh(userId);
    if (hit) {
      setAvailable(hit.available);
      return;
    }
    let alive = true;
    void check(userId).then(value => {
      if (alive) setAvailable(value);
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  return available;
}
