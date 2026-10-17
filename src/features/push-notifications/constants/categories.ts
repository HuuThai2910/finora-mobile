import type { IconName } from '@/constants/icons';
import type { NotificationCategory } from '../types';

type CategoryCopy = { title: string; description: string; icon: IconName };

/** Nhãn tiếng Việt và icon của từng nhóm thông báo; thứ tự hiển thị theo thứ tự backend trả về. */
export const CATEGORY_COPY: Readonly<Record<NotificationCategory, CategoryCopy>> = {
  FUNDING: { title: 'Gọi vốn', description: 'Hồ sơ lên sàn, đủ vốn, hết hạn hoặc bị hủy', icon: 'coins' },
  CONTRACT: { title: 'Hợp đồng và chữ ký', description: 'Đến lượt ký, hợp đồng có hiệu lực', icon: 'penLine' },
  DISBURSEMENT: { title: 'Giải ngân', description: 'Tiền vay vào ví, Note được phát hành', icon: 'banknoteArrowUp' },
  REPAYMENT: {
    title: 'Trả nợ và nhắc lịch',
    description: 'Kỳ sắp đến hạn, khoản trả đã ghi nhận, tiền nhận được',
    icon: 'calendarClock',
  },
  DELINQUENCY: { title: 'Quá hạn', description: 'Khoản vay quá hạn, chuyển nhóm nợ, đã khắc phục', icon: 'clockAlert' },
  RESTRUCTURING: { title: 'Cơ cấu khoản vay', description: 'Thẩm định, biểu quyết và lịch trả nợ mới', icon: 'fileCog' },
  WALLET: { title: 'Ví và rút tiền', description: 'Kết quả rút tiền về tài khoản ngân hàng', icon: 'wallet' },
  GENERAL: { title: 'Thông báo khác', description: 'Cập nhật chưa thuộc nhóm nào ở trên', icon: 'bell' },
};

/** Nhóm backend mới bổ sung mà app chưa biết: vẫn cho bật/tắt, đặt nhãn chung thay vì ẩn đi. */
export function categoryCopy(category: string): CategoryCopy {
  return (
    (CATEGORY_COPY as Readonly<Record<string, CategoryCopy>>)[category] ?? {
      title: 'Nhóm thông báo mới',
      description: category,
      icon: 'bell',
    }
  );
}
