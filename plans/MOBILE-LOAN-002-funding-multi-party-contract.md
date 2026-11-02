---
task_id: MOBILE-LOAN-002
status: READY_FOR_REVIEW
owner: Thai
approved_by: Thai
approved_at: 2026-09-26
backend_scope: LN-009, LN-010
---

# MOBILE-LOAN-002 — Gọi vốn và hợp đồng vay nhiều bên

## Mục tiêu

Nối UI hiện hành với luồng backend đã chốt: Loan đưa exact terms lên sàn, Investment gọi đủ vốn,
Loan phát hành **một PDF chung**, toàn bộ nhà đầu tư ký trước và borrower ký sau cùng.

## Luồng nhìn thấy

```text
Borrower chấp thuận exact terms
→ hồ sơ gọi vốn trên Market
→ gọi đủ vốn
→ nhà đầu tư mở đúng PDF/hash và ký phần vốn của mình
→ đủ chữ ký nhà đầu tư
→ borrower mở đúng PDF/hash và ký
→ hợp đồng có hiệu lực
```

## API và trạng thái

- Market đọc từ Investment; `annualInterestRate` là điểm phần trăm/năm (`15.0000` = `15%`).
- Investor đọc `GET /api/v1/investor/loan-contracts/me`, tải PDF và gọi endpoint ký của Loan.
- Borrower tiếp tục dùng Contract API hiện có nhưng phải hiểu thêm
  `PENDING_LENDER_SIGNATURES` và `PENDING_BORROWER_SIGNATURE`.
- Mobile không dựng PDF, không tự tính exact terms và không coi `LoanContractActivated` là đã giải ngân.
- Provider `MOCK` hiển thị rõ là thử nghiệm; khi backend trả `VNPT_SMART_CA`, investor gửi yêu cầu,
  FINORA thử mở ứng dụng SmartCA bằng scheme cấu hình theo môi trường, người dùng xác nhận trong
  SmartCA rồi mobile poll kết quả theo từng bên ký. Màn chờ luôn giữ nút mở lại ứng dụng; bản web
  không giả lập hành vi chuyển ứng dụng native.

## State và failure path

- Dữ liệu hợp đồng là server state; trạng thái đã mở PDF giữ local theo `pdfDocumentHash`.
- Mutation khóa nút và gửi version/hash/idempotency key; retry cùng ý định giữ cùng key.
- Có loading, empty, error, success, version/hash conflict, hết hạn và không thuộc contract party.
- Cập nhật 2026-10-17 (contract `LoanFundingCancelled` v1): khi Loan trả `funding.status = CANCELLED`
  (hợp đồng bị từ chối/hết hạn ký hoặc giải ngân thất bại), danh sách và chi tiết hồ sơ ưu tiên trạng thái
  “Dừng trước giải ngân” hơn trạng thái Contract (giải ngân thất bại vẫn để Contract `EFFECTIVE`) và xếp vào nhóm
  “stopped”; vẫn tải Contract để người vay xem lại. Màn khoản vay của nhà đầu tư đọc `cancellationReason` của
  listing để báo khoản vay không giải ngân và tiền giữ đã trả lại ví.

## File dự kiến

- `src/features/investment/api.ts`, hook và màn hợp đồng đầu tư.
- `src/features/market/mapper.ts`, `src/features/investment/mapper.ts`,
  `src/features/secondary-market/mapper.ts`.
- `src/types/invest.ts`, `src/types/contract.ts` và mapper/status Contract borrower.

## Kiểm tra chấp nhận

- [x] TypeScript strict qua `npx tsc --noEmit`.
- [x] Lãi suất 15.0000 hiển thị 15%, không thành 1500%.
- [x] Investor chỉ ký sau khi mở đúng PDF hiện hành.
- [x] Borrower không được ký khi còn chờ lender.
- [x] UI thể hiện rõ mock/SmartCA và đủ trạng thái loading/error/success.
- [x] Investor SmartCA có trạng thái `SIGNING`, kiểm tra thủ công và polling giới hạn ở foreground.
- [x] Không gọi trực tiếp database, AI, Fineract hoặc service ngoài Gateway/backend public API.
- [x] Danh mục đầu tư phân biệt rõ vốn còn nằm trong khoản vay và vốn đang chờ hoàn tất đầu tư.
- [x] Nhà đầu tư có một màn riêng để xem hợp đồng cần xử lý và toàn bộ hợp đồng đã tham gia.
- [x] Thẻ khoản đầu tư ưu tiên mã khoản vay `LN`, đồng thời hiển thị mã hồ sơ `LA` và hợp đồng `LC`
  để người dùng nhận biết đúng hồ sơ đã đầu tư và mở lại đúng hợp đồng.
- [x] Loan Contract API trả thêm định danh hồ sơ/khoản vay cho mobile mà không thay đổi nguồn chuẩn của Investment.

## Cập nhật trải nghiệm hợp đồng và vốn chờ ngày 2026-11-02

- Màn nhà đầu tư chỉ hiển thị luồng hai bước khi còn phải đọc/ký; sau khi ký, từ chối hoặc hết hạn thì
  thay bằng trạng thái ngắn và một nút mở lại PDF.
- Mã hồ sơ, mã khoản vay, số Note và số bên chưa ký nằm trong mục đối chiếu mở khi cần; số vốn, mục đích,
  kỳ hạn và hạn ký vẫn ở phần tóm tắt.
- “Không tiếp tục đầu tư” và “Rút vốn đang chờ” là hành động phụ, chỉ chuyển sang cảnh báo phá huỷ tại
  bước xác nhận cuối. Điều kiện được rút/từ chối vẫn lấy nguyên từ backend.
- Chữ ký/biên nhận mặc định thu gọn; danh mục giải thích vốn chờ một lần và dùng cùng thuật ngữ ở thẻ,
  hộp xác nhận và thông báo thành công.

Kiểm thử runtime trên thiết bị và E2E Kafka local vẫn là bước review trước khi Thái chuyển `ACCEPTED`.
