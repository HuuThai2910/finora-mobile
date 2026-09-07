/**
 * Công tắc chọn nguồn dữ liệu cho từng miền.
 *
 * `EXPO_PUBLIC_MOCK_DOMAINS` liệt kê các miền chạy bằng dữ liệu giả, cách nhau
 * bằng dấu phẩy. Miền không có tên trong danh sách sẽ gọi HTTP thật.
 * Khi backend của một miền hoàn thành, chỉ cần xoá tên miền đó khỏi biến môi
 * trường — không phải sửa dòng code nào trong màn hình.
 */
/**
 * `auth` cố ý không có trong danh sách: Loan Service đọc claim `user_id` của access
 * token thật để biết hồ sơ vay thuộc về ai, nên một phiên giả sẽ bị từ chối.
 */
export type MockDomain =
  | 'ekyc'
  | 'wallet'
  | 'invest'
  | 'market'
  | 'notification'
  | 'signature'
  | 'products'
  /**
   * Vòng đời khoản vay sau khi nộp: tiến trình gọi vốn, lịch trả nợ, tất toán.
   * Tách khỏi `products`/hồ sơ vay vì hai thứ đó đã có backend thật, còn phần
   * này thì chưa.
   */
  | 'servicing';

const parse = (raw: string | undefined): ReadonlySet<string> =>
  new Set(
    (raw ?? '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean),
  );

const MOCKED = parse(process.env.EXPO_PUBLIC_MOCK_DOMAINS);
const FAILING = parse(process.env.EXPO_PUBLIC_MOCK_FAIL);

export const isMocked = (domain: MockDomain): boolean => MOCKED.has(domain);

/**
 * Bật lỗi giả cho một miền để xem được trạng thái lỗi khi demo.
 * Mặc định mock không bao giờ ném lỗi.
 */
export const shouldMockFail = (domain: MockDomain): boolean => FAILING.has(domain);
