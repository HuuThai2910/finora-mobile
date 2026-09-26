/**
 * Bộ icon port nguyên từ hàm `IC()` của `bản-đẹp.html` (bộ Lucide, viewBox 24×24,
 * stroke-width 2, linecap/linejoin round).
 *
 * Mockup trả về chuỗi SVG; ở đây mô tả bằng dữ liệu để `<Icon>` dựng lại bằng
 * react-native-svg. Giữ nguyên toạ độ để nét vẽ khớp từng chi tiết.
 */
export type IconShape =
  | { t: 'path'; d: string }
  | { t: 'circle'; cx: number; cy: number; r: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; rx?: number }
  | { t: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { t: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { t: 'polyline'; points: string };

export const ICONS = {
  home: [
    { t: 'path', d: 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { t: 'polyline', points: '9 22 9 12 15 12 15 22' },
  ],
  id: [
    { t: 'rect', x: 3, y: 5, w: 18, h: 14, rx: 2 },
    { t: 'circle', cx: 8.5, cy: 11, r: 2 },
    { t: 'path', d: 'M13 10h5' },
    { t: 'path', d: 'M13 14h5' },
    { t: 'path', d: 'M5.5 17c.7-1.2 1.8-2 3-2s2.3.8 3 2' },
  ],
  file: [
    { t: 'path', d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' },
    { t: 'path', d: 'M14 2v4a2 2 0 0 0 2 2h4' },
  ],
  wallet: [
    {
      t: 'path',
      d: 'M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1',
    },
    { t: 'path', d: 'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4' },
  ],
  coins: [
    { t: 'circle', cx: 8, cy: 8, r: 6 },
    { t: 'path', d: 'M18.09 10.37A6 6 0 1 1 10.34 18' },
    { t: 'path', d: 'M7 6h1v4' },
    { t: 'path', d: 'm16.71 13.88.7.71-2.82 2.82' },
  ],
  chart: [
    { t: 'path', d: 'M3 3v16a2 2 0 0 0 2 2h16' },
    { t: 'path', d: 'M18 17V9' },
    { t: 'path', d: 'M13 17V5' },
    { t: 'path', d: 'M8 17v-3' },
  ],
  shield: [
    {
      t: 'path',
      d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
    },
  ],
  users: [
    { t: 'path', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' },
    { t: 'circle', cx: 9, cy: 7, r: 4 },
    { t: 'path', d: 'M22 21v-2a4 4 0 0 0-3-3.87' },
    { t: 'path', d: 'M16 3.13a4 4 0 0 1 0 7.75' },
  ],
  chain: [
    { t: 'path', d: 'M12 2 3 7v10l9 5 9-5V7l-9-5z' },
    { t: 'path', d: 'M12 22V12' },
    { t: 'path', d: 'm3 7 9 5 9-5' },
  ],
  bank: [
    { t: 'path', d: 'M3 21h18' },
    { t: 'path', d: 'M5 21V10' },
    { t: 'path', d: 'M19 21V10' },
    { t: 'path', d: 'M4 10h16L12 3 4 10Z' },
    { t: 'path', d: 'M9 21v-6h6v6' },
  ],
  sparkles: [
    {
      t: 'path',
      d: 'm12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z',
    },
  ],
  bell: [
    { t: 'path', d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' },
    { t: 'path', d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0' },
  ],
  check: [{ t: 'path', d: 'M20 6 9 17l-5-5' }],
  x: [
    { t: 'path', d: 'M18 6 6 18' },
    { t: 'path', d: 'm6 6 12 12' },
  ],
  search: [
    { t: 'circle', cx: 11, cy: 11, r: 8 },
    { t: 'path', d: 'm21 21-4.3-4.3' },
  ],
  scan: [
    { t: 'path', d: 'M3 7V5a2 2 0 0 1 2-2h2' },
    { t: 'path', d: 'M17 3h2a2 2 0 0 1 2 2v2' },
    { t: 'path', d: 'M21 17v2a2 2 0 0 1-2 2h-2' },
    { t: 'path', d: 'M7 21H5a2 2 0 0 1-2-2v-2' },
    { t: 'circle', cx: 12, cy: 12, r: 3 },
  ],
  pen: [
    {
      t: 'path',
      d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
    },
  ],
  layers: [
    {
      t: 'path',
      d: 'm12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z',
    },
    { t: 'path', d: 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65' },
    { t: 'path', d: 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65' },
  ],
  workflow: [
    { t: 'rect', x: 3, y: 3, w: 8, h: 8, rx: 2 },
    { t: 'path', d: 'M7 11v4a2 2 0 0 0 2 2h4' },
    { t: 'rect', x: 13, y: 13, w: 8, h: 8, rx: 2 },
  ],
  alert: [
    { t: 'path', d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' },
    { t: 'path', d: 'M12 9v4' },
    { t: 'path', d: 'M12 17h.01' },
  ],
  gavel: [
    { t: 'path', d: 'm14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8' },
    { t: 'path', d: 'm16 16 6-6' },
    { t: 'path', d: 'm8 8 6-6' },
    { t: 'path', d: 'm9 7 8 8' },
    { t: 'path', d: 'm21 11-8-8' },
  ],
  download: [
    { t: 'path', d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' },
    { t: 'polyline', points: '7 10 12 15 17 10' },
    { t: 'line', x1: 12, y1: 15, x2: 12, y2: 3 },
  ],
  phone: [
    { t: 'rect', x: 5, y: 2, w: 14, h: 20, rx: 2 },
    { t: 'path', d: 'M12 18h.01' },
  ],
  grid: [
    { t: 'rect', x: 3, y: 3, w: 7, h: 7, rx: 1 },
    { t: 'rect', x: 14, y: 3, w: 7, h: 7, rx: 1 },
    { t: 'rect', x: 14, y: 14, w: 7, h: 7, rx: 1 },
    { t: 'rect', x: 3, y: 14, w: 7, h: 7, rx: 1 },
  ],
  robot: [
    { t: 'path', d: 'M12 8V4H8' },
    { t: 'rect', x: 4, y: 8, w: 16, h: 12, rx: 2 },
    { t: 'path', d: 'M2 14h2' },
    { t: 'path', d: 'M20 14h2' },
    { t: 'path', d: 'M15 13v2' },
    { t: 'path', d: 'M9 13v2' },
  ],
  clock: [
    { t: 'circle', cx: 12, cy: 12, r: 10 },
    { t: 'polyline', points: '12 6 12 12 16 14' },
  ],
  zap: [
    {
      t: 'path',
      d: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z',
    },
  ],
  database: [
    { t: 'ellipse', cx: 12, cy: 5, rx: 9, ry: 3 },
    { t: 'path', d: 'M3 5V19A9 3 0 0 0 21 19V5' },
    { t: 'path', d: 'M3 12A9 3 0 0 0 21 12' },
  ],
  logout: [
    { t: 'path', d: 'M18.36 6.64A9 9 0 1 1 5.64 6.64' },
    { t: 'line', x1: 12, y1: 2, x2: 12, y2: 12 },
  ],
  // Hai icon dưới đây không có trong mockup vì mockup là ảnh tĩnh, không có
  // điều hướng. App thật cần nút quay lại nhìn thấy được (Android không có
  // cử chỉ vuốt-về như iOS) nên bổ sung, vẫn giữ đúng bộ Lucide.
  chevronLeft: [{ t: 'path', d: 'm15 18-6-6 6-6' }],
  chevronRight: [{ t: 'path', d: 'm9 18 6-6-6-6' }],
  // Cặp icon ẩn/hiện mật khẩu — mockup không có form thật nên bổ sung từ Lucide.
  eye: [
    {
      t: 'path',
      d: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0',
    },
    { t: 'circle', cx: 12, cy: 12, r: 3 },
  ],
  eyeOff: [
    {
      t: 'path',
      d: 'M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49',
    },
    { t: 'path', d: 'M14.084 14.158a3 3 0 0 1-4.242-4.242' },
    {
      t: 'path',
      d: 'M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143',
    },
    { t: 'path', d: 'm2 2 20 20' },
  ],
  // Ba icon của màn đăng nhập mới (ô email, ô mật khẩu, nút gửi), lấy từ Lucide.
  mail: [
    { t: 'rect', x: 2, y: 4, w: 20, h: 16, rx: 2 },
    { t: 'path', d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' },
  ],
  lock: [
    { t: 'circle', cx: 12, cy: 16, r: 1 },
    { t: 'rect', x: 3, y: 10, w: 18, h: 12, rx: 2 },
    { t: 'path', d: 'M7 10V7a5 5 0 0 1 10 0v3' },
  ],
  arrowRight: [
    { t: 'path', d: 'M5 12h14' },
    { t: 'path', d: 'm12 5 7 7-7 7' },
  ],
  // Hộp thông tin ở màn quên mật khẩu.
  info: [
    { t: 'circle', cx: 12, cy: 12, r: 10 },
    { t: 'path', d: 'M12 16v-4' },
    { t: 'path', d: 'M12 8h.01' },
  ],
  // Trang chủ theo mockup mới: hồ sơ vay gần nhất, giao dịch chuyển đi và hình
  // minh hoạ của ba thẻ giới thiệu (Lucide).
  fileText: [
    { t: 'path', d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' },
    { t: 'path', d: 'M14 2v4a2 2 0 0 0 2 2h4' },
    { t: 'path', d: 'M10 9H8' },
    { t: 'path', d: 'M16 13H8' },
    { t: 'path', d: 'M16 17H8' },
  ],
  arrowUpRight: [
    { t: 'path', d: 'M7 7h10v10' },
    { t: 'path', d: 'M7 17 17 7' },
  ],
  clipboardCheck: [
    { t: 'rect', x: 8, y: 2, w: 8, h: 4, rx: 1 },
    { t: 'path', d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' },
    { t: 'path', d: 'm9 14 2 2 4-4' },
  ],
  qrCode: [
    { t: 'rect', x: 3, y: 3, w: 5, h: 5, rx: 1 },
    { t: 'rect', x: 16, y: 3, w: 5, h: 5, rx: 1 },
    { t: 'rect', x: 3, y: 16, w: 5, h: 5, rx: 1 },
    { t: 'path', d: 'M21 16h-3a2 2 0 0 0-2 2v3' },
    { t: 'path', d: 'M21 21v.01' },
    { t: 'path', d: 'M12 7v3a2 2 0 0 1-2 2H7' },
    { t: 'path', d: 'M3 12h.01' },
    { t: 'path', d: 'M12 3h.01' },
    { t: 'path', d: 'M12 16v.01' },
    { t: 'path', d: 'M16 12h1' },
    { t: 'path', d: 'M21 12v.01' },
    { t: 'path', d: 'M12 21v-1' },
  ],
  calendarCheck: [
    { t: 'path', d: 'M8 2v4' },
    { t: 'path', d: 'M16 2v4' },
    { t: 'rect', x: 3, y: 4, w: 18, h: 18, rx: 2 },
    { t: 'path', d: 'M3 10h18' },
    { t: 'path', d: 'm9 16 2 2 4-4' },
  ],
  // Màn "Sản phẩm vay" theo mockup mới (26/09/2026): ô biểu tượng của thẻ sản
  // phẩm (túi mua sắm = vay tiêu dùng, cửa hàng = vay kinh doanh) và của dòng
  // khung lãi suất, kỳ hạn. Chép nguyên từ lucide-static 1.48.0.
  shoppingBag: [
    { t: 'path', d: 'M16 10a4 4 0 0 1-8 0' },
    { t: 'path', d: 'M3.103 6.034h17.794' },
    {
      t: 'path',
      d: 'M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z',
    },
  ],
  store: [
    { t: 'path', d: 'M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5' },
    {
      t: 'path',
      d: 'M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244',
    },
    { t: 'path', d: 'M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05' },
  ],
  percent: [
    { t: 'line', x1: 19, y1: 5, x2: 5, y2: 19 },
    { t: 'circle', cx: 6.5, cy: 6.5, r: 2.5 },
    { t: 'circle', cx: 17.5, cy: 17.5, r: 2.5 },
  ],
  calendar: [
    { t: 'path', d: 'M8 2v3' },
    { t: 'path', d: 'M16 2v3' },
    { t: 'rect', x: 3, y: 3, w: 18, h: 18, rx: 2 },
    { t: 'path', d: 'M3 9h18' },
  ],
  // Màn "Hồ sơ" theo mockup mới (26/09/2026): tiêu đề các nhóm cài đặt, nhãn
  // trạng thái định danh (khiên có dấu tích / dấu chấm than) và ô biểu tượng
  // của các dòng cài đặt. Chép nguyên từ lucide-static 1.48.0.
  user: [
    { t: 'path', d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' },
    { t: 'circle', cx: 12, cy: 7, r: 4 },
  ],
  shieldCheck: [
    {
      t: 'path',
      d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
    },
    { t: 'path', d: 'm9 12 2 2 4-4' },
  ],
  shieldAlert: [
    {
      t: 'path',
      d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
    },
    { t: 'path', d: 'M12 8v4' },
    { t: 'path', d: 'M12 16h.01' },
  ],
  scanFace: [
    { t: 'path', d: 'M3 7V5a2 2 0 0 1 2-2h2' },
    { t: 'path', d: 'M17 3h2a2 2 0 0 1 2 2v2' },
    { t: 'path', d: 'M21 17v2a2 2 0 0 1-2 2h-2' },
    { t: 'path', d: 'M7 21H5a2 2 0 0 1-2-2v-2' },
    { t: 'path', d: 'M8 14s1.5 2 4 2 4-2 4-2' },
    { t: 'path', d: 'M9 9h.01' },
    { t: 'path', d: 'M15 9h.01' },
  ],
  penLine: [
    { t: 'path', d: 'M13 21h8' },
    {
      t: 'path',
      d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
    },
  ],
  fileCog: [
    { t: 'path', d: 'M15 8a1 1 0 0 1-1-1V2a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8z' },
    { t: 'path', d: 'M20 8v12a2 2 0 0 1-2 2h-4.182' },
    { t: 'path', d: 'm3.305 19.53.923-.382' },
    { t: 'path', d: 'M4 10.592V4a2 2 0 0 1 2-2h8' },
    { t: 'path', d: 'm4.228 16.852-.924-.383' },
    { t: 'path', d: 'm5.852 15.228-.383-.923' },
    { t: 'path', d: 'm5.852 20.772-.383.924' },
    { t: 'path', d: 'm8.148 15.228.383-.923' },
    { t: 'path', d: 'm8.53 21.696-.382-.924' },
    { t: 'path', d: 'm9.773 16.852.922-.383' },
    { t: 'path', d: 'm9.773 19.148.922.383' },
    { t: 'circle', cx: 7, cy: 18, r: 3 },
  ],
  // Màn "Hồ sơ vay" theo mockup mới (26/09/2026): ô biểu tượng của thẻ hồ sơ
  // theo mục đích vay (enum `LoanPurpose` của finora-loan) và dấu ✓/✕ trong
  // vòng tròn của nhãn trạng thái. Chép nguyên từ lucide-static 1.48.0.
  car: [
    {
      t: 'path',
      d: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2',
    },
    { t: 'circle', cx: 7, cy: 17, r: 2 },
    { t: 'path', d: 'M9 17h6' },
    { t: 'circle', cx: 17, cy: 17, r: 2 },
  ],
  graduationCap: [
    {
      t: 'path',
      d: 'M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z',
    },
    { t: 'path', d: 'M22 10v6' },
    { t: 'path', d: 'M6 12.5V16a6 3 0 0 0 12 0v-3.5' },
  ],
  briefcase: [
    { t: 'path', d: 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' },
    { t: 'rect', x: 2, y: 6, w: 20, h: 14, rx: 2 },
  ],
  creditCard: [
    { t: 'rect', x: 2, y: 5, w: 20, h: 14, rx: 2 },
    { t: 'line', x1: 2, y1: 10, x2: 22, y2: 10 },
    { t: 'path', d: 'M6 14h2' },
  ],
  heartPulse: [
    {
      t: 'path',
      d: 'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5',
    },
    { t: 'path', d: 'M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27' },
  ],
  truck: [
    { t: 'path', d: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' },
    { t: 'path', d: 'M15 18H9' },
    {
      t: 'path',
      d: 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14',
    },
    { t: 'circle', cx: 17, cy: 18, r: 2 },
    { t: 'circle', cx: 7, cy: 18, r: 2 },
  ],
  plane: [
    {
      t: 'path',
      d: 'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z',
    },
  ],
  circleCheck: [
    { t: 'circle', cx: 12, cy: 12, r: 10 },
    { t: 'path', d: 'm16 9-5.5 5.5L8 12' },
  ],
  circleX: [
    { t: 'circle', cx: 12, cy: 12, r: 10 },
    { t: 'path', d: 'm15 9-6 6' },
    { t: 'path', d: 'm9 9 6 6' },
  ],
  // Màn "Chi tiết hồ sơ vay" theo mockup mới (26/09/2026): ô biểu tượng của
  // lãi suất (cột không trục) và hình thức trả (hai mũi tên vòng) ở thẻ tóm tắt.
  // Chép nguyên từ lucide-static 1.48.0.
  chartNoAxesColumn: [
    { t: 'path', d: 'M5 21v-6' },
    { t: 'path', d: 'M12 21V3' },
    { t: 'path', d: 'M19 21V9' },
  ],
  refreshCw: [
    { t: 'path', d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' },
    { t: 'path', d: 'M21 3v5h-5' },
    { t: 'path', d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' },
    { t: 'path', d: 'M8 16H3v5' },
  ],
  // Màn "Nhập khoản vay" theo mockup mới (26/09/2026): hai nút giảm/tăng của bộ
  // chọn số tiền và kỳ hạn. Chép nguyên từ lucide-static 1.48.0.
  minus: [{ t: 'path', d: 'M5 12h14' }],
  plus: [
    { t: 'path', d: 'M5 12h14' },
    { t: 'path', d: 'M12 5v14' },
  ],
  // Màn "Xác nhận khoản vay" (bước 2/3, mockup 26/09/2026): mũi tên mở/thu gọn
  // thẻ từng kỳ của lịch trả. Chép nguyên từ Lucide (chevron-down / chevron-up).
  chevronDown: [{ t: 'path', d: 'm6 9 6 6 6-6' }],
  chevronUp: [{ t: 'path', d: 'm18 15-6-6-6 6' }],
  // Màn "Nộp hồ sơ" (bước 3/3, mockup 26/09/2026): ô biểu tượng của dòng "Mục
  // đích vay". Chép nguyên từ lucide-static 1.48.0.
  target: [
    { t: 'circle', cx: 12, cy: 12, r: 10 },
    { t: 'circle', cx: 12, cy: 12, r: 6 },
    { t: 'circle', cx: 12, cy: 12, r: 2 },
  ],
  // Màn "Thông tin tài khoản" (mockup 26/09/2026): ô biểu tượng của dòng Quê quán
  // (ghim bản đồ) và dòng Giới tính (♂ / ♀ theo giá trị hồ sơ). Chép nguyên từ
  // lucide-static 1.48.0 (map-pin, mars, venus).
  mapPin: [
    {
      t: 'path',
      d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0',
    },
    { t: 'circle', cx: 12, cy: 10, r: 3 },
  ],
  mars: [
    { t: 'path', d: 'M16 3h5v5' },
    { t: 'path', d: 'm21 3-6.75 6.75' },
    { t: 'circle', cx: 10, cy: 14, r: 6 },
  ],
  venus: [
    { t: 'path', d: 'M12 15v7' },
    { t: 'path', d: 'M9 19h6' },
    { t: 'circle', cx: 12, cy: 9, r: 6 },
  ],
} satisfies Record<string, IconShape[]>;

export type IconName = keyof typeof ICONS;
