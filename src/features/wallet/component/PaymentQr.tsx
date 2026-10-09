import { useMemo } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { toQR } from 'toqr';
import { Colors } from '@/constants/colors';

type Props = {
  /** Chuỗi `qrPayload` backend trả về (với ZaloPay là `qr_code` của đơn hàng). */
  payload: string;
  /** Cạnh tối đa; mã thu về bội số gần nhất của số ô nên có thể nhỏ hơn một chút. */
  size: number;
};

/** Viền trắng 4 ô quanh mã theo chuẩn QR để máy quét tìm được mép mã. */
const QUIET_ZONE = 4;

/**
 * Mã QR thật mã hoá đúng `qrPayload`: với ZaloPay, quét bằng ứng dụng ZaloPay là thanh toán được
 * (thay cho lưới minh hoạ cũ không quét được). Mỗi hàng ô tối gộp thành một đoạn path để SVG nhẹ.
 */
export default function PaymentQr({ payload, size }: Props) {
  // Mã hoá QR tốn vài mili giây; payload cố định suốt vòng đời lệnh nên chỉ tính lại khi đổi lệnh.
  const { path, span } = useMemo(() => buildQrPath(payload), [payload]);
  // Mỗi ô đúng một số nguyên điểm ảnh để hai hàng ô liền nhau không hở vệt mảnh do khử răng cưa.
  const side = Math.max(1, Math.floor(size / span)) * span;

  return (
    <Svg
      width={side}
      height={side}
      viewBox={`0 0 ${span} ${span}`}
      accessibilityRole="image"
      accessibilityLabel="Mã QR thanh toán"
    >
      <Rect width={span} height={span} fill={Colors.card} />
      <Path d={path} fill={Colors.authInk} />
    </Svg>
  );
}

function buildQrPath(payload: string): { path: string; span: number } {
  const modules = toQR(payload);
  const count = Math.round(Math.sqrt(modules.length));
  const parts: string[] = [];
  for (let y = 0; y < count; y++) {
    let x = 0;
    while (x < count) {
      if (!modules[y * count + x]) {
        x++;
        continue;
      }
      const start = x;
      while (x < count && modules[y * count + x]) x++;
      parts.push(`M${start + QUIET_ZONE} ${y + QUIET_ZONE}h${x - start}v1h${start - x}z`);
    }
  }
  return { path: parts.join(''), span: count + QUIET_ZONE * 2 };
}
