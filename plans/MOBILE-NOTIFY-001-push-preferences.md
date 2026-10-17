# MOBILE-NOTIFY-001 — Thông báo đẩy và cài đặt thông báo

## Trạng thái

`READY_FOR_REVIEW` — code và type-check xong ngày 2026-10-17 trên nhánh `feat/w3f-push` (Wave 3, R7). Thái cho
phép agent tự chọn phương án và làm luôn (D23 của plan tồn đọng); chưa có UAT trên máy thật. Backend là plan
`finora-platform/.agents/plans/W3F-notifications-expo-push.md` (Hải review trước merge).

## Mục tiêu và actor

- Actor: người vay và nhà đầu tư đã đăng nhập trên app.
- Nhận thông báo đẩy (Expo Push) cho các mốc quan trọng của khoản vay/khoản đầu tư; bật/tắt push theo nhóm.
- Thông báo trong app (mục Thông báo ở trang chủ) giữ nguyên và luôn có nội dung đầy đủ; push chỉ là lời nhắc đã che.

## Luồng nhìn thấy

1. Đăng nhập xong, app tự hỏi quyền thông báo **một lần** trên máy (hộp thoại của hệ điều hành). Cho phép thì app lấy
   Expo push token và gửi `POST /notifications/devices`; mỗi lần mở phiên sau đó app đăng ký lại (backend upsert, cùng
   `deviceId`), và đăng ký lại khi hệ điều hành đổi token.
2. Hồ sơ → **Cài đặt thông báo**: thẻ trạng thái thiết bị (đang bật / chưa cho phép / chưa cấu hình / dữ liệu giả /
   lỗi) với đúng một hành động (bật, thử lại, mở cài đặt máy); danh sách nhóm FUNDING, CONTRACT, DISBURSEMENT,
   REPAYMENT, DELINQUENCY, RESTRUCTURING, WALLET, GENERAL với công tắc push.
3. Push trên màn hình khóa chỉ có câu chung (không số tiền, không mã khoản vay). Chạm vào push mở mục **Thông báo**.
   App đang mở thì hiện banner, không âm thanh.
4. Đăng xuất: app gọi `DELETE /notifications/devices/{deviceId}` bằng access token chụp trước khi xóa phiên (best-effort);
   nếu lần gỡ đó thất bại, lần đăng nhập sau của người khác trên cùng máy làm backend chuyển token sang người mới.

## API contract (finora-notification, JWT người dùng, qua Gateway `/api/v1/notifications/**`)

| Method | Path | Ghi chú |
|---|---|---|
| `POST` | `/notifications/devices` | `{token, platform: IOS\|ANDROID\|UNKNOWN}` → `{deviceId, status, platform, tokenRef, lastRegisteredAt}`; không trả lại token |
| `DELETE` | `/notifications/devices/{deviceId}` | Luôn 204; chỉ gỡ thiết bị của chính người gọi |
| `GET` | `/notifications/preferences` | `{categories: [{category, pushEnabled, inAppEnabled}]}`, mặc định bật |
| `PUT` | `/notifications/preferences` | `{preferences: [{category, pushEnabled}]}`, chỉ nhóm gửi lên được đổi |
| `GET` | `/notifications` | Thêm field `category` (tương thích ngược) |

## State, cache và failure

- Trạng thái đăng ký push: store module nhỏ (`lib/registrationStore`, `useSyncExternalStore`) vì cầu nối chạy nền và
  phần đăng xuất trong `AuthProvider` không cùng cây component. `deviceId` chỉ giữ trong bộ nhớ.
- Cờ "đã tự hỏi quyền" lưu SecureStore (không phải bí mật, app chưa có kho lưu thường).
- Tùy chọn: `useAsync` + đổi lạc quan theo từng nhóm; lỗi `PUT` trả công tắc về cũ và hiện một dòng lỗi.
- Không có EAS projectId (`EXPO_PUBLIC_EAS_PROJECT_ID`), chạy web, Expo Go/máy ảo không cấp token, hoặc miền
  `notification` đang mock: app báo rõ lý do, hộp thư trong app vẫn chạy.

## File

- Mới: `src/features/push-notifications/**`, `src/navigation/navigationRef.ts`, plan này.
- Sửa tối thiểu: `navigation/types.ts`, `navigation/MainTabs.tsx`, `navigation/RootNavigator.tsx` (ref + cầu nối),
  `providers/AuthProvider.tsx` (gỡ thiết bị khi đăng xuất), `features/account` (dòng "Cài đặt thông báo" thành thật),
  `features/home/mappers/notificationDto.ts` (đọc `category`, định dạng mọi số tiền trong câu), `app.json` (plugin
  `expo-notifications`), `package.json`/`package-lock.json` (`expo-notifications` 57.0.17, đúng bản SDK 57 khai báo),
  `.env.example` (bỏ `notification` khỏi mock — B63 của plan W3F; thêm `EXPO_PUBLIC_EAS_PROJECT_ID`).

## Kiểm tra

- `npx tsc --noEmit`: xanh ngày 2026-10-17.
- Chưa có thiết bị thật nên chưa kiểm push tới máy; backend mặc định `NOTIFICATION_PUSH_PROVIDER=log` (giả lập).
- UAT cần: development build (`expo-dev-client`/EAS) có projectId, máy Android/iOS thật, backend `expo`.

## Còn lại

- Mục Thông báo vẫn đánh dấu đọc từng tin; backend đã có `POST /notifications/read-all`, đổi hook `useNotificationFeed`
  sang API này là việc nhỏ của owner UI trang chủ.
- Thêm dòng task này vào `PLAN.md` khi merge (không sửa trong nhánh này để tránh xung đột với nhánh rút tiền).
