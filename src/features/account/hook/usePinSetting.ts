import { Alert } from 'react-native';
import { usePinGuard, usePinStatus, type PinSavedAction } from '@/features/pin';

const SAVED_MESSAGE: Record<PinSavedAction, string> = {
  created: 'Đã tạo mã PIN. Từ giờ các giao dịch sẽ cần mã này để xác nhận.',
  changed: 'Đã đổi mã PIN. Hãy dùng mã mới cho các giao dịch sau.',
  reset: 'Đã đặt lại mã PIN. Hãy dùng mã mới cho các giao dịch sau.',
};

/**
 * Dòng "Tạo/Đổi mã PIN" của màn Hồ sơ: đọc trạng thái PIN để chọn nhãn, mở bảng PIN ở chế
 * độ quản lý và tải lại trạng thái sau khi lưu. Chưa tải xong trạng thái vẫn cho bấm, vì
 * bảng PIN tự kiểm tra lại trước khi chọn luồng tạo hay đổi.
 */
export function usePinSetting() {
  const status = usePinStatus();
  const { managePin } = usePinGuard();
  const hasPin = status.data?.hasPin ?? null;

  const open = async () => {
    const saved = await managePin();
    if (!saved) return;
    Alert.alert('Mã PIN giao dịch', SAVED_MESSAGE[saved]);
    status.reload();
  };

  let title = 'Mã PIN giao dịch';
  let subtitle = status.error ? 'Chưa tải được trạng thái, chạm để thử' : 'Đang kiểm tra…';
  if (hasPin === true) {
    title = 'Đổi mã PIN';
    subtitle = status.data?.locked ? 'Đang tạm khóa do nhập sai nhiều lần' : 'Mã 6 số xác nhận giao dịch';
  } else if (hasPin === false) {
    title = 'Tạo mã PIN';
    subtitle = 'Cần có trước khi thanh toán, đầu tư, ký hợp đồng';
  }

  return { title, subtitle, open, reload: status.reload };
}
