# Quy chuẩn kỹ thuật frontend FINORA

## Mục lục

1. Nguồn sự thật và phạm vi
2. Cấu trúc theo feature
3. Kích thước và trách nhiệm
4. State và hiệu năng
5. API và luồng bất đồng bộ
6. TypeScript, form và dữ liệu
7. Hook và comment
8. UI/UX, accessibility và responsive
9. Bảo mật
10. Kiểm thử và điều kiện hoàn thành
11. Quy tắc riêng cho mobile
12. Lập plan tích hợp frontend

## 1. Nguồn sự thật và phạm vi

- Backend contract và tài liệu nghiệp vụ đã được phê duyệt là nguồn sự thật cho field, status, quyền và chuyển trạng thái.
- Nguồn giao diện tham chiếu hiện tại là `../finora-platform/docs/ui/bản-đẹp.html` tính từ root repository trong workspace đầy đủ; SHA-256 của bản đã duyệt ngày 2026-08-09 là `790FCE4FDEC49AF672FA56F6EB9FD7E314E2A1A3B850BC71A833B0E19FE6F224`.
- `bản-đẹp.html` chỉ là nguồn về design token, bố cục, phân cấp thông tin, thành phần và cách diễn đạt trực quan; không phải nguồn sự thật nghiệp vụ.
- Không sao chép dữ liệu mock, endpoint, status, công thức hoặc luồng cũ từ HTML. Khi HTML khác backend contract/LN đã duyệt, giữ ý tưởng trình bày nhưng sửa hành vi theo backend.
- Nếu không có đúng file hoặc hash đã thay đổi, phải báo lại và xác nhận phiên bản tham chiếu trước khi đổi design system diện rộng.
- Frontend không tự tính lại kết quả AI, quyết định tín dụng, lãi suất chính thức hay lịch trả nợ chính thức.
- Frontend chỉ gọi API qua Gateway/backend công khai. Không gọi trực tiếp AI Service, Fineract hoặc database.
- Khi contract chưa có, đánh dấu mock rõ ràng và tập trung mock tại lớp API; không rải fallback giả trong component.

## 2. Cấu trúc theo feature

Cấu trúc đích cho feature mới hoặc feature được refactor đáng kể:

```text
src/features/<feature>/
├── api/             # Endpoint, request/response transport
├── components/      # Thành phần giao diện thuộc feature
├── hooks/           # Điều phối state và use case phía UI
├── mappers/         # Chuyển API model sang UI/form model
├── screens/         # Màn hình điều hướng trên mobile
├── schemas/         # Validation form
├── types/           # Type thuộc feature
├── constants/       # Hằng số nghiệp vụ/hiển thị
└── index.ts         # Public API tối thiểu của feature
```

- Dùng tên thư mục số nhiều: `components`, `hooks`, `types`, `constants`.
- Screen chỉ điều phối dữ liệu, quyền, trạng thái màn hình và ghép component.
- Component dùng chung toàn ứng dụng nằm trong `src/components`; component chỉ dùng trong một feature ở lại feature đó.
- `src/lib` chỉ chứa hạ tầng dùng chung như HTTP client, secure storage, date/currency adapter; không chứa nghiệp vụ Loan.
- Không import internals của feature khác. Chỉ dùng public export nếu thực sự cần chia sẻ.
- Không tạo file barrel `index.ts` xuất toàn bộ nội bộ; chỉ xuất phần được xem là public.
- Không đổi tên hàng loạt cấu trúc cũ ngoài phạm vi. Khi chạm vào feature cũ, cải thiện dần và giữ type-check xanh.

## 3. Kích thước và trách nhiệm

Các ngưỡng là tín hiệu review, không phải lý do duy nhất để tách file:

| Thành phần | Mục tiêu | Phải xem xét tách |
|---|---:|---:|
| Screen/container | <= 250 dòng | > 350 dòng |
| Component tái sử dụng | <= 200 dòng | > 300 dòng |
| Custom hook | <= 150 dòng | > 200 dòng |
| Hàm | <= 60 dòng | > 100 dòng |

Phải tách dù chưa vượt ngưỡng khi file có từ hai trách nhiệm lớn trở lên, ví dụ vừa gọi API, mapping, validation và render form/danh sách lớn.

- Không tách thành nhiều component một lần dùng nếu việc tách làm luồng đọc khó hơn.
- Đặt `max-lines`, `max-lines-per-function` và `complexity` ở mức cảnh báo khi ESLint được thiết lập.
- Không bỏ qua cảnh báo bằng disable comment nếu chưa ghi lý do cụ thể.

