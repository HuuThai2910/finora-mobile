/**
 * Địa chỉ Gateway, cửa vào chung của mọi service backend (user, loan, investment, payment, notification). Gateway
 * định tuyến theo đường dẫn `/api/v1/**` nên app chỉ cần một base URL.
 */
// Dùng || chứ không phải ??: biến bỏ trống trong .env đến đây là chuỗi rỗng, mà ?? chỉ rơi về mặc định khi
// null/undefined nên sẽ tạo URL sai.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
