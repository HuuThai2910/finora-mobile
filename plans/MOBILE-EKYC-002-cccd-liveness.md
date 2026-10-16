---
task_id: MOBILE-EKYC-002
status: IN_PROGRESS
owner: Hai
approved_by: null
approved_at: null
supersedes: MOBILE-EKYC-001
backend_scope: finora-user (ekyc consent / verify / liveness / confirm), qua Gateway
contract: ../../finora-platform/.agents/plans/EKYC-002-cccd-liveness-evidence.md
design: ../../DE-XUAT-EKYC-CCCD-LIVENESS.md
---

# MOBILE-EKYC-002 — Điều khoản, chụp CCCD chống mờ, liveness bằng video, soát có nhãn nguồn

## Trạng thái

`IN_PROGRESS` (16/10/2026) — code mobile xong theo hợp đồng, `npx tsc --noEmit` sạch, chạy được
toàn luồng bằng mock. Còn chờ: chạy thử trên máy thật bằng **Expo Go** (Android + iPhone) và nối
với `finora-user`/`finora-ai` thật đang được làm song song. Chuyển `READY_FOR_REVIEW` sau khi
chạy được đầu-cuối với backend thật.

Thay thế MOBILE-EKYC-001 (luồng hai bước chỉ chụp CCCD + Gemini, đã bỏ liveness ngày 22/08).

## Nguồn sự thật

- **Hợp đồng (bắt buộc):** `finora-platform/.agents/plans/EKYC-002-cccd-liveness-evidence.md`
  mục 1 (luồng), 3 (endpoint, JSON, mã kết quả, thông điệp), 7 (mobile). Tên field và mã lỗi lấy
  nguyên từ đó; file này không chép lại.
