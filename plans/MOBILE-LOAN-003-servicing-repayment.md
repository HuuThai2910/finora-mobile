# MOBILE-LOAN-003 — Quản lý và thanh toán khoản vay

## Trạng thái

`READY_FOR_REVIEW` — UI người vay và kết nối API thật hoàn tất ngày 2026-10-04.

## Mục tiêu và actor

- Actor chính: người vay đã đăng nhập.
- Cho phép kiểm thử bằng giao diện toàn bộ servicing đã có contract backend: xem khoản vay/lịch thật,
  trả kỳ thường hoặc khắc phục quá hạn, trả trước một phần gốc, tất toán sớm và gửi yêu cầu cơ cấu.
- Admin tiếp tục duyệt cơ cấu, theo dõi quá hạn và đối soát trên `finora-web`; mobile không giả quyền admin.

## Nguồn sự thật

- Loan: LN-012–LN-017 và `docs/LOAN-SERVICING-POLICY.md`.
- Payment: `RepaymentController`, quote và response DTO hiện hành.
- UI: component, token và navigation đang chạy trong mobile mới. File tham chiếu
  `finora-platform/docs/ui/bản-đẹp.html` hiện có hash khác registry cũ, vì vậy task này không thay đổi
  design system diện rộng và không sao chép mock/contract từ HTML.

## Luồng nhìn thấy

1. Từ Hồ sơ, người vay mở **Khoản vay đang trả**.
2. Danh sách lấy `GET /loans/me`; chọn một khoản để xem số dư, kỳ tới, quá hạn và lịch thật.
3. **Thanh toán kỳ/khắc phục quá hạn** gửi `POST /repayments`; số tiền mặc định lấy từ backend nhưng
   người dùng xác nhận trước khi thu ví.
4. **Trả trước một phần** nhập số gốc, lấy quote rồi xác nhận quote bằng API riêng. Không dựng lịch giả;
   sau thành công refetch lịch Fineract.
5. **Tất toán sớm** lấy quote gồm gốc/lãi/phí/phạt, sau đó xác nhận bằng quote ID.
6. **Cơ cấu/gia hạn** đọc policy, người dùng chọn loại, ngày áp dụng/số kỳ và gửi xác nhận; Admin duyệt
   trên web hiện có.

## API contract

- Loan: `GET /loans/me`, `GET /loans/{loanNumber}`,
  `GET /loans/{loanNumber}/repayment-schedule`, `GET /loans/reschedule-policy`,
  `GET|POST /loans/{loanNumber}/reschedule-requests`.
- Payment: `POST /repayments`, `GET /repayments/{id}`,
  `POST /repayments/partial-prepayment-quotes`, `POST /repayments/partial-prepayment`,
  `POST /repayments/early-settlement-quotes`, `POST /repayments/early-settlement`.
- Mọi mutation tài chính gửi một `Idempotency-Key` ổn định trong suốt một lần bấm xác nhận.

## State và lỗi

- Server state nằm trong hook feature, dùng `useAsync` theo kiến trúc mobile hiện có; form/tab/quote là
  local state và không đẩy vào global store.
- Có loading, empty, error, success; nút khóa khi mutation chạy; lỗi backend được chuẩn hóa bằng
  `toUserMessage` và giữ trace ở `ApiError`.
- Sau giao dịch thành công, tải lại summary/lịch/ví. Trạng thái reconcile được hiển thị rõ, không báo
  “hoàn tất” nếu backend chưa terminal.

## File đã triển khai

- `src/features/loan-servicing/{api,types,hooks,components,screens,index.ts}`.
- `src/navigation/types.ts`, `src/navigation/MainTabs.tsx`.
- `src/features/account/component/AccountScreen.tsx` để thêm lối vào UI mới.
- Giữ `wallet/PayInstallmentScreen` cho tương thích route cũ nhưng điều hướng về servicing thật.

Hướng dẫn chạy happy case và từng cơ chế bằng UI: `docs/LOAN-SERVICING-UI-TEST.md`.

## Kiểm tra và nghiệm thu

- TypeScript strict bằng `npx tsc --noEmit`.
- Từng cơ chế gọi đúng API thật, không còn `NOT_IMPLEMENTED`/mock trong đường đi mới.
- Không double-submit; quote hết hạn/đã dùng không thể xác nhận lại.
- Màn nhỏ, loading, empty, lỗi mạng, số dư thiếu và status lạ vẫn hiển thị an toàn.
- Trả trước một phần chỉ hiển thị lịch mới sau khi Payment/Fineract hoàn tất.

Kết quả kiểm tra ngày 2026-10-04:

- `npx tsc --noEmit`: đạt.
- `npx expo export --platform web`: đạt, bundle 993 module.
- Đối chiếu controller/DTO Loan và Payment: đúng path, body, response enum và idempotency header.
