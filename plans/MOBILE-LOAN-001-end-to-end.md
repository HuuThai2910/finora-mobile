---
task_id: MOBILE-LOAN-001
status: IN_PROGRESS
owner: Thai
approved_by: Thai
approved_at: 2026-08-09
backend_scope: LN-003, LN-004, LN-005, LN-006, LN-007, LN-008
ui_reference: ../../finora-platform/docs/ui/bản-đẹp.html
ui_reference_sha256: 4F8AC308B4614AADD3A756B18FC13DF66BB43015DAE77B940ED540376203743F
---

# MOBILE-LOAN-001 — Tích hợp luồng vay và Contract end-to-end

## Bản đọc nhanh theo nghiệp vụ

Borrower cần thực hiện được một luồng thật trên mobile:

```text
Xem sản phẩm đang hoạt động
→ chọn số tiền, kỳ hạn và ngày dự kiến giải ngân
→ xem lịch trả dự kiến do Fineract tính
→ điền thông tin tài chính tự khai và mục đích
→ xác nhận công bố lãi suất
→ nộp một lần để tạo hồ sơ SUBMITTED
→ Loan Service tự kiểm tra eligibility và gọi AI
→ theo dõi trạng thái hồ sơ
→ nếu AI policy tự duyệt hoặc admin duyệt, xem rõ lãi suất/lịch trả cuối
→ đọc Contract và lịch trả đã chốt
→ ký click-wrap hoặc từ chối Contract
```

Mobile không gọi AI để “chấm thử” trước khi nộp. Nút `Chấm điểm AI` trong HTML cũ được thay bằng bước **Xem lịch trả dự kiến** và **Nộp hồ sơ**; kết quả AI chính thức do Loan Service quản lý sau submit.

## 1. Nguồn sự thật

- Nghiệp vụ tổng thể: [`LOAN-SERVICE-DESIGN.md`](../../finora-platform/finora-loan/plans/LOAN-SERVICE-DESIGN.md).
- Product và preview: [`LN-003`](../../finora-platform/finora-loan/plans/LN-003-loan-product.md), [`LN-006`](../../finora-platform/finora-loan/plans/LN-006-fineract-product-schedule-integration.md).
- Application/profile/AI: [`LN-004`](../../finora-platform/finora-loan/plans/LN-004-loan-application.md), [`LN-005`](../../finora-platform/finora-loan/plans/LN-005-borrower-profile-kyc.md), [`LN-007`](../../finora-platform/finora-loan/plans/LN-007-credit-profile-ai-assessment.md).
- Contract/consent: [`LN-008`](../../finora-platform/finora-loan/plans/LN-008-approval-loan-contract.md).
- Visual: [`bản-đẹp.html`](../../finora-platform/docs/ui/bản-đẹp.html), chủ yếu `b-new`, `b-loan`, `b-sign`, `m-borrow`, `m-myloan`, `m-vento`.

Backend quyết định field, status và trình tự. HTML chỉ quyết định design token, bố cục, phân cấp thông tin và cách trình bày dễ hiểu.

## 2. Phạm vi

### Có làm

- Chuẩn hóa Loan API client, lỗi và cấu hình môi trường mobile.
- Quản lý server state bằng Redux Toolkit + RTK Query; Auth Context tiếp tục giữ session cục bộ cho tới khi có identity thật.
- Danh sách/chi tiết Product, mục đích và preview schedule bằng API thật.
- Form nộp Application trực tiếp, không tạo DRAFT backend.
- Danh sách/detail/history Application của borrower; withdraw đúng version.
- Poll trạng thái Application có giới hạn trong giai đoạn eligibility/scoring.
- Danh sách/detail/history Contract; ký `CLICK_WRAP_MVP` hoặc decline đúng version/hash.
- Loading/empty/error/success, offline/network timeout, idempotency và version conflict.
- Refactor feature Loan theo `components/hooks/api/types/mappers/screens/schemas`.

### Không làm

