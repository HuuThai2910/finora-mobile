/**
 * Số đo quy đổi từ `bản-đẹp.html`.
 *
 * Khung mockup `.phone` rộng 302px, trừ viền 9px mỗi bên còn màn 284px.
 * Máy đích iPhone 15 Pro Max rộng 430pt → 430/284 = 1.514, lấy tròn SCALE = 1.5.
 * Phần dôi ~1,5% dồn vào padding ngang (16 → 20) cho lề thoáng hơn.
 */
export const SCALE = 1.5;

/** Quy đổi một số đo px trong mockup sang pt trên máy thật. */
export const px = (mockupPx: number) => Math.round(mockupPx * SCALE);

/** Khoảng cách — bám nhịp 4pt. */
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  section: 32,
  page: 40,
} as const;

/** Bo góc. `.field` 12→18, `.p-item` 13→20, thẻ 16→24, `--radius` 18→28. */
export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
} as const;

/** Cỡ icon — thay cho các giá trị 13/14/15/16/17/24/30/32/44 rải rác trong mockup. */
export const IconSize = {
  xs: 20,
  sm: 22,
  md: 24,
  lg: 26,
  xl: 36,
  xxl: 48,
  hero: 66,
} as const;

/** Lề ngang chuẩn của mọi màn (mockup 16 → 20 sau khi dồn phần dôi). */
export const SCREEN_PADDING = 20;

/** Chiều cao tối thiểu vùng chạm — Apple HIG 44pt. */
export const MIN_TOUCH = 44;

/** Thời lượng chuyển động, giữ trong khoảng 150–300ms. */
export const Duration = {
  fast: 150,
  base: 200,
  slow: 300,
} as const;
