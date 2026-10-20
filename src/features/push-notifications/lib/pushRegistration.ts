import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ApiError, NetworkError, toUserMessage } from '@/lib/api';
import { isMocked } from '@/lib/mockFlag';
import { registerDevice, unregisterDevice } from '../api/pushApi';
import type { DevicePlatform } from '../types';
import { rememberPermissionPrompted, wasPermissionPrompted } from './promptMemory';
import { getRegisteredDeviceId, setRegisteredDeviceId, setRegistrationState } from './registrationStore';

/**
 * EAS projectId của bản build. Từ Expo SDK 49, `getExpoPushTokenAsync` bắt buộc có projectId; thiếu thì không có
 * token và app báo rõ "chưa cấu hình" thay vì lỗi khó hiểu. Đây là định danh công khai, không phải secret.
 */
const EAS_PROJECT_ID = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim() || null;

/** Kênh Android trùng `channelId: "default"` mà backend gửi kèm mỗi push. */
export const ANDROID_CHANNEL_ID = 'default';

/**
 * Hỏi quyền khi nào:
 * - `once`: lúc mở phiên, chỉ lần đầu tiên trên máy (hộp thoại hệ thống không bật lại mỗi lần đăng nhập);
 * - `always`: người dùng tự bấm "Bật thông báo đẩy";
 * - `never`: chỉ làm mới token khi quyền đã có (token của hệ điều hành vừa đổi).
 */
export type PromptPolicy = 'never' | 'once' | 'always';

let inFlight: Promise<void> | null = null;

/**
 * Xin quyền (theo `prompt`), lấy Expo push token và đăng ký với finora-notification. Gộp các lời gọi trùng (cầu nối
 * lúc mở phiên và nút ở màn cài đặt có thể chạy cùng lúc) thành một. Không ném lỗi: kết quả nằm ở trạng thái đăng ký.
 */
export function registerForPush(prompt: PromptPolicy): Promise<void> {
  if (!inFlight) {
    inFlight = run(prompt).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function run(prompt: PromptPolicy): Promise<void> {
  if (Platform.OS === 'web') {
    setRegistrationState({ kind: 'unsupported' });
    return;
  }
  if (isMocked('notification')) {
    setRegistrationState({ kind: 'mocked' });
    return;
  }
  if (!EAS_PROJECT_ID) {
    setRegistrationState({ kind: 'not-configured' });
    return;
  }

  setRegistrationState({ kind: 'working' });
  try {
    await ensureAndroidChannel();
    let permission = await Notifications.getPermissionsAsync();
    const mayPrompt = prompt === 'always' || (prompt === 'once' && !(await wasPermissionPrompted()));
    if (!permission.granted && permission.canAskAgain && mayPrompt) {
      await rememberPermissionPrompted();
      permission = await Notifications.requestPermissionsAsync();
    }
    if (!permission.granted) {
      setRegistrationState({ kind: 'denied', canAskAgain: permission.canAskAgain });
      return;
    }
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID });
    const device = await registerDevice(token, currentPlatform());
    setRegisteredDeviceId(device.deviceId);
    setRegistrationState({ kind: 'registered', tokenRef: device.tokenRef });
  } catch (error) {
    setRegistrationState({ kind: 'error', message: describe(error) });
  }
}

/**
 * Gỡ thiết bị khỏi danh sách nhận push khi đăng xuất, bằng access token chụp trước khi phiên bị xóa. Trạng thái trên
 * máy được dọn ngay; lời gọi mạng có thể lỗi (mất mạng) và caller không được chặn đăng xuất vì nó: lần đăng nhập sau,
 * backend tự chuyển token sang đúng tài khoản mới.
 */
export async function unregisterPushDevice(accessToken: string | null): Promise<void> {
  const deviceId = getRegisteredDeviceId();
  setRegisteredDeviceId(null);
  setRegistrationState({ kind: 'idle' });
  if (!deviceId || !accessToken) return;
  await unregisterDevice(deviceId, accessToken);
}

/**
 * Android 8+ cần kênh trước khi hiện push; Android 13+ cần kênh trước khi hỏi quyền. `PRIVATE`: màn hình khóa có bảo
 * mật chỉ hiện "nội dung bị ẩn" — lớp che thứ hai ngoài việc backend đã không gửi số tiền/mã khoản vay (D63).
 */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Thông báo FINORA',
    importance: Notifications.AndroidImportance.DEFAULT,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
  });
}

function currentPlatform(): DevicePlatform {
  if (Platform.OS === 'ios') return 'IOS';
  if (Platform.OS === 'android') return 'ANDROID';
  return 'UNKNOWN';
}

/** Lỗi API giữ thông điệp backend; lỗi của Expo (máy ảo, Expo Go, mất mạng tới Expo) quy về một câu dễ hiểu. */
function describe(error: unknown): string {
  if (error instanceof ApiError || error instanceof NetworkError) return toUserMessage(error);
  return 'Không lấy được mã nhận thông báo trên thiết bị này. Máy ảo và Expo Go không nhận được thông báo đẩy từ xa.';
}