## 4. State và hiệu năng

Chọn công cụ theo loại state:

| Loại state | Công cụ mặc định |
|---|---|
| Modal, tab, lựa chọn tạm thời | `useState` |
| Form phức tạp hoặc nhiều bước | React Hook Form/schema hoặc `useReducer` |
| Dữ liệu từ backend và cache | RTK Query khi đã chọn Redux; nếu chưa, dùng một data hook thống nhất |
| Auth/session và workflow client xuyên nhiều screen | Redux Toolkit slice hoặc Context nhỏ, tùy tần suất thay đổi |
| Theme, locale, dependency ổn định | Context |

- Không sao chép server response vào Redux slice và local state nếu không có nhu cầu chỉnh sửa bản nháp.
- Không dùng Context làm kho chứa danh sách Product, Loan Application hoặc Assessment thay đổi thường xuyên.
- Khi dùng Redux, chỉ dùng Redux Toolkit; component subscribe bằng selector hẹp.
- Giữ form state ở form. Chỉ đưa draft vào global state khi phải đi xuyên screen hoặc khôi phục phiên làm việc.
- Chỉ dùng `memo`, `useMemo`, `useCallback` khi cần giữ reference, tính toán đáng kể hoặc profiler cho thấy render thừa.
- Danh sách dùng `FlatList`/`SectionList`, key ổn định, phân trang và memo hóa item chỉ khi có lợi; không render danh sách lớn bằng `ScrollView`.
- Không tạo object/function provider mới mỗi render nếu nó làm toàn cây Context cập nhật; tách Context theo trách nhiệm trước khi memo hóa.

## 5. API và luồng bất đồng bộ

- Component không gọi `fetch`/`axios` trực tiếp. Endpoint nằm trong `api/` hoặc API slice; hook/use case điều phối cho UI.
- Mỗi API phải có request/response type và chiến lược hiển thị loading, empty, error, success.
- Không nuốt lỗi bằng `catch(() => {})`. Chuyển lỗi kỹ thuật sang thông báo người dùng và vẫn giữ mã lỗi/traceId cho chẩn đoán.
- Request đọc phải hỗ trợ hủy khi screen unmount hoặc tham số đổi nếu thư viện hỗ trợ `AbortSignal`.
- Mutation quan trọng phải chống bấm lặp và giữ cùng idempotency key khi retry cùng một ý định của người dùng.
- Dữ liệu có optimistic locking phải gửi đúng version backend trả về; frontend không tự tăng version để đoán.
- Sau mutation, cập nhật hoặc invalidate đúng cache liên quan; không tải lại toàn bộ navigation tree.
- Polling Assessment/Core command chỉ chạy ở trạng thái chờ, có khoảng nghỉ, giới hạn/thời hạn, dừng khi terminal state và dọn timer khi rời screen/app về background.
- Phân biệt `retryable` với lỗi nghiệp vụ không được retry. Không tự retry vô hạn.
- URL, timeout và feature flag lấy từ cấu hình môi trường; không hardcode secret.

## 6. TypeScript, form và dữ liệu

- Giữ `strict: true`; không dùng `any` trừ adapter biên có giải thích và thu hẹp kiểu ngay sau đó.
- Không dùng non-null assertion `!` để che dữ liệu có thể thiếu.
- Tách transport DTO khỏi UI/form model khi tên, kiểu hoặc ý nghĩa khác nhau; mapping nằm ngoài component.
- Status/enum phải khớp backend. Xử lý nhánh `unknown` để UI không vỡ khi backend bổ sung trạng thái.
- Tiền dùng kiểu số theo API nhưng format ở lớp hiển thị; không tính tiền bằng chuỗi đã format.
- Ngày giờ backend coi là UTC/offset rõ ràng và chỉ đổi timezone lúc hiển thị.
- Validation phía client giúp trải nghiệm, không thay thế validation backend.
- Hiển thị lỗi tại đúng field và lỗi nghiệp vụ ở cấp form; khóa submit khi request đang chạy.

## 7. Hook và comment

