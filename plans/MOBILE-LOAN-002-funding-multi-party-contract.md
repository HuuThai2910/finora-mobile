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
  xác nhận trong ứng dụng SmartCA và mobile poll kết quả theo từng bên ký.

## State và failure path

- Dữ liệu hợp đồng là server state; trạng thái đã mở PDF giữ local theo `pdfDocumentHash`.
- Mutation khóa nút và gửi version/hash/idempotency key; retry cùng ý định giữ cùng key.
- Có loading, empty, error, success, version/hash conflict, hết hạn và không thuộc contract party.

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

Kiểm thử runtime trên thiết bị và E2E Kafka local vẫn là bước review trước khi Thái chuyển `ACCEPTED`.
