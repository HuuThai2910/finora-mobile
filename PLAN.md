# Kế hoạch triển khai finora-mobile

## Cách dùng

File này chỉ điều phối task, dependency và trạng thái. Nghiệp vụ/API/UI/test chi tiết nằm trong file plan tương ứng. Backend Design và LN đã duyệt vẫn là nguồn sự thật nghiệp vụ.

```text
DRAFT -> APPROVED -> IN_PROGRESS -> READY_FOR_REVIEW -> ACCEPTED
```

- AI được tạo `DRAFT`, chỉ bắt đầu code sau khi Thái chuyển `APPROVED`.
- Chỉ Thái chuyển task sang `APPROVED` hoặc `ACCEPTED`.
- Khi backend contract thay đổi, cập nhật plan trước khi sửa UI nếu thay đổi luồng hoặc acceptance criteria.

Trạng thái trong bảng là trạng thái **nghiệm thu task**, không phải kết luận code của luồng chưa tồn tại.
`READY_FOR_REVIEW` nghĩa là code/typecheck đã có nhưng còn chờ owner/UAT. `MOBILE-LOAN-001` đang
`IN_PROGRESS` và `MOBILE-EKYC-001` đang `DRAFT` không phủ nhận luồng hiện hành; phải đọc plan/code để
phân biệt phần đã chạy với phần acceptance/hardening còn dự kiến. Plan tổng hợp liên repository nằm tại
`../finora-platform/.agents/plans/finora-remaining-work-plan.md`.

## Danh sách task

| Task | Phạm vi | Backend | Trạng thái | Đặc tả |
|---|---|---|---|---|
| MOBILE-AUTH-001 | Đăng ký + OTP email, đăng nhập, quên/đặt lại mật khẩu, giữ phiên | finora-user `AuthController` | `READY_FOR_REVIEW` | Không lập plan riêng theo yêu cầu của Thái |
| MOBILE-LOAN-001 | Product → preview → submit → theo dõi → Contract/consent | LN-003–LN-008 | `IN_PROGRESS` | [Plan](plans/MOBILE-LOAN-001-end-to-end.md) |
| MOBILE-EKYC-001 | Định danh điện tử: chụp CCCD mặt trước → mặt sau → kết quả (đã bỏ face/liveness theo yêu cầu của Thái 2026-08-22) | finora-user (ekyc-verify) | `DRAFT` | [Plan](plans/MOBILE-EKYC-001-ekyc-verification.md) |
| MOBILE-LOAN-002 | Gọi vốn, một hợp đồng nhiều bên và hai lượt ký | LN-009–LN-010 | `READY_FOR_REVIEW` | [Plan](plans/MOBILE-LOAN-002-funding-multi-party-contract.md) |
| MOBILE-LOAN-003 | Giải ngân, repayment, overdue, prepayment, settlement, restructuring | LN-011–LN-017 | `READY_FOR_REVIEW` — UI người vay/nhà đầu tư và consent cơ cấu đã typecheck ngày 2026-10-16 | [Plan](plans/MOBILE-LOAN-003-servicing-repayment.md) |
| MOBILE-INVESTOR-001 | Risk projection trên danh mục + thông báo servicing thật | Investment/Notification P5-B04 | `READY_FOR_REVIEW` — portfolio hiển thị DPD/nhóm nợ; notification list/count/read nối Gateway ngày 2026-10-04 | [Contract chung](../finora-platform/docs/integrations/CIC-RISK-NOTIFICATION.md) |
| MOBILE-INVESTOR-002 | Hồ sơ người vay (ẩn danh, không SHAP): thẻ tóm tắt trên màn khoản vay + màn "Hồ sơ người vay" | Loan `GET /investor/loan-applications/{n}/borrower-profile`; Investment trả `applicationNumber` | `READY_FOR_REVIEW` — Hải chốt ngày 2026-10-10: ẩn danh, đủ chỉ số | [Spec](../finora-platform/docs/superpowers/specs/2026-10-10-investor-borrower-profile-design.md) |
| MOBILE-WALLET-001 | Rút tiền về ngân hàng: hạn mức theo policy, chọn ngân hàng, PIN `WITHDRAW` gắn `Idempotency-Key`, theo dõi lệnh tới `COMPLETED`/`FAILED` (hoàn tiền về ví), lịch sử lệnh rút; nhãn môi trường demo khi provider giả lập | Payment W3B (R4) `/wallets/withdrawal-policy`, `/wallets/me/withdrawals` | `READY_FOR_REVIEW` — thay màn rút tiền giả lập, typecheck ngày 2026-10-17, chờ E2E với Payment | [Plan W3B](../finora-platform/.agents/plans/W3B-wallet-withdrawal-mock-payout.md) |
| MOBILE-NOTIFY-001 | Thông báo đẩy Expo Push và màn Cài đặt thông báo (trạng thái thiết bị, công tắc push theo nhóm); màn vẽ lại theo giao diện tab Hồ sơ của Hải | Notification W3F (R7) `/notifications/devices`, `/notifications/preferences` | `READY_FOR_REVIEW` — typecheck ngày 2026-10-17, chưa thử push trên máy thật | [Plan](plans/MOBILE-NOTIFY-001-push-preferences.md) |
| MOBILE-CONTRACT-PADES-001 | Hợp đồng ký PAdES nhiều bên trên màn hợp đồng người vay và màn ký của nhà đầu tư: số chữ ký trong PDF, bản đang ký, "Trang biên nhận chữ ký", `SIGNED_PDF`, xử lý `409 CONTRACT_SIGNATURE_IN_PROGRESS` và `503 SIGNATURE_PROVIDER_INVALID_SIGNATURE` | Loan W3C (R5) `/loan-contracts/{n}`, `/investor/loan-contracts/{n}` (`/signed-document`, `/receipt`) | `READY_FOR_REVIEW` — typecheck ngày 2026-10-17, chờ E2E MOCK và UAT SmartCA | [Plan W3C](../finora-platform/.agents/plans/W3C-pades-contract-signing.md) |

