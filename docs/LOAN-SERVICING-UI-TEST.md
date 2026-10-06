# Kiểm thử servicing, rủi ro CIC và thông báo bằng giao diện FINORA

## Phạm vi

Tài khoản người vay có thể kiểm thử trên mobile mà không cần Postman:

1. Xem khoản vay đã giải ngân và lịch trả nợ Fineract.
2. Thanh toán kỳ tới hoặc khắc phục nghĩa vụ quá hạn.
3. Trả trước một phần gốc, xem phí và xác nhận báo giá.
4. Tất toán trước hạn, xem đầy đủ gốc/lãi/phí/phạt trước khi xác nhận.
5. Gửi yêu cầu điều chỉnh kỳ hạn hoặc gia hạn; quản trị viên duyệt trên `finora-web`.
6. Nhà đầu tư theo dõi DPD, nhóm nợ và số tiền quá hạn trên đúng Note đang sở hữu.
7. Nhà đầu tư nhận, đọc và quản lý thông báo servicing thật từ Notification Service.
8. Hồ sơ vay mới phản ánh đúng trạng thái CIC hiện tại và giai đoạn phục hồi sau nợ xấu.

Các invariant không thể nhìn đủ trên UI như Kafka dedup, event đến sai thứ tự, ledger và quyền truy
cập chéo tài khoản phải lưu thêm evidence theo runbook backend
[`LOAN-SERVICING-E2E.md`](../../finora-platform/docs/testing/LOAN-SERVICING-E2E.md).

## Dịch vụ cần chạy

- `finora-loan` tại URL trong `EXPO_PUBLIC_API_URL`.
- `finora-payment` tại URL trong `EXPO_PUBLIC_PAYMENT_API_URL`.
- Fineract và database tương ứng.
- Kafka để phát sự kiện trả nợ; `finora-investment` để Note/danh mục nhà đầu tư nhận cập nhật.
- `cic-service`, `finora-ai` và worker chấm điểm để thử điều kiện nợ xấu/phục hồi.
- `finora-notification` và database Notification để thử danh sách, badge và trạng thái đã đọc.
- Gateway/User/Keycloak cho phiên đăng nhập thật.

Mobile không để `servicing`, `wallet`, `invest` hoặc `notification` trong
`EXPO_PUBLIC_MOCK_DOMAINS`. Miền `home` chỉ giả lập thẻ hoạt động tổng hợp chưa có API, không ảnh
hưởng các giao dịch tài chính. Cấu hình tối thiểu để thử các luồng trong tài liệu này:

```env
EXPO_PUBLIC_MOCK_DOMAINS=home
```

Sau khi đổi `.env`, phải khởi động lại Metro/Expo để bundle nhận biến mới.

## Dữ liệu đầu vào

- Hồ sơ đã hoàn tất gọi vốn, hai bên ký và giải ngân thành công.
- Loan projection có `loanNumber`, `applicationNumber` và Fineract loan ID.
- Ví người vay có số dư khả dụng đủ cho giao dịch định thực hiện.
- Muốn thử khắc phục quá hạn thì khoản vay phải thực sự có `overdueAmount > 0` từ Fineract.
- Có tài khoản nhà đầu tư đang sở hữu ít nhất một Note thuộc chính khoản vay thử nghiệm.
- JWT của người vay và nhà đầu tư phải là hai tài khoản khác nhau để kiểm tra cách ly dữ liệu.
- Các mốc DPD/risk cần fixture Fineract hoặc công cụ demo backend; UI không có quyền sửa tay DPD,
  nhóm nợ hay ngày phục hồi CIC.

## Đường đi trên giao diện

Mở **Hồ sơ → Khoản vay → chọn khoản vay**. Màn chi tiết hiển thị dư nợ, số quá hạn, kỳ tới và các nút:

- **Thanh toán kỳ tới** hoặc **Khắc phục quá hạn**: xác nhận đúng nghĩa vụ hiện tại.
- **Trả trước một phần gốc**: nhập phần gốc trả thêm → lập báo giá → xác nhận.
- **Tất toán toàn bộ trước hạn**: lập báo giá → kiểm tra các thành phần → xác nhận.
- **Lịch trả nợ từ Fineract**: kiểm tra lịch trước và sau giao dịch.
- **Đề nghị cơ cấu hoặc gia hạn**: chọn loại → nhập ngày/số kỳ/lý do → chấp nhận điều khoản → gửi.

Đường đi của nhà đầu tư:

