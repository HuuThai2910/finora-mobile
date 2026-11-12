/**
 * Địa chỉ Gateway, cửa vào chung của mọi service backend (user, loan, investment, payment, notification). Gateway
 * định tuyến theo đường dẫn `/api/v1/**` nên app chỉ cần một base URL.
 */
// Dùng || chứ không phải ??: biến bỏ trống trong .env đến đây là chuỗi rỗng, mà ?? chỉ rơi về mặc định khi
// null/undefined nên sẽ tạo URL sai.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Địa chỉ gốc WebSocket (sổ lệnh thời gian thực, `/ws/order-books/<id>`). Gateway không chuyển tiếp WebSocket; trên VM
 * Caddy đưa `/ws/*` thẳng tới Investment, nên mặc định lấy origin của `API_BASE_URL` (https → wss). Chạy local thì
 * Gateway ở cổng 8080 không có `/ws`: đặt `EXPO_PUBLIC_WS_BASE_URL=ws://<IP máy>:8084` (cổng Investment); bỏ trống thì
 * kênh không mở được và màn sổ lệnh tự chuyển sang hỏi lại định kỳ.
 */
export const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_BASE_URL || toWebSocketOrigin(API_BASE_URL);

function toWebSocketOrigin(url: string): string {
  const match = /^(https?):\/\/([^/]+)/i.exec(url);
  if (!match) return url;
  return `${match[1].toLowerCase() === 'https' ? 'wss' : 'ws'}://${match[2]}`;
}
