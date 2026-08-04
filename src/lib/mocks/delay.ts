import { shouldMockFail, type MockDomain } from '@/lib/mockFlag';
import { ApiError } from '@/lib/api';

const LATENCY_MS = 320;

/**
 * Trả dữ liệu giả sau một khoảng trễ nhỏ để màn hình vẫn đi qua trạng thái
 * đang tải như khi gọi mạng thật.
 * Chỉ ném lỗi khi miền được bật trong `EXPO_PUBLIC_MOCK_FAIL`.
 */
export function mockResponse<T>(domain: MockDomain, value: T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldMockFail(domain)) {
        reject(new ApiError(503, `mock failure for domain "${domain}"`, 'MOCK_FAILURE'));
        return;
      }
      resolve(value);
    }, LATENCY_MS);
  });
}