- **Ví → Danh mục đầu tư**: mở Note đang sở hữu để quan sát cảnh báo quá hạn.
- **Trang chủ → biểu tượng chuông**: mở trung tâm thông báo, xem badge và đánh dấu đã đọc.

Đường đi của quản trị viên:

- **Vận hành khoản vay** trên `finora-web`: duyệt/từ chối cơ cấu, xem thu hồi, đối soát projection và
  replay event repayment chờ mapping.

## Kết quả cần quan sát

- Nút xác nhận khóa khi đang gửi; một lần bấm dùng một `Idempotency-Key` ổn định.
- Thanh toán hiển thị lần lượt trạng thái đã thu, đang ghi core, hoàn tất hoặc cần đối soát.
- Nếu cần đối soát, không bấm trả lại cùng nghĩa vụ; xử lý ở web quản trị.
- Sau `COMPLETED`, quay về chi tiết để mobile tải lại dư nợ và lịch từ Loan/Fineract.
- Với cơ cấu, trạng thái đầu tiên là **Chờ thẩm định**. Sau khi admin duyệt, worker cập nhật Fineract;
  mobile kéo làm mới để thấy **Đã áp dụng** và lịch mới.
- Nếu số dư không đủ, mobile chặn xác nhận trước khi gọi API thanh toán.
- Danh mục nhà đầu tư chỉ hiển thị dữ liệu risk từ Investment; mobile không tự tính DPD/nhóm nợ.
- Badge thông báo giảm sau khi đánh dấu đã đọc và quay lại Trang chủ.

## Test case và kết quả mong đợi

### TC01 — Xem khoản vay và lịch trả nợ

**Điều kiện:** hợp đồng đã giải ngân, Loan và Fineract đều đang hoạt động.

**Thao tác:** vào **Hồ sơ → Khoản vay → chọn khoản vay → Lịch trả nợ từ Fineract**.

**Mong đợi:**

- Khoản vay hiển thị `Đang trả nợ`, đúng dư nợ, kỳ tới và ngày đáo hạn.
- Lịch có đúng số kỳ và số tiền lấy từ Fineract, không dùng fixture mobile.
- `stale=false`; nếu Fineract không đọc được thì UI cảnh báo dữ liệu cũ và khóa nút trả tiền.

### TC02 — Trả đúng kỳ

**Điều kiện:** chưa quá hạn, ví người vay đủ `nextDueAmount`.

**Thao tác:** chọn **Thanh toán kỳ tới → Xác nhận thanh toán từ ví**.

**Mong đợi:**

- Mobile chỉ gửi một lệnh dù người dùng bấm nhanh nhiều lần.
- Trạng thái đi qua `Đã thu tiền → Đang ghi nhận vào khoản vay → Hoàn tất`.
- Ví người vay giảm đúng số tiền; Fineract có đúng một repayment transaction.
- Dư nợ/lịch kỳ tiếp theo thay đổi sau khi quay lại và làm mới.
- Kafka phát `RepaymentDistributed.v1`; phần gốc/lãi được phân phối cho Note nhà đầu tư.

### TC03 — Khắc phục quá hạn

**Điều kiện:** Fineract trả `overdueAmount > 0`, mobile hiển thị số ngày quá hạn.

**Thao tác:** chọn **Khắc phục quá hạn → Xác nhận thanh toán từ ví**.

**Mong đợi:**

- Nút dùng toàn bộ nghĩa vụ quá hạn hiện tại, không cho người dùng tự sửa sai số tiền.
- Sau `COMPLETED`, `overdueAmount=0`, `daysPastDue=0` và collection case chuyển `CURED`.
- Loan phát `LoanDelinquencyChanged.v1`; CIC mock thêm một phiên bản lịch sử mới.
- Nếu khoản vay trước đó là `DEFAULTED`, trả đủ quá hạn làm Loan quay lại `ACTIVE`.

### TC04 — Trả trước một phần gốc

**Điều kiện:** Product/Fineract V2 dùng `PROGRESSIVE`, advanced payment allocation và
`REAMORTIZATION`; ví đủ tổng báo giá.

**Thao tác:** nhập phần gốc trả thêm → **Lập báo giá → Xác nhận trả trước**.

**Mong đợi:**