- Gọi trực tiếp `finora-ai`, Fineract hoặc database.
- Cho borrower xem assessment chi tiết, grade hoặc suggested rate vì backend không công bố borrower API cho dữ liệu này.
- Gọi vốn, giải ngân, lịch trả nợ vận hành, ví, overdue, tất toán sớm và tái cơ cấu vì LN-009 trở đi chưa có API thật.
- SmartCA; LN-008 chỉ là click-wrap consent.
- Auth/eKYC thật; mock provider hiện tại chỉ phục vụ tích hợp local và phải thay trước demo dùng chung/production.

## 3. Các sai lệch hiện tại phải sửa

| Mã | Hiện trạng code | Vì sao sai | Hướng xử lý |
|---|---|---|---|
| MOB-OLD-01 | Đã xóa direct AI ngày 2026-08-09 | Không còn chấm trùng hoặc vượt service boundary | Màn bước 2 chỉ xác nhận và submit sang Loan; Loan tự chấm |
| MOB-OLD-02 | Đã sửa history thành `PageResponse` | Contract khớp backend | API slice giữ page/size/totalElements |
| MOB-OLD-03 | Đã bổ sung `APPROVED` | UI hiểu kết quả LN-008 | Nhãn hướng borrower sang Contract |
| MOB-OLD-04 | Đã có Contract summary/detail/history/action thật | Đủ number, version, document/hash, expiry | Ký click-wrap gửi đúng version/hash |
| MOB-OLD-05 | Hợp đồng vay không còn dùng mock signature | Không trộn Contract thật với fixture cũ | `signature` chỉ còn thuộc hợp đồng đầu tư demo; servicing vẫn mock/ẩn |
| AUTH-01 | Borrower ID do Loan Service hardcode | Chưa phải tài khoản đăng nhập trên mobile | Giữ giới hạn local; identity thật thuộc LN-002/User integration |

## 4. Screen và navigation mục tiêu

| Screen | Mục đích | UI tham chiếu | API chính |
|---|---|---|---|
| `ProductListScreen` | Xem Product ACTIVE | `m-vento`, `b-new` | GET products |
| `ProductDetailScreen` | Điều khoản, amount/term hợp lệ | `m-vento` | GET product detail |
| `SchedulePreviewScreen` | Nhập amount/term/date và xem schedule | `b-new`, `m-borrow` | POST repayment preview |
| `ApplyFormScreen` | Thông tin tự khai, purpose, disclosure và submit | `b-new`, `m-borrow` | GET purposes, POST application |
| `MyApplicationsScreen` | Danh sách hồ sơ của tôi | `b-loan`, `m-myloan` | GET applications/me |
| `ApplicationDetailScreen` | Snapshot, timeline, withdraw và trạng thái | `m-myloan` | GET detail/history/withdraw |
| `MyContractsScreen` | Danh sách Contract | `b-sign`, `m-borrow` | GET contracts/me |
| `ContractDetailScreen` | Tóm tắt, mở/lưu PDF và xác nhận ký hoặc từ chối ngay trên một màn | `b-sign`, `m-borrow` | GET contract detail/history/document; POST sign/decline |

Không hiển thị funded percent, investor count, disbursed balance hoặc repayment progress từ mock như dữ liệu thật trong MOBILE-LOAN-001.

## 5. Luồng tạo hồ sơ

Luồng UI được chia thành ba màn rõ ràng và mỗi dữ liệu chỉ được nhập một lần:

```text
Bước 1 — Chọn khoản vay
amount + term + ngày giải ngân dự kiến
        ↓
Bước 2 — Kiểm tra lịch trả dự kiến
Loan Service/Fineract trả preview; người dùng chỉ đọc và tiếp tục
        ↓
Bước 3 — Hoàn thiện hồ sơ
mục đích + tài chính tự khai + xác nhận điều khoản + submit
```

Ở bước 3, Product, amount, term, rate và ngày giải ngân chỉ hiển thị dạng tóm tắt để người dùng
đối chiếu. Muốn thay đổi phải quay lại bước 1; không tạo bộ input amount/term thứ hai.

### 5.1. Chọn Product và preview

1. Tải Product ACTIVE có phân trang.
2. Chọn Product và đọc `rateNotice`; hiển thị rõ base rate dùng cho lịch ban đầu và khung
   `min/max` có thể áp dụng sau đánh giá, không gọi chung tất cả là “lãi suất cố định”.
