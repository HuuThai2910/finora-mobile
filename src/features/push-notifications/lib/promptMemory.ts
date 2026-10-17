import * as SecureStore from 'expo-secure-store';

/**
 * Nhớ app đã tự hỏi quyền thông báo một lần. Lần sau chỉ hỏi khi người dùng tự bấm "Bật thông báo đẩy" ở màn cài
 * đặt, để không bật hộp thoại xin quyền mỗi lần đăng nhập. Không phải bí mật; dùng SecureStore vì app chưa có kho
 * lưu thường, và chỉ là một cờ.
 */
const PROMPTED_KEY = 'finora.push.permissionPrompted';

async function usable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function wasPermissionPrompted(): Promise<boolean> {
  if (!(await usable())) return false;
  return (await SecureStore.getItemAsync(PROMPTED_KEY)) === '1';
}

export async function rememberPermissionPrompted(): Promise<void> {
  if (!(await usable())) return;
  await SecureStore.setItemAsync(PROMPTED_KEY, '1');
}