- Báo giá hiển thị nghĩa vụ kỳ hiện tại, phần gốc trả thêm, phí và tổng trừ ví.
- Số nhập phải lớn hơn 0 và nhỏ hơn gốc còn lại; khoản V1 bị backend từ chối trước khi trừ ví.
- Sau `COMPLETED`, gốc giảm đúng phần trả thêm và lịch còn lại do Fineract tái phân bổ.
- Mobile không dựng lịch dự kiến giả trước khi core hoàn tất.

### TC05 — Tất toán trước hạn

**Điều kiện:** khoản vay còn dư nợ và ví đủ tổng báo giá.

**Thao tác:** **Tất toán toàn bộ trước hạn → Lập báo giá → Xác nhận tất toán**.

**Mong đợi:**

- Báo giá tách rõ gốc, lãi tới ngày tất toán, phí/phạt core và phí tất toán.
- Quote hết hạn/đã dùng hoặc ví thiếu tiền không được debit.
- Sau `COMPLETED`, `totalOutstanding=0`; Payment account, Loan và Note đóng idempotently.
- Mobile hiển thị khoản vay `Đã tất toán` và không còn nút trả nợ.

### TC06 — Cơ cấu hoặc gia hạn

**Điều kiện:** Loan ở `ACTIVE` hoặc `DEFAULTED`.

**Thao tác:** chọn loại đề nghị, nhập ngày/số kỳ/lý do, chấp nhận điều khoản và gửi; admin mở
**Vận hành khoản vay → Yêu cầu cơ cấu** trên web để duyệt hoặc từ chối.

**Mong đợi:**

- Trước duyệt: request là `Chờ thẩm định`, lịch cũ vẫn có hiệu lực.
- Từ chối: request là `Đã từ chối`, lịch và dư nợ không đổi.
- Duyệt: worker tạo/duyệt request trên Fineract; chỉ khi core thành công mới thành `Đã áp dụng`,
  phát `LoanRescheduled.v1` và mobile đọc được lịch mới.

### TC07 — Default/nợ xấu nội bộ

`DEFAULTED` là trạng thái tự động, không phải thao tác do người vay hoặc admin bấm:

| DPD từ Fineract | Nhóm nội bộ | Collection stage | Trạng thái Loan |
|---:|---:|---|---|
| 1–9 | 1 | `EARLY_REMINDER` | `ACTIVE` |
| 10–90 | 2 | `ATTENTION` | `ACTIVE` |
| 91–180 | 3 | `NPL` | `DEFAULTED` |
| 181–360 | 4 | `INTENSIVE` | `DEFAULTED` |
| Trên 360 | 5 | `LOSS` | `DEFAULTED` |

**Mong đợi khi DPD đạt 91:**

- Worker Loan đọc snapshot Fineract và tự chuyển khoản vay sang `DEFAULTED`.
- Mobile hiển thị `Nợ xấu`, số ngày/số tiền quá hạn; vẫn cho khắc phục quá hạn và gửi đề nghị cơ cấu.
- Web quản trị, tab **Quá hạn & thu hồi**, hiển thị stage `NPL`, nhóm 3 và cho ghi nhận hành động liên hệ.
- `LoanDelinquencyChanged.v1` được phát; CIC mock ghi phiên bản lịch sử với nhóm cao nhất tương ứng.
- Trả đủ quá hạn đưa DPD về 0, đóng collection case là `CURED` và Loan quay lại `ACTIVE`.

Không có API chỉnh tay DPD/debt group vì nguồn sự thật phải là Fineract. Để demo TC07 mà không chờ
91 ngày cần một fixture Fineract hoặc công cụ mô phỏng chỉ bật ở môi trường demo; công cụ đó chưa nằm
trong UI hiện tại.

**DPD không cộng số ngày của các lần trễ đã được khắc phục.** FINORA tính DPD từ ngày đến hạn cũ nhất
vẫn còn số tiền chưa trả trên lịch Fineract:

- Kỳ 1 trễ 5 ngày rồi trả đủ, DPD trở về 0; kỳ 2 sau đó trễ 10 ngày thì DPD hiện tại là 10, không phải 15.
- CIC mock ghi nhận hai lần trễ riêng và `soNgayTreDaiNhat=10`; không biến thành nhóm 3 chỉ vì cộng lịch sử.
- Nếu kỳ 1 chưa trả hết khi kỳ 2 đã quá hạn 10 ngày, DPD vẫn chạy từ ngày đến hạn của kỳ 1. Với lịch
  tháng, giá trị có thể khoảng 40 ngày tùy khoảng cách hai kỳ, không phải phép cộng 5 + 10.
