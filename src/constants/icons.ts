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
} satisfies Record<string, IconShape[]>;

export type IconName = keyof typeof ICONS;