## Quy tắc đồng bộ về sau

Sau MOBILE-LOAN-001, không đợi toàn bộ Loan Service hoàn thành. Mỗi nhóm 1–2 LN backend liên quan đã sẵn sàng sẽ được lập plan, tích hợp web/mobile và kiểm thử end-to-end trước khi chuyển nhóm tiếp theo.

`MOBILE-INVESTOR-001` tuân theo UI portfolio/notification hiện tại của Hải: chỉ thêm trạng thái
rủi ro và nguồn API thật, không khôi phục screen cũ hoặc đổi cấu trúc điều hướng.

Cập nhật 2026-10-17 (MOBILE-CONTRACT-PADES-001 theo [W3C](../finora-platform/.agents/plans/W3C-pades-contract-signing.md),
MOBILE-NOTIFY-001; Thái cho tự chọn phương án, Hải review trước merge vì chạm màn của Hải):

- D73: thẻ "Chữ ký số trong PDF" trên màn chi tiết hợp đồng của người vay (`ContractSignaturesCard`, kiểu `DetailCard`)
  và màn ký của nhà đầu tư (`ContractSignedFilesCard`, cùng khung thẻ bước ký), chỉ với hợp đồng `PADES_B_B`: số chữ ký
  backend trả (`signedPdfDocument.signatureCount` / `pdfSignatureCount`), nút "Bản đang ký (N chữ ký)" (`/signed-document`)
  khi chưa có biên nhận và "Trang biên nhận chữ ký" (`/receipt`) khi đã có, kèm câu chữ ký demo/UAT chưa có giá trị pháp
  lý. Có biên nhận là tín hiệu đã đủ chữ ký (lúc đó `/document` đã là `SIGNED_PDF`). Consent vẫn gửi hash bản SIGNABLE như
  cũ. `409 CONTRACT_SIGNATURE_IN_PROGRESS`: báo đợi vài phút, giữ idempotency key, không coi là dữ liệu cũ, không tự thử
  lại. `503 SIGNATURE_PROVIDER_INVALID_SIGNATURE`: backend đã hủy lần ký nên dùng key mới, tải lại hợp đồng, nút thành
  "Ký lại"; vòng hỏi SmartCA nền dừng khi gặp lỗi kết thúc phiên ký và báo lý do.
- D74: màn Cài đặt thông báo (R7) vẽ lại theo màn "Thông tin tài khoản" và thẻ cài đặt của tab Hồ sơ (nền sóng, đầu màn
  không thẻ, thẻ trắng, dòng ô icon 40pt, hộp ghi chú nền nhạt), giữ nguyên hành vi và API. Component nằm trong feature
  `push-notifications` (cùng kích thước với component của `account`) vì import `@/features/account` từ đây tạo vòng
  require `AuthProvider` → `push-notifications` → `account` → `AuthProvider`.
- B71 (P2): `InlineContractConsent` đọc `consent.error` của lần render trước sau `await`, nên lần 409 đầu tiên không tải
  lại hợp đồng (phải bấm hai lần). Sửa: `sign`/`decline` trả kết quả kèm lỗi.
- B72 (P2): vòng hỏi SmartCA nền của người vay và nhà đầu tư nuốt mọi lỗi và hỏi tiếp tới 12 lần, kể cả lỗi kết thúc
  (chữ ký bị từ chối, `INVESTOR_SIGNATURE_NOT_STARTED` sau khi phiên bị đóng), nên người dùng không biết chữ ký bị từ chối.
  Sửa: dừng hỏi, tải lại hợp đồng, hiện lý do và mời ký lại.
- B74 (P3): màn Cài đặt thông báo của R7 dùng khung `Screen`/`PHeader` và `Card`/`InfoNote`/`SectionLabel` cũ, lệch giao
  diện mới của tab Hồ sơ. Sửa theo D74.