3. Nhập amount trong `[minAmount,maxAmount]`, term trong `[minTermMonths,maxTermMonths]` và ngày hiện tại/tương lai.
4. Chỉ gọi preview khi người dùng bấm xem hoặc sau debounce có chủ đích; không gọi mỗi ký tự.
5. Hiển thị first/max installment, tổng gốc/lãi/phí, total repayment và từng kỳ.
6. Giữ `calculationPolicyVersion` để giải thích nguồn tính nhưng không dùng preview client làm dữ liệu chính thức khi submit; backend tính và snapshot lại.

### 5.2. Form và submit

Các field người dùng nhìn thấy:

| Field | Tác dụng trong luồng |
|---|---|
| `loanProductId` | Chọn bộ điều khoản đã được admin kích hoạt/Fineract mapping |
| `requestedAmount` | Số tiền đề nghị vay; backend kiểm tra theo Product |
| `requestedTermMonths` | Kỳ hạn borrower chọn trong phạm vi Product |
| `purposeCode` | Mục đích chuẩn hóa do `/loan-purposes` cung cấp để backend/AI mapping nhất quán |
| `purposeDetail` | Giải thích thêm khi purpose yêu cầu |
| `declaredMonthlyIncome` | Thu nhập tự khai để tính snapshot tài chính/AI |
| `employmentLengthMonths` | Thâm niên tự khai; cho phép bỏ trống theo backend |
| `educationLevel` | Trình độ tự khai; cho phép bỏ trống theo backend |
| `homeOwnership` | Tình trạng nhà ở bắt buộc |
| `monthlyDebtObligations` | Nghĩa vụ nợ hàng tháng để backend tính DTI |
| `expectedDisbursementDate` | Mốc Fineract dùng tính preview/snapshot |
| `pricingDisclosureVersion` | Chứng minh borrower đã đọc đúng bản công bố lãi suất |
| `pricingDisclosureAccepted` | Phải được người dùng chủ động xác nhận trước submit |

`requestedAmount`, `requestedTermMonths` và `expectedDisbursementDate` được lấy từ lựa chọn bước 1,
truyền qua bước preview và map vào request ở bước 3. Chúng không được nhập lại trong form tài chính.

1. Form state ở React Hook Form/schema, không đưa từng input vào Redux.
2. Khi người dùng bấm submit, tạo một idempotency key và khóa nút.
3. Nếu timeout chưa rõ kết quả, retry cùng ý định phải giữ key cũ.
4. Response `201` là Application đã tạo; điều hướng đến detail/timeline.
5. Không gọi AI thêm từ mobile.

## 6. Theo dõi Application