- Khoản vay thông thường chỉ vào nhóm 3 theo mốc ngày khi DPD liên tục đạt 91; các trường hợp cơ cấu,
  miễn/giảm lãi, vi phạm hoặc phân loại định tính có thể bị xếp nhóm rủi ro cao sớm hơn.

### TC08 — Lỗi an toàn

- Ví thiếu tiền: nút xác nhận bị khóa, không tạo ledger.
- Quote hết hạn/đã dùng: backend từ chối, không debit lần hai.
- Mất kết nối sau khi core có thể đã nhận lệnh: trạng thái `Cần đối soát`; người dùng không trả lại.
- Projection stale: mobile khóa thao tác tài chính; admin đối soát lại trên web.
- Cùng `Idempotency-Key` và cùng body trả kết quả cũ; cùng key nhưng body khác bị từ chối.

### TC09 — Đồng bộ rủi ro sang danh mục nhà đầu tư

**Điều kiện:** nhà đầu tư sở hữu Note của khoản vay; Kafka, Loan và Investment đang chạy.

**Thao tác:** tạo snapshot quá hạn trên Fineract, chạy worker Loan, sau đó vào
**Ví → Danh mục đầu tư** và kéo làm mới.

**Mong đợi:**

- Đúng card khoản vay hiển thị `Quá hạn N ngày · Nhóm nợ G` và số tiền quá hạn.
- DPD 1–9 hiển thị nhóm 1; DPD 10–90 nhóm 2; DPD 91–180 nhóm 3; DPD 181–360 nhóm 4;
  trên 360 nhóm 5.
- DPD 10 là test biên bắt buộc: phải sang nhóm 2. DPD 91 phải sang nhóm 3 và cảnh báo mức cao.
- Event cũ hơn `riskDataAsOf` không được làm card quay về trạng thái cũ; kiểm tra này cần evidence
  Kafka/DB trong runbook backend.

