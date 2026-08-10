# Checklist review frontend FINORA

## Trước khi code

- [ ] Đã xác định người dùng, quyền và luồng nghiệp vụ.
- [ ] Đã đối chiếu endpoint, request, response, status và version với backend.
- [ ] Đã phân loại local/form/server/global state.
- [ ] Đã xác định loading, empty, error và success.

## Trong khi code

- [ ] Screen chỉ điều phối; API, mapping, validation và UI phức tạp đã tách đúng trách nhiệm.
- [ ] Không gọi trực tiếp AI Service, Fineract hoặc database.
- [ ] Không có `any`, non-null assertion hoặc lỗi bị nuốt mà thiếu lý do.
- [ ] Mutation chống bấm lặp; retry giữ idempotency/version đúng contract.
- [ ] Timer, polling, AppState, subscription và request có điều kiện dừng/cleanup.
- [ ] Hook và logic khó có comment tiếng Việt giải thích lý do.
- [ ] Giao diện hỗ trợ accessibility, font scaling, keyboard và safe area.
- [ ] Danh sách lớn dùng `FlatList`/`SectionList`, không dùng `ScrollView`.
- [ ] Không log hoặc lưu dữ liệu nhạy cảm không cần thiết.

## Trước khi bàn giao

- [ ] Đã kiểm tra loading, empty, error, success và quyền.
- [ ] Đã kiểm tra offline/mạng chậm, dữ liệu dài và màn hình nhỏ.
- [ ] Đã chạy type-check, lint, test và build hiện có.
- [ ] Đã ghi rõ phần mock, blocker và contract chưa hoàn thành.
- [ ] File vượt ngưỡng đã được tách hoặc có lý do giữ lại.