- Tên hook mô tả use case: `useLoanApplications`, `useCreditAssessment`, `useSubmitApplication`.
- Hook dùng lại hoặc chứa nghiệp vụ phải có JSDoc tiếng Việt: mục đích, input/output, side effect, cache/polling/retry quan trọng.
- `useEffect` có timer, subscription, request, AppState hoặc đồng bộ state phải giải thích lý do và có cleanup phù hợp.
- Comment giải thích **vì sao**, invariant, quy tắc nghiệp vụ hoặc workaround; không lặp lại câu lệnh.
- Bắt buộc chú thích logic version, idempotency, polling, retry, mapping, phân quyền, công thức tài chính và fallback tạm thời.
- Không dùng comment để hợp thức hóa hàm quá dài; tách thành hàm có tên thể hiện ý định.

## 8. UI/UX, accessibility và responsive

- Mỗi screen dữ liệu phải có loading, empty, error và success; mutation có disabled/progress/feedback rõ ràng.
- Không dùng màu là tín hiệu duy nhất. Kèm nhãn, biểu tượng hoặc nội dung trạng thái.
- Control có `accessibilityLabel`/role phù hợp; vùng bấm đủ lớn; lỗi form có thể đọc và focus hợp lý.
- Hỗ trợ font scaling và dữ liệu dài; không khóa chiều cao text tùy tiện.
- Xử lý keyboard, safe area, orientation/kích thước màn hình và trạng thái offline/mạng chậm.
- Giữ thuật ngữ nghiệp vụ nhất quán giữa web, mobile và backend; ưu tiên tiếng Việt dễ hiểu.
- Dùng token/design system thay vì hardcode màu/khoảng cách lặp lại.

## 9. Bảo mật

- Ẩn/hiện UI theo quyền chỉ phục vụ trải nghiệm; backend vẫn quyết định quyền.
- Không log token, mật khẩu, dữ liệu eKYC, thu nhập đầy đủ hoặc payload tín dụng nhạy cảm.
- Không lưu access/refresh token thật trong AsyncStorage. Dùng secure storage theo kiến trúc xác thực đã chốt.
- Không đưa secret vào biến môi trường được bundle vào ứng dụng.
- Che dữ liệu nhạy cảm trong app switcher/screenshot nếu nghiệp vụ yêu cầu.

## 10. Kiểm thử và điều kiện hoàn thành

- Test mapper, formatter, validation và hook có nhánh nghiệp vụ.
- Test ít nhất loading, empty, error, success và quyền chính của feature quan trọng.
- Test mutation chống submit lặp, xử lý version conflict và retry/polling nếu có.
- Mock ở biên HTTP, không mock chi tiết implementation nội bộ.
- Trước bàn giao: chạy type-check, lint, test và build nếu dự án có script tương ứng.
- Không báo hoàn thành khi chỉ dựng UI tĩnh nhưng API, lỗi hoặc trạng thái nghiệp vụ bắt buộc chưa nối; ghi rõ phần mock/chưa có contract.

## 11. Quy tắc riêng cho finora-mobile

- Route-level component đặt trong `screens`; component card/form/section đặt trong `components`.
- Navigation chỉ truyền identifier và tham số nhỏ; không truyền toàn bộ object nghiệp vụ cũ qua nhiều screen.
- Luồng form nhiều bước phải giữ draft có chủ đích và xóa khi submit/withdraw thành công; không tự coi thoát app là đã nộp.
- Dừng hoặc giảm polling khi app background; khôi phục/refetch có kiểm soát khi foreground.
- Phân biệt lỗi offline, timeout và lỗi nghiệp vụ để người dùng biết có thể thử lại hay không.
- Tối ưu cho thiết bị cấu hình thấp bằng phân trang, ảnh đúng kích thước và tránh render lại cả screen vì Context lớn.

## 12. Lập plan tích hợp frontend

- Feature đi qua nhiều screen hoặc nhiều backend LN phải có plan được Thái duyệt trước khi code.
- Plan frontend tham chiếu backend Design/LN làm nguồn sự thật; không sao chép lại entity, migration hoặc implementation backend.
- Plan phải có: actor, luồng nhìn thấy, screen/navigation, API request-response, state/cache, mapping status, failure path, file dự kiến, test và acceptance criteria.
- Ghi rõ phần nào dùng API thật, phần nào mock, dependency còn thiếu và screen phải ẩn/khóa vì backend chưa có.
- Với lần tích hợp đầu, có thể gom các LN backend đã hoàn thành thành một task end-to-end. Các đợt sau đi theo vertical slice 1–2 LN liên quan rồi cập nhật web/mobile đồng bộ.
- Trạng thái plan: `DRAFT -> APPROVED -> IN_PROGRESS -> READY_FOR_REVIEW -> ACCEPTED`; chỉ Thái chuyển sang `APPROVED` hoặc `ACCEPTED`.