- List `/loan-applications/me?page&size`, không tải cố định 50 phần tử rồi bỏ pagination.
- Detail dùng `applicationNumber`, không dùng database ID.
- History là `PageResponse`, sắp xếp theo response contract chứ không tự đoán.
- Poll detail khi status thuộc `SUBMITTED`, `ELIGIBILITY_PENDING`, `SCORING`, `SCORING_RETRY_PENDING`.
- Dừng poll khi `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `WITHDRAWN`, khi app background hoặc hết 60 giây.
- `PENDING_REVIEW` nghĩa là đang chờ admin, không phải lỗi.
- Borrower chỉ withdraw khi backend cho phép và phải gửi version mới nhất cùng reason tùy chọn.

## 7. Contract và consent

1. Khi Application `APPROVED`, hiển thị lời nhắc kiểm tra Contract; không tự coi approve là đã ký.
2. List `/loan-contracts/me` và mở detail bằng `contractNumber`.
3. Màn chi tiết chỉ hiển thị số tiền, kỳ hạn, lãi suất, trạng thái và hạn xác nhận; tổng nghĩa vụ/lịch từng kỳ nằm trong PDF để không lặp số liệu.
4. Nút xem nội dung mở thẳng `pdfDocument.downloadPath` do Loan trả, không đi qua màn metadata và không render lại `documentContent` thành PDF cục bộ. Contract legacy thiếu PDF được báo rõ và không giả tạo artifact mới trên thiết bị.
5. Sau khi mở PDF thành công, khối ký/từ chối xuất hiện ngay dưới khu vực tài liệu trên cùng màn chi tiết. Trạng thái đã xem gắn với `pdfDocument.contentHash`; artifact đổi thì phải mở lại.
6. Chỉ cho ký khi status `PENDING_SIGNATURE`, chưa hết hạn, có PDF server và người dùng đã mở đúng PDF hiện hành.
7. Trước khi ký, người dùng tick xác nhận; gửi đúng `version`, `documentHash`, `pdfDocumentHash`, `CLICK_WRAP_MVP` và idempotency key.
8. Không tự băm lại một phiên bản text đã render khác backend. Hash request lấy từ Contract detail đang được người dùng chấp thuận.
9. Decline gửi version, reason code và detail khi `OTHER`; không xóa Application đã APPROVED.
10. Sau action, invalidate Contract list/detail và Application detail liên quan.
11. Trên màn tóm tắt, chỉ so sánh base/final rate và giải thích quyền từ chối; kỳ trả/tổng lãi/tổng phải trả đọc trong PDF.
    Chỉ giải thích đây là kết quả đánh giá tín dụng; không công khai grade hoặc chi tiết mô hình cho borrower.
12. Phiên bản/hash chỉ nằm trong mục đối chiếu kỹ thuật thu gọn của khối xác nhận, không tạo một màn riêng và không hiển thị dung lượng như thông tin nghiệp vụ. Sau ký, detail chuyển sang `SIGNED_RECEIPT`.
13. Hồ sơ `APPROVED` phải ghép với Contract theo `applicationNumber` để hiển thị giai đoạn hiện tại.
    Không được tiếp tục ghi “chờ ký” khi Contract đã `SIGNED`, `DECLINED`, `EXPIRED` hoặc `EFFECTIVE`.

## 8. API contract sử dụng

| Method | Endpoint | Mục đích | Điểm bắt buộc |
|---|---|---|---|
| GET | `/api/v1/loan-products` | Product ACTIVE | PageResponse |
| GET | `/api/v1/loan-products/{id}` | Product detail | Chỉ ACTIVE |
| GET | `/api/v1/loan-purposes` | Purpose chuẩn hóa | Dùng code, label và requiresDetail |
| POST | `/api/v1/loan-products/{id}/repayment-previews` | Schedule dự kiến | amount/term/date |
| POST | `/api/v1/loan-applications` | Submit trực tiếp | Idempotency-Key, response 201 |
| GET | `/api/v1/loan-applications/me` | Danh sách của tôi | page/size |
| GET | `/api/v1/loan-applications/{number}` | Application detail | Borrower ownership |
| GET | `/api/v1/loan-applications/{number}/history` | Timeline | PageResponse |
| POST | `/api/v1/loan-applications/{number}/withdraw` | Rút hồ sơ | version + reason |
| GET | `/api/v1/loan-contracts/me` | Contract list | PageResponse |
| GET | `/api/v1/loan-contracts/{number}` | Contract detail | document/hash/schedule/version |
| GET | `/api/v1/loan-contracts/{number}/document` | PDF hợp đồng hiện hành | Bytes bất biến + ETag SHA-256 |
| GET | `/api/v1/loan-contracts/{number}/history` | Contract timeline | PageResponse |
| POST | `/api/v1/loan-contracts/{number}/sign` | Click-wrap consent | Idempotency-Key + version + text/PDF hash |
| POST | `/api/v1/loan-contracts/{number}/decline` | Không chấp nhận | Idempotency-Key + version + reason |

## 9. State, cache và hiệu năng

- Một Redux store; RTK Query quản lý Product/Application/Contract server state.
- Auth Context hiện tại chỉ giữ session/eKYC mock, không chứa danh sách nghiệp vụ.
- Tag tối thiểu: `LoanProduct`, `LoanApplication`, `LoanApplicationList`, `LoanContract`, `LoanContractList`.
- Form state giữ local; draft chỉ persist nếu người dùng thật sự đi qua nhiều screen và phải khôi phục sau khi app đóng.
- Poll dừng khi AppState background; foreground refetch một lần có kiểm soát.
- Danh sách dùng `FlatList`, pagination và key bằng public number/id ổn định.
- Không dùng `JSON.stringify(body)` làm dependency cho hook gọi AI; luồng AI trực tiếp bị loại bỏ.

## 10. Mapping trạng thái

| Backend | Nhãn người dùng |
|---|---|
| `SUBMITTED` | Đã nộp hồ sơ |
| `ELIGIBILITY_PENDING` | Đang kiểm tra điều kiện |
| `SCORING` | Hệ thống đang đánh giá hồ sơ |
| `SCORING_RETRY_PENDING` | Hệ thống sẽ đánh giá lại |
| `PENDING_REVIEW` | Đang chờ chuyên viên thẩm định |
| `APPROVED` | Hồ sơ đã được duyệt — kiểm tra hợp đồng |
| `REJECTED` | Hồ sơ chưa được chấp thuận |
| `WITHDRAWN` | Bạn đã rút hồ sơ |
| Contract `PENDING_SIGNATURE` | Chờ bạn đọc và ký |
| `SIGNED` | Bạn đã ký hợp đồng |
| `DECLINED` | Bạn đã từ chối hợp đồng |
| `EXPIRED` | Hợp đồng đã hết hạn |
| `EFFECTIVE/COMPLETED` | Chỉ hiển thị khi backend thật sự trả; thuộc luồng sau |

Không hiển thị chi tiết failure code AI cho borrower. Chỉ diễn đạt tiến trình và kết quả Application mà backend cho phép.

## 11. Cấu trúc code dự kiến

```text
src/
├── app/
│   ├── store.ts
│   └── providers.tsx
├── lib/api/
│   ├── baseQuery.ts
│   ├── errors.ts
│   └── idempotency.ts
└── features/
    ├── products/
    │   ├── api/
    │   ├── components/
    │   ├── hooks/
    │   ├── screens/
    │   └── types/
    └── applications/
        ├── api/
        ├── components/
        ├── hooks/
        ├── mappers/
        ├── schemas/
        ├── screens/
        └── types/
