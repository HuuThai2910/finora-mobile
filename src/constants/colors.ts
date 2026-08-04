/**
 * Bảng màu lấy nguyên từ khối `:root` của `bản-đẹp.html`
 * — design system "Sapphire & Cyan".
 * Không đặt mã màu trực tiếp trong component; luôn tham chiếu qua đây.
 */
export const Colors = {
  // Thương hiệu — sapphire
  brand: '#1d4ed8',
  brand600: '#1e40af',
  brand700: '#172e8f',
  brand50: '#eef3fe',
  brand100: '#d6e2fd',

  // Nền canvas + bề mặt tối
  navy: '#0b1836',
  appBg: '#e9eef8',

  // Nhấn cyan — AI / blockchain
  cyan: '#06b6d4',
  cyanBright: '#22d3ee',

  // Mực & nền
  ink: '#0f1b30',
  ink2: '#4a5670',
  ink3: '#8793ab',
  bg: '#edf1fa',
  card: '#ffffff',
  line: '#e2e8f4',

  // Semantic
  emerald: '#059669',
  emeraldBg: '#d1fae5',
  green: '#059669',
  greenBg: '#d1fae5',
  red: '#e11d2e',
  redBg: '#fde3e5',
  amber: '#d97706',
  amberBg: '#fef3c7',
  blue: '#2563eb',
  blueBg: '#dbeafe',
  violet: '#0e7490',
  violetBg: '#cffafe',
  grayBg: '#e6ebf4',

  // Hạng tín dụng A–D — dùng chung cho ScoreRing và biểu đồ
  scoreA: '#34d399',
  scoreB: '#60a5fa',
  scoreC: '#fbbf24',
  scoreD: '#f87171',

  // Nền của vòng hạng tín dụng
  scoreABg: '#d1fae5',
  scoreBBg: '#dbeafe',
  scoreCBg: '#fef3c7',
  scoreDBg: '#fde3e5',

  // Rãnh thanh tiến độ (`.pb` background)
  progressTrack: '#dde5f3',

  // Màu chữ của tag — mockup dùng tông đậm hơn nền để đủ tương phản
  tagGreenText: '#065f46',
  tagRedText: '#a11221',
  tagAmberText: '#92400e',
  tagBlueText: '#1e40af',
  tagVioletText: '#155e75',
  tagGrayText: '#3a4560',

  // Màu viền của tag
  tagGreenBorder: '#a7e3c8',
  tagRedBorder: '#f4c2c7',
  tagAmberBorder: '#f3d98f',
  tagBlueBorder: '#bcd3fb',
  tagVioletBorder: '#a5eaf3',
  tagGrayBorder: '#d2dbeb',

  // Nền phụ
  surfaceMuted: '#f1f5f9',
  surfaceSubtle: '#fbfcfe',
  warnBg: '#fffbeb',
  warnBorder: '#fde68a',
  warnText: '#78350f',

  // Chữ trên nền tối
  onDark: '#ffffff',
  onDarkMuted: 'rgba(255,255,255,0.78)',
  onDarkFaint: 'rgba(255,255,255,0.15)',
} as const;

export type ColorName = keyof typeof Colors;
