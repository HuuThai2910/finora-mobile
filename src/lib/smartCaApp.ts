import { Linking, Platform } from 'react-native';

const DEFAULT_SMART_CA_APP_URL = 'vnptsmartcademo://';

export type SmartCaOpenResult =
  | { opened: true }
  | { opened: false; reason: 'WEB_UNSUPPORTED' | 'OPEN_FAILED' };

/**
 * Mở ứng dụng VNPT SmartCA đã cài trên thiết bị.
 *
 * URL là cấu hình công khai để đổi giữa Demo và Production, không chứa thông tin
 * xác thực. Luồng hiện tại chỉ mở ứng dụng; backend vẫn là nơi giữ `tranId`, hỏi
 * kết quả ký và quyết định trạng thái hợp đồng.
 */
export async function openSmartCaApp(): Promise<SmartCaOpenResult> {
  if (Platform.OS === 'web') {
    return { opened: false, reason: 'WEB_UNSUPPORTED' };
  }

  const configuredUrl = process.env.EXPO_PUBLIC_SMARTCA_APP_URL?.trim();
  const appUrl = configuredUrl || DEFAULT_SMART_CA_APP_URL;

  try {
    await Linking.openURL(appUrl);
    return { opened: true };
  } catch {
    return { opened: false, reason: 'OPEN_FAILED' };
  }
}

/** Thông báo thống nhất cho trường hợp không thể chuyển sang ứng dụng SmartCA. */
export function smartCaOpenFailureMessage(result: SmartCaOpenResult): string | null {
  if (result.opened) return null;
  return result.reason === 'WEB_UNSUPPORTED'
    ? 'Bản web không thể chuyển ổn định sang ứng dụng VNPT SmartCA. Hãy mở FINORA trên điện thoại để xác nhận ký số.'
    : 'Không mở được VNPT SmartCA Demo. Hãy kiểm tra ứng dụng đã được cài trên điện thoại rồi thử lại.';
}
