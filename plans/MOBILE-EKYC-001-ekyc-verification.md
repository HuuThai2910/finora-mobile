---
task_id: MOBILE-EKYC-001
status: DRAFT
owner: Hai
approved_by: null
approved_at: null
backend_scope: finora-user (liveness-challenge, ekyc-verify), finora-ai (ocr, liveness-active, face-match)
ui_reference: ../../finora-platform/docs/ui/bản-đẹp.html
ui_reference_sha256: 790FCE4FDEC49AF672FA56F6EB9FD7E314E2A1A3B850BC71A833B0E19FE6F224
---

# MOBILE-EKYC-001 — Nối luồng định danh điện tử với backend thật

## Bản đọc nhanh theo nghiệp vụ

Ba màn eKYC hiện tại là giao diện tĩnh: khung ngắm được vẽ lại bằng `View`, không mở camera, dữ liệu lấy từ `src/lib/mocks/ekyc.ts`. Backend đã xong luồng xác minh thật, nên task này thay toàn bộ phần giả bằng camera thật và hai lần gọi API thật.

Điều người dùng thấy khác đi: họ thật sự chụp ảnh CCCD, thật sự phải làm đúng động tác server yêu cầu (nháy mắt / quay đầu, thứ tự ngẫu nhiên mỗi phiên), và kết quả hiển thị là kết quả xác minh thật chứ không phải số cố định.

## 1. Nguồn sự thật

- Contract backend: `finora-user` — `UserProfileController`, `EkycVerificationService`, `EkycResultCode`.
- Luồng liên service: `.agents/rules/08-cross-service-flows.md`, mục **F01 — Định danh điện tử**, phần `CURRENT STATE (2026-08-21)`.
- Không tự suy đoán thêm field, mã lỗi hay trạng thái nào ngoài những gì backend đã trả.

## 2. Phạm vi

### Có làm

- Chụp ảnh CCCD mặt trước bằng camera thật.
- Lấy thử thách active liveness từ server, hướng dẫn người dùng làm đúng thứ tự động tác, chụp loạt frame.
- Gửi `ekyc-verify` và hiển thị kết quả theo `resultCode`.
- Xử lý đủ loading / error / success cho cả hai lần gọi, cho phép làm lại khi trượt.

### Không làm

- **Không nối đăng nhập thật.** Auth trên mobile vẫn mock; task này dùng JWT cấu hình sẵn qua biến môi trường để chạy được đầu-cuối. Xem mục 12.
- Không chụp CCCD mặt sau — backend chỉ dùng ảnh mặt trước.
- Không đọc chip NFC — đã loại khỏi phạm vi dự án ngày 2026-08-21.
- Không hiển thị bằng chứng blockchain (`chainTxId`, `chainBlock`) vì backend không trả về; xem mục 3.

## 3. Các sai lệch hiện tại phải sửa

| Hiện tại | Vấn đề | Xử lý |
|---|---|---|
| `EkycCaptureScreen` có 3 bước: CCCD trước, CCCD sau, video selfie | Backend chỉ nhận 1 ảnh CCCD + loạt frame | Rút còn 1 bước chụp CCCD mặt trước |
| `LivenessScreen` hiển thị 4 bước cố định lấy từ mock | Thứ tự động tác do server sinh ngẫu nhiên mỗi phiên | Hiển thị đúng `actions` server trả về |
| `EkycResult` có `chainTxId`, `chainBlock` | Backend không trả hai field này | Bỏ khỏi type và khỏi UI |
| `EkycResult.faceMatchScore` hiển thị dạng phần trăm 91.6 | Backend trả `0..1` | Đổi sang nhân 100 lúc hiển thị, không sửa dữ liệu |
| `getLivenessProgress()` là `GET` không tham số | Thật ra là `POST` tạo phiên có hạn 60 giây | Đổi tên và đổi contract |

## 4. Screen và navigation mục tiêu

Giữ nguyên ba route trong `AuthStackParamList`, chỉ đổi phần bên trong:

```
Otp → EkycCapture → Liveness → EkycResult
```

- `EkycCapture`: xin quyền camera, chụp CCCD mặt trước, xem lại, chụp lại nếu mờ.
- `Liveness`: lấy challenge, hướng dẫn từng động tác, chụp loạt frame, gửi xác minh.
- `EkycResult`: hiển thị kết quả; đạt thì vào app, trượt thì quay lại `Liveness` hoặc `EkycCapture` tuỳ `resultCode`.

