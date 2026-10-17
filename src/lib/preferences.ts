import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Lưu vài cờ nhỏ của giao diện qua các lần mở app, ví dụ "đã đọc thông báo AI của trợ lý".
 *
 * App chưa có AsyncStorage; thêm một thư viện native chỉ để giữ một cờ thì không đáng, nên dùng
 * `expo-secure-store` đã có (chạy được trong Expo Go). Trên web SecureStore không tồn tại nên dùng
 * `localStorage`. Mọi lỗi lưu trữ đều rơi về bộ nhớ trong phiên: cờ mất khi tắt app chỉ làm thông
 * báo hiện lại thêm một lần, không làm hỏng chức năng nào, nên hai hàm dưới không bao giờ ném lỗi.
 *
 * Không dùng file này cho token hay dữ liệu cá nhân: refresh token có `secureStorage.ts` riêng.
 */

const memory = new Map<string, string>();

async function secureStoreUsable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

function webStorage(): Storage | null {
  if (Platform.OS !== 'web') return null;
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    // Trình duyệt chặn bộ nhớ trang (chế độ riêng tư nghiêm ngặt) ném lỗi ngay khi chạm vào.
    return null;
  }
}

export async function readPreference(key: string): Promise<string | null> {
  const fallback = memory.get(key) ?? null;
  const web = webStorage();
  if (web) {
    try {
      return web.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  }
  if (!(await secureStoreUsable())) return fallback;
  try {
    return (await SecureStore.getItemAsync(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

/** Trả `true` khi đã lưu bền; `false` nghĩa là chỉ còn trong bộ nhớ tới khi tắt app. */
export async function writePreference(key: string, value: string): Promise<boolean> {
  memory.set(key, value);
  const web = webStorage();
  if (web) {
    try {
      web.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
  if (!(await secureStoreUsable())) return false;
  try {
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch {
    return false;
  }
}
