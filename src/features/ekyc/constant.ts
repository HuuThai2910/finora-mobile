/** Ba bước chụp trong màn eKYC — mockup hiển thị đúng thứ tự và trạng thái này. */
export const CAPTURE_STEPS = [
  { key: 'front', label: '1. CCCD mặt trước' },
  { key: 'back', label: '2. CCCD mặt sau' },
  { key: 'selfie', label: '3. Video selfie (liveness)' },
] as const;

export const CAPTURE_HINT = 'OCR tự trích xuất thông tin · liveness chống giả mạo';

export const FRAME_HINT = 'Đặt mặt trước CCCD\nvào khung';

export const LIVENESS_HINT =
  'Liveness detection chống giả mạo bằng ảnh tĩnh / video phát lại (C2.8)';

/** Ngưỡng tự duyệt theo mô tả trong mockup. */
export const AUTO_APPROVE_THRESHOLD = 85;
export const MANUAL_REVIEW_THRESHOLD = 70;
