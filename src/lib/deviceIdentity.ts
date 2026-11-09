import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { APP_VERSION } from './appInfo';

/**
 * Định danh thiết bị gửi kèm mọi request để `finora-user` ghi "Thiết bị đăng nhập" (LOGIN-DEVICE-001).
 *
 * Mã thiết bị sinh ngẫu nhiên một lần rồi lưu SecureStore (xóa app thì có mã mới, như một thiết bị mới). Đây không phải
 * bí mật hay khóa bảo mật: server chỉ dùng để gộp các lần đăng nhập của cùng máy và nhận ra "Thiết bị này".
 *
 * Tên/HĐH lấy từ `Platform` (không thêm `expo-device`); giá trị header chỉ giữ ký tự ASCII in được vì OkHttp trên Android
 * từ chối header có ký tự ngoài ASCII.
 */

const DEVICE_ID_KEY = 'finora.device.id';

let deviceIdPromise: Promise<string> | null = null;

function randomId(): string {
  // Không cần ngẫu nhiên mật mã: mã chỉ để phân biệt máy, không cấp quyền gì.
  let value = '';
  for (let i = 0; i < 32; i += 1) value += Math.floor(Math.random() * 16).toString(16);
  return `m-${value}`;
}

async function loadDeviceId(): Promise<string> {
  try {
    if (await SecureStore.isAvailableAsync()) {
      const saved = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      if (saved) return saved;
      const created = randomId();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, created);
      return created;
    }
  } catch {
    // SecureStore lỗi (web, máy hạn chế): dùng mã trong bộ nhớ cho phiên này.
  }
  return randomId();
}

/** Mã thiết bị của máy này; đọc SecureStore một lần rồi giữ trong bộ nhớ. */
export function getDeviceId(): Promise<string> {
  deviceIdPromise ??= loadDeviceId();
  return deviceIdPromise;
}

const ascii = (value: string): string => value.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();

/** "samsung SM-S918B", "iPhone", "iPad"; không đoán được thì để server suy từ User-Agent. */
function deviceName(): string | null {
  if (Platform.OS === 'android') {
    const constants = Platform.constants as { Manufacturer?: string; Model?: string };
    const name = ascii([constants.Manufacturer, constants.Model].filter(Boolean).join(' '));
    return name || 'Android';
  }
  if (Platform.OS === 'ios') return Platform.isPad ? 'iPad' : 'iPhone';
  return null;
}

function deviceOs(): string | null {
  if (Platform.OS === 'android') return `Android ${String(Platform.Version)}`;
  if (Platform.OS === 'ios') return `iOS ${String(Platform.Version)}`;
  return null;
}

const STATIC_HEADERS: Record<string, string> = (() => {
  const headers: Record<string, string> = { 'X-App-Version': ascii(APP_VERSION) };
  const name = deviceName();
  const os = deviceOs();
  if (name) headers['X-Device-Name'] = name.slice(0, 100);
  if (os) headers['X-Device-Os'] = ascii(os).slice(0, 60);
  return headers;
})();

/** Header thiết bị gắn vào mọi request; lỗi đọc mã thiết bị không chặn request. */
export async function deviceHeaders(): Promise<Record<string, string>> {
  try {
    return { ...STATIC_HEADERS, 'X-Device-Id': await getDeviceId() };
  } catch {
    return STATIC_HEADERS;
  }
}