Ảnh CCCD **không truyền qua `navigation.navigate`** — base64 vài trăm KB không phải "tham số nhỏ" theo quy tắc mobile. Dùng context hẹp trong feature.

## 5. Luồng người dùng

```
[EkycCapture]
  Xin quyền camera → chưa cấp thì hiện nút mở Cài đặt
  Chụp mặt trước CCCD → xem lại ảnh → "Chụp lại" hoặc "Tiếp tục"
  Lưu base64 vào EkycSessionContext (chỉ trong bộ nhớ)

[Liveness]
  POST /users/profile/liveness-challenge
    → { sessionId, actions: ["turn_left","blink"], expiresInSeconds: 60 }
  Hiển thị danh sách động tác theo đúng thứ tự
  Bấm "Bắt đầu" → chụp N frame cách nhau ~350ms, có đếm ngược trên UI
  POST /users/profile/ekyc-verify { sessionId, frames, cccdImageBase64 }

[EkycResult]
  resultCode = VERIFIED → completeKyc() → vào app
  resultCode khác → thông điệp + nút làm lại đúng chỗ
```

## 6. API contract sử dụng

Cả hai đi qua Gateway, cần `Authorization: Bearer <JWT>` và quyền `user:cccd:scan`.

**`POST /api/v1/users/profile/liveness-challenge`** — body rỗng.

```json
{ "code": 200, "message": "Thành công",
  "data": { "sessionId": "…", "actions": ["turn_left", "blink"], "expiresInSeconds": 60 } }
```

**`POST /api/v1/users/profile/ekyc-verify`**

```json
{ "sessionId": "…", "frames": ["<base64>", "…"], "cccdImageBase64": "<base64>" }
```

```json
{ "code": 200, "message": "Thành công",
  "data": { "status": "VERIFIED", "resultCode": "VERIFIED", "faceMatch": true,
            "faceMatchScore": 0.88, "livenessVerified": true,
            "ocrWarnings": [], "message": "Xác minh eKYC thành công" } }
```

Ràng buộc từ backend, client phải tôn trọng để không nhận `422`:

- `frames`: tối thiểu 3, tối đa 20 phần tử, không phần tử nào rỗng.
- `sessionId` dùng một lần; hết hạn sau 60 giây.
- Backend giới hạn 1 request xác minh / 10 giây cho mỗi người dùng.

## 7. State và cache

| State | Nơi giữ | Lý do |
|---|---|---|
| Ảnh CCCD base64 | `EkycSessionContext` trong feature | Đi qua 2 screen, không được đưa vào navigation params, không được lưu xuống đĩa |
| Kết quả xác minh | `EkycSessionContext` | `EkycResult` chỉ đọc lại, không gọi API lần nữa |
| Challenge, tiến trình chụp | `useState` trong `Liveness` | Chết theo screen, không ai khác cần |
| Quyền camera | `useCameraPermissions` của expo-camera | Thư viện tự quản lý |

Không dùng RTK Query: hai lời gọi này là lệnh một lần, không có gì để cache hay invalidate, và `sessionId` chỉ dùng một lần nên cache lại là sai nghiệp vụ. Giữ đúng khuôn `isMocked('ekyc')` mà `mockFlag.ts` đã thiết kế cho các miền chưa/đã có backend.

**Không bao giờ ghi ảnh hay base64 vào log**, kể cả khi debug — quy tắc bảo mật mục 9 của engineering-rules.

## 8. Mapping `resultCode` sang hành vi UI

| `resultCode` | Thông điệp | Nút hành động |
|---|---|---|
| `VERIFIED` | Định danh thành công | Bắt đầu sử dụng → `completeKyc()` |
| `PROFILE_NO_CCCD` | Chưa có thông tin CCCD trong hồ sơ | Về màn hồ sơ (chưa có → tạm về `EkycCapture`) |
| `CHALLENGE_EXPIRED` | Phiên hết hạn | Thử lại → `Liveness` |
| `OCR_FAILED` | Ảnh CCCD chưa đọc được | Chụp lại CCCD → `EkycCapture` |
| `ID_MISMATCH` | Số CCCD trên ảnh không khớp hồ sơ | Chụp lại CCCD → `EkycCapture` |
| `LIVENESS_FAILED` | Chưa làm đúng động tác | Thử lại → `Liveness` |
| `FACE_MISMATCH` | Khuôn mặt không khớp | Thử lại → `Liveness` |
| `RATE_LIMITED` | Thao tác quá nhanh | Thử lại sau vài giây → `Liveness` |
| `AI_UNAVAILABLE` | Dịch vụ đang bận | Thử lại → `Liveness` |
| Giá trị lạ | Dùng `message` server trả về | Thử lại → `Liveness` |