Các mốc trên là benchmark nội bộ bám Điều 10
[Thông tư 31/2024/TT-NHNN](https://vbpl.vn/nganhangnhanuoc/Pages/vbpq-print.aspx?ItemID=168260);
FINORA demo không tự nhận là tổ chức tín dụng và không biến bảng này thành kết luận pháp lý cho mô
hình P2P.

### TC10 — Khắc phục quá hạn và lịch sử CIC

**Điều kiện:** khoản vay từng ở nhóm 3–5 và CIC đã nhận event nợ xấu.

**Thao tác:** người vay trả đủ nghĩa vụ quá hạn, chờ event cure, sau đó làm mới chi tiết khoản vay,
danh mục nhà đầu tư và trung tâm thông báo.

**Mong đợi:**

- Mobile người vay về DPD 0; collection case `CURED`; khoản vay từ `DEFAULTED` về `ACTIVE` nếu còn dư nợ.
- Cảnh báo quá hạn biến mất khỏi card danh mục, nhưng lịch sử Note/giao dịch không bị xóa.
- CIC tạo version mới: trả đủ quá hạn thì `nhomNoHienTai=1`, còn `nhomNoCaoNhat` giữ nhóm lớn nhất
  từng có. Nếu chỉ giảm xuống nhóm 2 nhưng vẫn còn quá hạn thì chưa được xem là cure toàn bộ khoản vay.
- CIC ghi `ngayKhacPhucNoXau`, `tamKhoaVayDen` và `thamDinhThuCongDen` theo policy cấu hình.
- Nhà đầu tư nhận đúng một thông báo **đã khắc phục quá hạn**.

### TC11 — Hồ sơ vay mới trong giai đoạn phục hồi CIC

Ca này quan sát kết quả trên UI nhưng cần chuẩn bị ngày CIC bằng fixture/backend, không chỉnh ngày từ
mobile.

| Dữ liệu CIC tại ngày chấm | Kết quả AI/Loan mong đợi | UI cần quan sát |
|---|---|---|
| `nhomNoHienTai >= 3` | `REJECTED`, lý do `CIC_CURRENT_BAD_DEBT` | Hồ sơ bị từ chối, không đi tiếp tới gọi vốn |
| Trước `tamKhoaVayDen` | `REJECTED`, lý do `CIC_BAD_DEBT_COOLDOWN` | Hồ sơ bị từ chối |
| Hết khóa nhưng trước `thamDinhThuCongDen` | `PENDING_REVIEW`, `CIC_BAD_DEBT_RECOVERY_REVIEW` | Hồ sơ chờ quản trị thẩm định |
| Có lịch sử nhưng thiếu nhóm hiện tại | `PENDING_REVIEW`, `CIC_CURRENT_GROUP_MISSING` | Không tự động phê duyệt |
| Hết giai đoạn phục hồi | Chấm bình thường | Lịch sử vẫn ảnh hưởng điểm, không còn hard-block |

Mặc định local là khóa 12 tháng và thẩm định thủ công đến tháng 24; đây là chính sách FINORA cấu hình
bằng env, không phải thời hạn cấm vay do pháp luật ấn định.

### TC12 — Thông báo servicing của nhà đầu tư

**Điều kiện:** bỏ `notification` khỏi mock domains; Notification Service, DB và Kafka đang chạy.

**Thao tác:** lần lượt phát sinh trả kỳ, DPD 1, chuyển nhóm 2/3, khắc phục, cơ cấu và tất toán; mỗi lần
mở **Trang chủ → chuông**.

**Mong đợi:**

- Trả kỳ tạo thông báo tiền về; DPD 1 tạo thông báo trong app nhưng không yêu cầu push ngoài app.
- Đổi nhóm, khắc phục, cơ cấu, tất toán và tất toán sớm tạo thông báo có cờ push ngoài app.
- Badge Trang chủ bằng số tin chưa đọc. Chạm một tin chưa đọc làm số trên màn giảm; quay về Trang chủ
  badge được tải lại.
- Giao lại cùng event Kafka không tạo thêm hàng. Một nhà đầu tư giữ nhiều Note của cùng loan vẫn chỉ
  có một thông báo cho cùng `sourceEventId + recipientId + type`.
- `externalPushRequired` mới là ý định bền vững; chưa mong đợi thông báo hệ điều hành khi chưa tích hợp
  device token và Expo/FCM/APNs.

### TC13 — Phân quyền thông báo

**Điều kiện:** có investor A và B; mỗi tài khoản có thông báo riêng.

**Thao tác:** đăng nhập A, mở danh sách/đánh dấu đã đọc; sau đó đăng nhập B và kiểm tra lại. Với kiểm
thử API bổ sung, dùng JWT A gọi `POST /notifications/{id-của-B}/read`.

**Mong đợi:**

- A chỉ thấy thông báo của A; B chỉ thấy thông báo của B.
- JWT A không đánh dấu được thông báo của B; bản ghi của B vẫn chưa đọc.
- Không có payload nhạy cảm như CCCD, OTP, email hoặc tài liệu hợp đồng trong event/thông báo.

### TC14 — Loading, empty, lỗi mạng và retry

- Tài khoản chưa có thông báo: màn chuông hiện **Chưa có thông báo**.
- Tài khoản chưa có Note: danh mục hiện **Chưa có Note nào**, vẫn giữ các lối tắt hợp lệ.
- Dừng Notification Service: màn thông báo hiện lỗi và cho thử lại; không hiện dữ liệu mock nếu domain
  đã bật thật.
- Dừng Investment Service: danh mục hiện lỗi và nút **Thử lại**, không dựng risk giả.
- Làm mạng chậm/offline: không treo vô hạn; sau khi dịch vụ trở lại, kéo làm mới tải được dữ liệu.
- Bấm nhanh nhiều lần vào tin chưa đọc chỉ gửi một thao tác đánh dấu trong lúc mutation đang chạy;
  nếu mutation lỗi, UI hiện thông báo và tin vẫn chưa đọc.

## Trạng thái tích hợp hiện tại

Loan, CIC mock và Investment đã consume `LoanDelinquencyChanged.v1`; Investment cập nhật risk read
model và phát `InvestorNoteServicingChanged.v1`; Notification lưu in-app notification có dedup. Schema,
consumer, API và UI đã nối local nhưng vẫn mang trạng thái `IMPLEMENTED_LOCAL_PENDING_FULL_E2E` cho tới
khi TC09–TC14 được chạy trên cùng bộ database/Kafka tích hợp.

Push hệ điều hành chưa thuộc acceptance hiện tại vì chưa có device token/provider receipt. Không đánh
dấu “push thành công” chỉ dựa trên `externalPushRequired=true`.

## Giới hạn quyền

Các thao tác duyệt cơ cấu, thu hồi nợ, đánh dấu default, đối soát và retry quarantine thuộc quản trị viên
trên `finora-web`; không đưa các quyền này vào ứng dụng người vay.
