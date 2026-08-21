import * as SecureStore from 'expo-secure-store';

/**
 * Kho lưu bí mật của thiết bị — Keychain trên iOS, Keystore trên Android.
 *
 * Refresh token phải nằm ở đây chứ không phải AsyncStorage: AsyncStorage lưu
 * dạng thô trong sandbox ứng dụng nên máy đã root/jailbreak đọc được.
 *
 * Trên web (Expo web dùng khi phát triển) SecureStore không tồn tại; các hàm
 * dưới đây trả về `null`/không làm gì thay vì ném lỗi, tức là phiên không được
 * khôi phục sau khi tải lại trang — chấp nhận được vì web không phải nền tảng đích.
 */

const REFRESH_TOKEN_KEY = 'finora.auth.refreshToken';

async function isUsable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function saveRefreshToken(token: string): Promise<void> {
  if (!(await isUsable())) return;
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function readRefreshToken(): Promise<string | null> {
  if (!(await isUsable())) return null;
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearRefreshToken(): Promise<void> {
  if (!(await isUsable())) return;
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