- **Lý do thiết kế:** `DE-XUAT-EKYC-CCCD-LIVENESS.md` mục 2.4 (kể cả bước 8 "nguồn chụp thay thế
  được"), 2.8, 3.1–3.3, 3.10, Phụ lục A.
- Ràng buộc: chỉ test bằng Expo Go — chỉ thêm `expo-image-picker`, `expo-brightness`
  (`npx expo install`, bản khớp SDK 57). Không native module, không dev build.

## Actor và luồng nhìn thấy

Người dùng đã đăng nhập, chưa định danh hoặc bị từ chối sau duyệt tay.

1. Hồ sơ › "Xác thực eKYC" (hoặc nhãn trạng thái / ghi chú ở Thông tin tài khoản) → **Điều khoản**.
   Đã đồng ý đúng phiên bản hiện hành thì màn tự chuyển sang chụp thẻ.
2. Điều khoản (Markdown từ server) → cuộn hết mới tick được **một** ô → "Bắt đầu xác minh"
   (hoặc "Để sau").
3. **Chụp mặt trước → mặt sau.** Camera trong app quét QR sống, chụp loạt 2–3 tấm giữ tấm nét nhất.
   Xem lại "Chụp lại" / "Dùng ảnh này" → mặt sau "Gửi xác minh".
4. Server trả `DRAFT_READY` → **Kiểm tra khuôn mặt**; `RETAKE` → về đúng mặt bị lỗi kèm lý do (cùng
   một mặt bị 2 lần liên tiếp thì hiện "Chọn ảnh có sẵn"); từ chối → màn kết quả.
5. **Liveness:** mẹo → "Bắt đầu quay" → xin thử thách → đếm ngược 3 giây → quay video theo lời
   nhắc ("Nhìn thẳng", "Quay đầu sang trái/phải", "Ngẩng lên", "Cúi xuống") → gửi → đạt/vùng xám
   sang soát; quay lại/trượt thì thử lại (còn N lần); đủ 3 lần trượt → "đang chờ duyệt".
6. **Soát và xác nhận:** mỗi trường có nhãn nguồn; chỉ trường "AI đọc" có ô sửa; cần duyệt tay thì
   báo trước → "Thông tin chính xác — Xác nhận" → `VERIFIED` hoặc "Hồ sơ đang được duyệt".
7. **Cài đặt › Quyền riêng tư eKYC:** trạng thái đồng ý, phiên bản, thời điểm đồng ý, xem điều
   khoản, rút lại đồng ý (có hỏi xác nhận) → tải lại hồ sơ.

## Màn hình và điều hướng (stack Hồ sơ)

| Route | Màn | Ghi chú |
|---|---|---|
| `EkycConsent` | `EkycConsentScreen` | Đã đồng ý → `replace('EkycCapture', {side:'front'})` |
| `EkycCapture` `{ side }` | `EkycCaptureScreen` | Đăng ký với `getId = side`: `navigate` về mặt trước khi RETAKE sẽ quay lại đúng màn đó |
| `EkycLiveness` | `EkycLivenessScreen` | Khoá cử chỉ/nút back khi đang quay hoặc đang gửi |
| `EkycResult` | `EkycResultScreen` | Soát bản nháp, hoặc kết quả cuối; kết quả cuối `reset` stack về `[Profile, EkycResult]` |
| `EkycPrivacy` | `EkycPrivacyScreen` | Dòng "Quyền riêng tư eKYC" trong nhóm "Thông báo & Cài đặt" |

## API (qua Gateway, token phiên; chi tiết ở hợp đồng mục 3)

| Bước | Endpoint | Ghi chú mobile |
|---|---|---|
| Điều khoản | `GET/POST/DELETE /users/profile/ekyc/consent` | POST gửi `version`, `textSha256`, `platform`, `appVersion` (từ `app.json`); `409 CONSENT_VERSION_STALE` → tải lại, bắt đọc lại |
| Quét thẻ | `POST /users/profile/ekyc-verify` | JSON base64 hai ảnh + `frontSource/backSource` + `qr {text, side, method}` + `consentVersion`; timeout 90 s |
| Thử thách | `POST /users/profile/ekyc/liveness/challenge` | Lỗi đến dạng `ApiError.code`: `DRAFT_EXPIRED`, `CONSENT_REQUIRED`, `REVIEW_PENDING`, `RATE_LIMITED` |
| Liveness | `POST /users/profile/ekyc/liveness` (multipart) | `sessionId`, `captureMode`, `platform`, `video` hoặc `frames` + `frameTimesMs`; `authUploadWithToken` (không đặt Content-Type JSON, refresh 401, timeout 120 s) |
| Xác nhận | `POST /users/profile/ekyc-confirm` | Chỉ gửi `edits` cho trường đã sửa; `400 EDIT_NOT_ALLOWED` hiện nguyên thông điệp server |

Kết quả nghiệp vụ đến trong body 200 (`resultCode`); `normalizeEkycResult` điền mảng/cờ rỗng mặc
định. Thông điệp của server luôn được ưu tiên; bảng dự phòng ở `constants/messages.ts`.

## State

| State | Nơi giữ | Lý do |
|---|---|---|
| Phiên bản điều khoản, ảnh hai mặt (base64 + nguồn + QR), chuỗi RETAKE từng mặt, kết quả quét, kết quả hiển thị | `EkycSessionProvider` (Context, chỉ bộ nhớ) | Đi xuyên nhiều màn, không được qua params hay xuống đĩa; xoá khi hoàn tất, rút đồng ý hoặc rời tab |
| Điều khoản, trạng thái đồng ý | `useAsync` trong màn | Dữ liệu server, đọc mới mỗi lần mở |
| Pha liveness, thử thách, bước hiện tại | `useLivenessSession` | Sống theo màn |
| Bản sửa trường AI | `useDraftEdits` | Form state của màn soát |

## Chụp CCCD (`src/features/ekyc/capture/`)

- `CardCaptureSource` = `{ kind, CaptureView }`; `inAppCameraSource` (mặc định) và
  `systemCameraSource` (`launchCameraAsync`, Android `allowsEditing` + `aspect [8,5]`, màn hướng dẫn
  trước khi mở camera). Chọn bằng `EXPO_PUBLIC_EKYC_CAPTURE_SOURCE=in_app|system`; **không** có nút
  đổi nguồn cho người dùng.
- Chống mờ: không truyền `autofocus`; `takePictureAsync({ quality: 1 })`; nén **một lần** 0.9;
  `CCCD_WIDTH = 1600`; preset phóng to (giá trị riêng Android/iOS vì hai nền tảng quy đổi `zoom`
  khác nhau — phải hiệu chỉnh trên máy thật); nhắc giữ máy ~20 cm; chụp loạt 3 tấm (tối đa 2,5 s)
  giữ JPEG lớn nhất, xoá các tấm còn lại.
- QR: `barcodeScannerSettings={{barcodeTypes:['qr']}}` + `onBarcodeScanned`, nhận `^\d{12}\|`, hiện
  "Đã đọc mã QR"; chỉ gắn QR thấy trong 4 s trước lúc bấm chụp (tránh gắn nhầm QR mặt kia);
  Android chưa thấy mã sau ~4 s thì đổi `key` dựng lại CameraView (tối đa 2 lần). Sau khi chụp mà
  chưa có QR: `scanFromURLAsync` trên ảnh gốc, Android thử thêm 4 góc phần tư của vùng thẻ; mặt kia
  đã có QR thì bỏ bước này.
- Xử lý chung (`finalizeCardShot`): đổi HEIC → JPEG, cắt theo khung (chỉ camera trong app), thu về
  1600 px, base64, xoá ảnh gốc.
- "Chọn ảnh có sẵn" (`launchImageLibraryAsync`, nguồn `GALLERY`) chỉ hiện sau 2 lần RETAKE liên
  tiếp của cùng một mặt; báo trước là hồ sơ sẽ được duyệt thêm.

## Liveness

- `CameraView` `facing="front"`, `mode="video"` ngay từ lúc mount, `mute`, `videoQuality` và
  `videoBitrate` theo thử thách (đổi thông số → đổi `key` và chờ `onCameraReady`), khung oval
  phủ trắng bên ngoài làm đèn phụ, `expo-brightness` lên tối đa từ lúc đếm ngược, trả lại khi quay
  xong, khi lỗi, khi app xuống nền và khi rời màn.
- iOS `recordAsync({ codec: 'avc1', maxDuration, maxFileSize: 8_000_000 })`, Android không codec.
  Lịch nhắc theo `steps[].holdMs` (mốc tuyệt đối từ lúc bắt đầu), dừng sau tổng thời gian + 300 ms.
- `recordAsync` lỗi, không trả tệp, hoặc quá 6 s sau khi dừng vẫn chưa có tệp → xin thử thách mới,
  chuyển `mode="picture"` và chạy chế độ **STILLS** (~1 ảnh/giây, thu về 640 px, `frameTimesMs`).
  `EXPO_PUBLIC_EKYC_LIVENESS_CAPTURE=stills` ép chế độ này để thử trên máy quay được video.
- Không bao giờ cho chọn video/selfie từ thư viện. Video/ảnh tạm bị xoá sau khi gửi.

## Ánh xạ `resultCode` → hành vi

| Bước | Mã | Hành vi |
|---|---|---|
| Quét | `DRAFT_READY` | Sang liveness |
| Quét | `RETAKE` | Xoá ảnh mặt bị lỗi, hiện lý do, về đúng mặt (mặt trước ưu tiên) |
| Quét / xác nhận | `RATE_LIMITED`, `AI_UNAVAILABLE`, `STORAGE_UNAVAILABLE` | Báo tại chỗ, giữ ảnh/bản nháp để gửi lại |
| Mọi bước | `CONSENT_REQUIRED` | Xoá phiên, `reset` về màn điều khoản |
| Quét | `CARD_EXPIRED`, `CARD_UNSUPPORTED`, `UNDERAGE`, `ID_MISMATCH`, `ID_TAKEN`, `OCR_FAILED`, mã lạ | Màn kết quả "Chưa xác minh được" + "Chụp lại từ đầu" |
| Liveness | `LIVENESS_PASSED`, `LIVENESS_REVIEW` | Màn soát (vùng xám báo trước là sẽ duyệt thêm) |
| Liveness | `RETAKE`, `LIVENESS_FAILED`, `FACE_MISMATCH` | Thông điệp server + "còn N lần thử", nút "Thử lại" (thử thách mới) |
| Liveness | `CHALLENGE_EXPIRED` | Thử lại |
| Liveness / thử thách | `DRAFT_EXPIRED` | Khoá màn, nút "Chụp lại CCCD" |
| Mọi bước | `REVIEW_PENDING` | Màn "Hồ sơ đang được duyệt" (stack về `[Profile, EkycResult]`) |
| Xác nhận | `VERIFIED` | Thành công, tải lại hồ sơ trong phiên |
| Xác nhận | `LIVENESS_REQUIRED` | Về màn kiểm tra khuôn mặt |

Hồ sơ: mapper `toUserProfile` đọc `ekycStatus` (`MANUAL_REVIEW` → "CHỜ DUYỆT", `FAILED` → "BỊ TỪ
CHỐI", `PENDING` → "CHƯA ĐỊNH DANH"); không dùng riêng `profileCompleted` nữa vì rút đồng ý vẫn
giữ họ tên + số định danh. Đang chờ duyệt thì không mở lại luồng eKYC từ màn Hồ sơ.

## File chính

- `src/types/ekyc.ts`; `src/lib/api.ts` (`authUploadWithToken`, `authFetchWithToken` nhận `timeoutMs`);
  `src/lib/camera.ts`; `src/lib/appInfo.ts`; `src/lib/mockFlag.ts` (`EXPO_PUBLIC_MOCK_SCENARIOS`);
  `src/lib/mocks/ekyc.ts`, `ekycConsentText.ts`, `fixtures.ts`.
- `src/features/ekyc/{api,capture,liveness,components,constants,hooks,mappers,screens}`.
- `src/navigation/{types,MainTabs}.tsx`; `src/features/account/*` (lối vào qua điều khoản, dòng
  Quyền riêng tư); `src/features/auth/mappers/profile.ts`; `src/components/ui/Checkbox.tsx` (`disabled`).

## Kiểm thử bằng Expo Go

Repo chưa có test runner; kiểm bằng `npx tsc --noEmit` và chạy tay trên máy thật.

**Mock (không cần backend):** `.env` đặt `EXPO_PUBLIC_MOCK_DOMAINS=ekyc` (giữ các miền mock khác nếu
cần), chạy `npx expo start -c`, mở bằng Expo Go, đăng nhập bằng tài khoản thật (auth không mock).
Thêm `EXPO_PUBLIC_MOCK_SCENARIOS=ekyc-retake` / `ekyc-reject` / `ekyc-review` /
`ekyc-liveness-fail` để xem từng nhánh. Có QR CCCD thật trong khung thì bản nháp ra đủ nguồn
QR/MRZ; không có QR thì ra bản nháp có trường AI (sửa được, cần duyệt tay).

**Thật:** bỏ `ekyc` khỏi mock, `EXPO_PUBLIC_AUTH_API_URL` trỏ Gateway, backend chạy EKYC-002 (MinIO
bật thì mới qua được bước lưu bằng chứng). Kiểm: đồng ý → chụp (QR sống — chip "Đã đọc mã QR", request có
`qr.method=LIVE_SCAN`) → RETAKE → liveness video (Android + iOS) → xác nhận; ép `stills`; rút lại đồng ý
rồi xem nhãn hồ sơ về "CHƯA ĐỊNH DANH".

**Đo chọn nguồn chụp:** chạy cùng bộ thẻ với `EXPO_PUBLIC_EKYC_CAPTURE_SOURCE=in_app` và `system`,
ghi độ nét/tỉ lệ đọc QR/MRZ/số lần chụp lại phía server để quyết định mặc định (đề xuất 2.4 bước 8).

## Acceptance criteria

1. Không vào được camera khi chưa đồng ý đúng phiên bản; ô tick chỉ bật khi đã cuộn hết.
2. Ảnh gửi đi ≤ 1600 px, nén một lần; QR đọc sống được gửi kèm `method=LIVE_SCAN`.
3. RETAKE quay về đúng mặt với lý do của server; lần thứ 2 liên tiếp hiện "Chọn ảnh có sẵn".
4. Liveness quay được video theo lời nhắc trên Android và iOS trong Expo Go; máy không quay được
   thì tự chuyển chế độ ảnh liên tiếp; độ sáng luôn được trả lại.
5. Màn soát có nhãn nguồn từng trường, chỉ sửa được trường AI, gửi đúng `edits`.
6. Mỗi `resultCode` ở bảng trên cho đúng hành vi; không có base64/ảnh/nội dung QR trong log.
7. Rút lại đồng ý xong nhãn hồ sơ về chưa định danh.
8. `npx tsc --noEmit` sạch.

## Nợ kỹ thuật / chưa làm

- Chưa có test tự động (repo chưa có Jest) cho `parseConsentMarkdown`, `routeAfterVerify`,
  `routeAfterLiveness`, `toDraftRows`, `applyRetake`.
- Preset phóng to, ngưỡng chụp loạt và thời gian chờ là giá trị tạm, cần đo trên máy test.
- Không làm nút `CameraView.launchScanner()` (hợp đồng mục 7 không yêu cầu); `qr.method = SCANNER`
  chỉ có trong type.
- Android có thể huỷ Activity khi mở camera hệ thống trên máy yếu (`getPendingResultAsync`) — chưa
  khôi phục ảnh trong trường hợp đó.
- Bản web (`expo start --web`) không hỗ trợ upload video kiểu `{uri,name,type}`; eKYC chỉ dành cho
  app di động.