```

- Contract có thể là module con của `applications` trong phạm vi hiện tại; chỉ tách feature riêng nếu số screen/use case tăng.
- Di chuyển dần từ `component`, `hook`, `constant.ts`; không mass-rename feature khác.
- Comment tiếng Việt tại submit/idempotency, status polling, AppState cleanup, version conflict và contract hash.

## 12. Failure path bắt buộc

- Thiết bị offline, DNS/timeout và backend 5xx.
- `localhost` không truy cập được từ thiết bị thật: cấu hình API URL theo emulator/LAN, không hardcode trong component.
- Fineract unavailable khi preview: giữ nguyên amount/term/date, hiển thị thông điệp nghiệp vụ và một nút thử lại;
  không tự submit Application, không tự tính lịch thay thế và không retry dồn dập khi request còn chạy.
- Product vừa bị deactivate trước submit.
- Pricing disclosure version không khớp backend.
- Submit timeout nhưng backend đã tạo Application; retry không tạo duplicate.
- Validation field, eligibility fail hoặc Application reject.
- Version conflict khi withdraw/sign/decline.
- Contract hết hạn hoặc document hash/version đã đổi trước khi ký.
- App background trong lúc poll hoặc mutation phản hồi chậm.

## 13. Kiểm thử

### Unit/component

- Mapper DTO/status và formatter tiền/ngày.
- Validation amount/term/date, purpose detail, income/debt và disclosure.
- Submit khóa nút, idempotency giữ nguyên khi retry cùng ý định.
- History dùng PageResponse.
- Poll Application dừng terminal/background/unmount/timeout.
- Contract sign gửi đúng version/hash/method; decline validate reason.
- Application/Contract hiển thị toàn bộ `periods` đã snapshot, không cắt còn vài kỳ và không tự tính lại.
- Loading/empty/error/success/offline và unknown status.

### Integration thủ công

1. Chạy Loan Service bằng actor borrower; Product đã ACTIVE và core sync thành công.
2. Mobile load Product/Purpose, preview schedule.
3. Submit Application và kiểm tra detail/timeline chuyển trạng thái.
4. Chuyển backend instance/admin flow để duyệt hồ sơ trong môi trường mock hiện tại.
5. Quay lại borrower instance, list Contract, đọc detail và ký.
6. Tạo hồ sơ khác để thử decline và withdraw hợp lệ.
7. Tắt mạng/Fineract/AI theo fixture để kiểm tra lỗi và trạng thái chờ.

Do actor đang cấu hình cứng, test admin và borrower có thể cần restart Loan Service hoặc hai cấu hình local riêng; đây là giới hạn tạm của LN-002, không được che trong UI.

## 14. Acceptance criteria

- [ ] Visual bám `bản-đẹp.html` nhưng luồng nghiệp vụ khớp LN-003–LN-008.
- [ ] Mobile không còn gọi trực tiếp AI/Fineract.
- [ ] Borrower chọn được Product, amount, term và xem preview thật.
- [ ] Submit tạo đúng một Application và giữ idempotency khi retry.
- [ ] Status có đủ `APPROVED` và UI không nhầm trạng thái chờ với lỗi.
- [ ] Application history dùng pagination đúng contract.
- [ ] Borrower đọc được Contract thật và ký/decline bằng version/hash mới nhất.
- [ ] Borrower mở/lưu/chia sẻ đúng PDF server; request ký mang cả hash PDF đang xem.
- [ ] Home, danh sách và chi tiết hồ sơ hiển thị đúng trạng thái Contract sau khi ký/từ chối/hết hạn.
- [ ] Khi điều khoản đổi, borrower thấy rõ base/final rate và hai lịch trước khi ký hoặc từ chối.
- [ ] Không hiển thị funded/disbursement/repayment/SmartCA mock như chức năng thật.
- [ ] Danh sách dùng FlatList; polling dừng khi background/terminal.
- [ ] Logic khó có comment tiếng Việt; file tuân thủ ngưỡng trách nhiệm.
- [ ] Type-check, test và checklist frontend đều đạt.

## 15. Điều kiện bắt đầu và bàn giao

Chỉ bắt đầu code khi Thái đổi `status: APPROVED`, điền `approved_by: Thai` và ngày duyệt. Khi code/test xong, agent chuyển `READY_FOR_REVIEW`, ghi file thực tế, lệnh kiểm tra, kết quả từng AC và known limitation. Chỉ Thái chuyển `ACCEPTED`.

## 16. Tiến độ triển khai ngày 2026-08-09

Đã hoàn thành trong lượt tích hợp đầu:

- Redux Toolkit/RTK Query store và API slice cho Product/Application/Contract;
- Product hooks đọc catalog thật qua cache chung;
- loại bỏ `EXPO_PUBLIC_AI_API_URL`, `aiFetch`, `scoreCredit` và màn điểm AI sơ bộ;
- màn xác nhận giữ ổn định Idempotency-Key khi retry và submit sang Loan Service;
- status `APPROVED`, Application history `PageResponse`, Contract DTO thật và ký click-wrap bằng version/hash;
- `npx tsc --noEmit` đạt.

Cập nhật luồng hồ sơ borrower ngày 2026-08-09:

- mục “Hồ sơ vay của tôi” mở danh sách `GET /loan-applications/me` và detail thật theo
  `applicationNumber`, không còn mở fixture tiến độ gọi vốn;
- detail hiển thị snapshot đề nghị vay, tài chính tự khai, lịch trả dự kiến lúc nộp và lịch sử xử lý
  từ Loan API bằng nhãn tiếng Việt;
- xóa các screen hồ sơ giả lập đã hiển thị kỳ `PAID`, tiến độ gọi vốn, tất toán và tái cơ cấu như dữ liệu thật;
- mục lịch trả sau giải ngân được khóa và ghi “Sắp triển khai” cho tới khi LN servicing có endpoint;
- trang chủ dùng hồ sơ mới nhất từ Loan API thay cho fixture “đã trả x/y kỳ”; mobile không gọi trực tiếp AI
  và đã bỏ biến môi trường AI URL không còn sử dụng;
- danh sách hiện tải page đầu 20 hồ sơ; load-more/pagination UI vẫn thuộc phần còn phải hoàn thiện.

Cập nhật form nộp hồ sơ ba bước ngày 2026-08-09:

- bước 1 dùng bộ chọn tiền/kỳ hạn, các mốc chọn nhanh và ngày giải ngân dự kiến theo màu sắc FINORA;
- bước 2 gọi repayment preview bằng đúng amount/term/date vừa chọn và hiển thị tổng trả, tổng lãi,
  kỳ đầu/kỳ cao nhất cùng toàn bộ các kỳ backend trả về;
- bước 3 chỉ nhập mục đích và dữ liệu tài chính; amount/term/rate/date là bản tóm tắt không chỉnh sửa;
- xóa route/màn `ScoringResult` cũ để tránh tạo bước thứ tư và bỏ hoàn toàn nút “Chấm điểm AI” phía mobile;
- nút `Nộp hồ sơ` gọi thẳng Loan API với Idempotency-Key ổn định; sau khi thành công có thể mở ngay detail thật.

Cập nhật lịch trả và Contract ngày 2026-08-09:

- preview và Application detail hiển thị đầy đủ mọi kỳ backend trả về, gồm gốc, lãi, phí, phạt,
  tổng đến hạn và dư nợ còn lại;
- thêm “Hợp đồng vay của tôi”, danh sách Contract, detail nội dung/hash/lịch trả và lịch sử trạng thái;
- hồ sơ `APPROVED` có nút sang luồng hợp đồng; borrower ký click-wrap bằng đúng version/hash hoặc
  từ chối với reason code và Idempotency-Key;
- route Contract được đặt trong tab Hồ sơ thay vì Sàn.

Cập nhật khả năng đọc hợp đồng ngày 2026-08-09:

- nội dung chính không còn làm nổi bật chuỗi SHA-256; hash, terms version và document version được thu gọn trong mục đối chiếu kỹ thuật;
- Contract V1 hiện có được diễn giải thành điều khoản tiếng Việt nhưng vẫn giữ nguyên văn bản gốc có thể mở; Contract V2 mới hiển thị nguyên văn tài liệu tiếng Việt đã được backend băm;
- Application detail và Contract detail đều render toàn bộ `periods`; nếu Loan Service cũ chưa trả field này, mobile báo rõ thiếu dữ liệu thay vì khiến borrower hiểu nhầm “kỳ cao nhất” là toàn bộ lịch.

Cập nhật phục hồi Fineract ngày 2026-08-10:

- lỗi `CORE_LENDING_UNAVAILABLE` được đổi thành thông báo dễ hiểu: hệ thống đang chuẩn bị lịch trả và người dùng
  có thể thử lại sau khoảng 30 giây;
- màn preview giữ nguyên lựa chọn khoản vay khi lỗi, không đưa mã Fineract/circuit breaker lên UI.

Còn phải hoàn thiện trước khi đổi `READY_FOR_REVIEW`: load-more cho danh sách Application/Contract,
withdraw UI, polling theo AppState, component test và kiểm thử end-to-end trên emulator/thiết bị.

## 17. Đồng bộ định giá rủi ro ngày 2026-09-05

- Catalog và màn chọn khoản vay phân biệt lãi suất cơ sở với khung `min/max`.
- Hồ sơ `APPROVED` dùng `finalAnnualInterestRate` và `finalCalculationSnapshot`; các trạng thái trước
  quyết định vẫn dùng snapshot lúc nộp để không công bố sớm điều khoản chưa được duyệt.
- Màn hợp đồng đọc thêm Application cùng borrower để giải thích thay đổi lãi suất; lỗi tải phần giải thích
  không chặn việc đọc Contract thật.
- Nội dung hợp đồng V2 tiếp tục hiển thị dạng tài liệu tiếng Việt; hash/version nằm trong vùng đối chiếu
  kỹ thuật và không cạnh tranh với điều khoản chính.
- Hash visual reference được cập nhật theo file hiện có; không thay design token toàn cục.
- Căn cứ nghiệp vụ/pháp lý của trần lãi suất và nghĩa vụ công khai được đối chiếu tại
  [`LEGAL-COMPLIANCE.md`](../../finora-platform/docs/LEGAL-COMPLIANCE.md); mobile chỉ giải thích điều khoản Loan
  đã chốt cho borrower, không tự tính lại lãi suất hoặc lịch trả.

## 18. Bằng chứng kiểm tra tương thích ngày 2026-09-05

- `npx.cmd tsc --noEmit` và `npx.cmd expo export --platform android`: đạt; contract TypeScript,
  import và asset đều bundle được với response Loan hiện tại. Thư mục export tạm đã được xóa sau kiểm tra.
- Luồng API thật đã xác nhận hồ sơ hạng C giữ lịch ban đầu 12,5%, nhận lịch cuối 13% đủ 24 kỳ,
  tạo Contract `CLICK_WRAP_TEXT_V2` và ký thành công bằng `CLICK_WRAP_MVP` với đúng version/hash.
- Cấu hình AI tạm dùng để ép nhánh manual review đã được hoàn nguyên về
  `auto_approve=75`, `auto_reject=65` ngay sau kiểm thử.
- Chưa đánh dấu kiểm thử thiết bị đạt; cần mở hồ sơ `LA-939518AC4CE245BDAB58` và Contract
  `LC-1F8F7D58ADDC43A2BECD` trên Expo để xác nhận scroll, vùng an toàn và kích thước chữ thực tế.

## 19. PDF hợp đồng và trạng thái sau ký (cập nhật 2026-09-07)

- Tách toàn văn khỏi màn tóm tắt Contract thành PDF A4 phía server; nút tại `ContractDetailScreen` mở
  thẳng tài liệu và khối consent xuất hiện ngay bên dưới sau khi borrower đã mở đúng PDF hiện hành.
- Bỏ `expo-print` và renderer HTML cục bộ. Loan Service sinh/lưu PDF `SIGNABLE`; mobile mở endpoint và
  dùng `expo-file-system` + `expo-sharing` để lưu/chia sẻ đúng bytes server.
- Request ký mang thêm `pdfDocumentHash`; sau ký Loan trả metadata `SIGNED_RECEIPT`, nên trạng thái và
  bằng chứng trên màn tài liệu đổi theo dữ liệu thật thay vì nhãn “chờ ký” cố định.
- Contract đã ký hiển thị dấu vết xác nhận điện tử gồm actor, thời gian và phương thức click-wrap; không
  vẽ chữ ký tay hoặc gọi click-wrap là chữ ký số SmartCA.
- Application vẫn giữ state nguồn chuẩn `APPROVED`. Mobile batch-load tối đa một page Contract rồi ghép
  theo `applicationNumber`; không gọi một request cho từng thẻ và không tạo N+1.
- Home, danh sách hồ sơ và chi tiết hồ sơ dùng Contract status khi đã có Contract; nút hành động đổi theo
  `PENDING_SIGNATURE/SIGNED/DECLINED/EXPIRED/EFFECTIVE/COMPLETED`.
- Loại bỏ hai route trung gian `ContractDocument` và `ContractConsent`; không còn màn chỉ để trình bày
  phiên bản/dung lượng hoặc bắt borrower chuyển màn sau khi đọc PDF.
- `ContractDetailScreen` giữ thẻ hợp đồng điện tử, trạng thái/hạn, so sánh base/final rate, hành động
  mở/lưu PDF và consent inline; toàn văn, tổng phải trả và lịch từng kỳ chỉ nằm trong PDF A4.
- Trạng thái đã mở được lưu cục bộ theo SHA-256 của artifact. Refetch ra hash khác sẽ khóa consent cho
  tới khi borrower mở lại, tránh ký nhầm phiên bản dù vẫn đang ở cùng màn.
- Kiểm tra kỹ thuật ngày 2026-09-07: `npx.cmd tsc --noEmit` và
  `npx.cmd expo export --platform android --output-dir .expo-contract-check` đều đạt; Android bundle
  thành công với 1.152 module và thư mục export tạm đã được xóa sau kiểm tra.
- Kiểm thử thao tác mở/lưu/chia sẻ PDF và consent bằng hash trên emulator/thiết bị thật vẫn cần thực hiện
  cùng Loan Service đã chạy migration V9.