Luôn ưu tiên `message` của server nếu có; bảng trên là nhãn dự phòng khi `message` rỗng. Nhánh "giá trị lạ" bắt buộc phải có để UI không vỡ khi backend thêm mã mới.

## 9. Cấu trúc code dự kiến

```text
src/features/ekyc/
├── api/ekycApi.ts             # 2 endpoint + nhánh mock
├── components/
│   ├── CameraPermissionGate.tsx
│   ├── CccdCameraFrame.tsx
│   └── LivenessActionList.tsx
├── hooks/
│   ├── useEkycSession.ts      # context ảnh CCCD + kết quả
│   └── useLivenessCapture.ts  # challenge → chụp loạt frame → verify
├── screens/
│   ├── EkycCaptureScreen.tsx
│   ├── LivenessScreen.tsx
│   └── EkycResultScreen.tsx
├── constants.ts
└── index.ts
```

`src/types/ekyc.ts` giữ nguyên vị trí (convention hiện tại của repo), viết lại theo contract mới.

## 10. Failure path bắt buộc

- Người dùng từ chối quyền camera → màn hình giải thích + nút mở Cài đặt, không crash, không chặn im lặng.
- Chụp lỗi / ảnh rỗng → báo lỗi, cho chụp lại, không gửi request rỗng.
- Mất mạng ở bất kỳ bước nào → `NetworkError` → "Không kết nối được máy chủ", nút thử lại.
- 401/403 → "Phiên đăng nhập đã hết hạn" (đúng như `ApiError.userMessage` đang làm).
- Chụp chưa đủ `MIN_FRAMES` frame hợp lệ → chặn ở client, không gửi lên để nhận `422`.
- Rời màn giữa chừng → huỷ vòng chụp, không `setState` sau khi unmount.
- Ảnh CCCD bị mất khi quay lại từ `Liveness` (context rỗng) → điều hướng về `EkycCapture` thay vì gửi request thiếu ảnh.

## 11. Kiểm thử

Repo chưa có test runner. Task này **không** dựng hạ tầng test mới; kiểm chứng bằng:

- `npx tsc --noEmit` phải xanh.
- Thủ công với `EXPO_PUBLIC_MOCK_DOMAINS` còn `ekyc` → chạy được toàn luồng bằng mock, không cần backend.
- Thủ công với backend thật: bỏ `ekyc` khỏi biến mock, trỏ `EXPO_PUBLIC_API_URL` vào gateway, chạy đủ các nhánh `VERIFIED`, `LIVENESS_FAILED`, `CHALLENGE_EXPIRED` (chờ quá 60 giây), `RATE_LIMITED` (bấm hai lần liên tiếp).

Nợ kỹ thuật ghi nhận: chưa có unit test cho mapper `resultCode` → cần khi repo có Jest.

## 12. Phụ thuộc còn thiếu

- **Đăng nhập thật chưa có.** `features/auth/api.ts` vẫn ném `501`, `lib/api.ts` không gắn `Authorization`, chưa có secure storage. Task này thêm `lib/authToken.ts` đọc `EXPO_PUBLIC_DEV_JWT` — **chỉ để chạy thử**, phải xoá khi auth thật xong.
- `EXPO_PUBLIC_API_URL` mặc định đang trỏ `:8081` (loan-service). Muốn gọi eKYC phải trỏ vào gateway `:8080`.
- Backend chưa trả bằng chứng blockchain cho hồ sơ KYC.

## 13. Acceptance criteria

1. Chụp được ảnh CCCD thật bằng camera, xem lại và chụp lại được.
2. Màn liveness hiển thị đúng chuỗi động tác server trả về, đổi mỗi lần vào lại.
3. Gửi xác minh thành công → hiển thị điểm khớp khuôn mặt thật và vào được app.
4. Mỗi `resultCode` trượt cho đúng thông điệp và đúng nút làm lại theo bảng mục 8.
5. Từ chối quyền camera không làm app crash.
6. Không có base64 hay ảnh nào bị ghi ra log.
7. `npx tsc --noEmit` xanh.

## 14. Điều kiện bắt đầu và bàn giao

Theo `AGENTS.md`, task chỉ được code khi Thái chuyển `APPROVED`. Bản này đang `DRAFT`.
