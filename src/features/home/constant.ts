import type { ImageSourcePropType } from 'react-native';
import type { NotificationKind } from '@/types/notification';
import type { IconName } from '@/constants/icons';

/**
 * Mockup dùng emoji mở đầu mỗi dòng thông báo. Ở đây thay bằng icon vector cùng
 * bộ Lucide để giữ một ngôn ngữ hình ảnh thống nhất và hiển thị đồng nhất trên
 * mọi thiết bị.
 */
export const NOTIFICATION_ICON: Record<NotificationKind, IconName> = {
  cashflow: 'coins',
  disbursement: 'check',
  autoinvest: 'zap',
  reminder: 'clock',
  chain: 'chain',
  security: 'shield',
  credit: 'chart',
};

export const NOTIFICATION_LABEL: Record<NotificationKind, string> = {
  cashflow: 'Dòng tiền',
  disbursement: 'Giải ngân',
  autoinvest: 'Auto-Invest',
  reminder: 'Nhắc lịch',
  chain: 'Sổ cái',
  security: 'Bảo mật',
  credit: 'Tín dụng',
};

/** Mascot robot cầm đồng xu trên thẻ ví (ảnh Hải tạo, đã cắt sát hình). */
export const WALLET_MASCOT: ImageSourcePropType = require('@/assets/mascot-coin.png');

/** Nơi mỗi thẻ giới thiệu dẫn tới; màn chính tự đổi sang lệnh điều hướng. */
export type PromoTarget = 'products' | 'topUp' | 'payInstallment';

export type PromoSlide = {
  target: PromoTarget;
  /** Có dấu cách không ngắt ( ) để cụm từ như "tài chính" không bị tách hai dòng. */
  title: string;
  /** Icon Lucide làm hình minh hoạ, thay cho hình 3D trong mockup. */
  icon: IconName;
  /** Điều xảy ra khi bấm, đọc cho trình đọc màn hình. */
  hint: string;
};

/**
 * Ba thẻ giới thiệu chạy ngang cạnh lời chào (mockup vẽ ba chấm trang). Thẻ đầu
 * lấy nguyên câu của mockup; hai thẻ sau dẫn tới các việc người vay hay làm nhất
 * trên app. Mỗi thẻ mở đúng một màn có sẵn, không có nội dung khuyến mãi giả.
 */
export const PROMO_SLIDES: readonly PromoSlide[] = [
  {
    target: 'products',
    title: 'Vay nhanh, chủ động tài chính',
    icon: 'clipboardCheck',
    hint: 'Mở danh sách sản phẩm vay',
  },
  {
    target: 'topUp',
    title: 'Nạp ví nhanh qua VietQR',
    icon: 'qrCode',
    hint: 'Mở màn nạp tiền vào ví',
  },
  {
    target: 'payInstallment',
    title: 'Trả nợ từ ví chỉ vài chạm',
    icon: 'calendarCheck',
    hint: 'Mở màn trả nợ kỳ này',
  },
];
