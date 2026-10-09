# Kế hoạch triển khai finora-mobile

## Cách dùng

File này chỉ điều phối task, dependency và trạng thái. Nghiệp vụ/API/UI/test chi tiết nằm trong file plan tương ứng. Backend Design và LN đã duyệt vẫn là nguồn sự thật nghiệp vụ.

```text
DRAFT -> APPROVED -> IN_PROGRESS -> READY_FOR_REVIEW -> ACCEPTED
```

- AI được tạo `DRAFT`, chỉ bắt đầu code sau khi Thái chuyển `APPROVED`.
- Chỉ Thái chuyển task sang `APPROVED` hoặc `ACCEPTED`.
- Khi backend contract thay đổi, cập nhật plan trước khi sửa UI nếu thay đổi luồng hoặc acceptance criteria.

## Danh sách task

| Task | Phạm vi | Backend | Trạng thái | Đặc tả |
|---|---|---|---|---|
| MOBILE-AUTH-001 | Đăng ký + OTP email, đăng nhập, quên/đặt lại mật khẩu, giữ phiên | finora-user `AuthController` | `READY_FOR_REVIEW` | Không lập plan riêng theo yêu cầu của Thái |
| MOBILE-LOAN-001 | Product → preview → submit → theo dõi → Contract/consent | LN-003–LN-008 | `IN_PROGRESS` | [Plan](plans/MOBILE-LOAN-001-end-to-end.md) |
| MOBILE-EKYC-001 | Định danh điện tử: chụp CCCD mặt trước → mặt sau → kết quả (đã bỏ face/liveness theo yêu cầu của Thái 2026-08-22) | finora-user (ekyc-verify) | `DRAFT` | [Plan](plans/MOBILE-EKYC-001-ekyc-verification.md) |
| MOBILE-LOAN-002 | Gọi vốn, một hợp đồng nhiều bên và hai lượt ký | LN-009–LN-010 | `READY_FOR_REVIEW` | [Plan](plans/MOBILE-LOAN-002-funding-multi-party-contract.md) |
| MOBILE-LOAN-003 | Giải ngân, repayment, overdue, prepayment, settlement, restructuring | LN-011–LN-017 | `READY_FOR_REVIEW` — UI người vay đã build thành công ngày 2026-10-04 | [Plan](plans/MOBILE-LOAN-003-servicing-repayment.md) |
| MOBILE-INVESTOR-001 | Risk projection trên danh mục + thông báo servicing thật | Investment/Notification P5-B04 | `READY_FOR_REVIEW` — portfolio hiển thị DPD/nhóm nợ; notification list/count/read nối Gateway ngày 2026-10-04 | [Contract chung](../finora-platform/docs/integrations/CIC-RISK-NOTIFICATION.md) |
| MOBILE-INVESTOR-002 | Hồ sơ người vay (ẩn danh, không SHAP): thẻ tóm tắt trên màn khoản vay + màn "Hồ sơ người vay" | Loan `GET /investor/loan-applications/{n}/borrower-profile`; Investment trả `applicationNumber` | `READY_FOR_REVIEW` — Hải chốt ngày 2026-10-10: ẩn danh, đủ chỉ số | [Spec](../finora-platform/docs/superpowers/specs/2026-10-10-investor-borrower-profile-design.md) |

## Quy tắc đồng bộ về sau

Sau MOBILE-LOAN-001, không đợi toàn bộ Loan Service hoàn thành. Mỗi nhóm 1–2 LN backend liên quan đã sẵn sàng sẽ được lập plan, tích hợp web/mobile và kiểm thử end-to-end trước khi chuyển nhóm tiếp theo.

`MOBILE-INVESTOR-001` tuân theo UI portfolio/notification hiện tại của Hải: chỉ thêm trạng thái
rủi ro và nguồn API thật, không khôi phục screen cũ hoặc đổi cấu trúc điều hướng.
