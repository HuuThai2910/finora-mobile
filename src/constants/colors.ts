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

  // Nhóm màn tài khoản theo mockup đăng nhập mới (25/09/2026), đo trực tiếp
  // từ ảnh mockup. Các màn khác vẫn dùng bảng màu cũ cho tới khi được vẽ lại.
  authPrimary: '#1a60e0',
  authLogoLight: '#3fc6ff',
  authInk: '#0a2c68',
  authLabel: '#273548',
  authMuted: '#5f6b82',
  authBorder: '#dfe5ee',
  authControl: '#b7c1d1',
  authNoteBg: '#ebf2fe',
  authNoteText: '#1e3f98',
  authFocusBg: '#f4f8ff',

  // Các màn sau đăng nhập vẽ lại theo cùng bộ mockup (26/09/2026, bắt đầu từ
  // trang chủ). Chữ, màu nhấn và nền ô nhạt dùng lại nhóm auth* ở trên; dưới
  // đây là những màu bộ mockup này mới có, đo trực tiếp từ ảnh.
  // Ba màu nền khớp ảnh `home-background.png`: hàng trên cùng (lộ ra khi kéo
  // làm mới) và hai đầu dải nền trơn nối giữa lớp sóng trên và lớp sóng đáy.
  homeWaveTop: '#f2f9fd',
  homeWaveMid: '#f0f8fe',
  homeWaveLow: '#e8f4fe',
  /** Chuông thông báo: nhạt như mockup nhưng vẫn đạt tương phản 3:1 của icon. */
  bellMuted: '#5b87d8',
  /** Thẻ ví: tối ở góc dưới-trái (dưới chữ), sáng dần lên góc trên-phải (chỗ mascot). */
  walletFrom: '#133f95',
  walletVia: '#1a56c2',
  walletTo: '#2487fd',
  walletTile: 'rgba(255,255,255,0.18)',
  walletChip: 'rgba(255,255,255,0.16)',
  /** Thẻ kính mờ nằm trên nền sóng. */
  glass: 'rgba(255,255,255,0.62)',
  glassBorder: 'rgba(255,255,255,0.9)',
  dotIdle: '#a9b6d3',
  rowDivider: '#edf2fa',
  tintGreen: '#e2f6ec',
  tintBlue: '#e9f1fd',
  chevronMuted: '#a3aac2',
  /** Bóng thẻ ngả xanh cho hợp nền sóng, thay cho bóng xám mặc định. */
  cardShadow: '#1a4fb8',
  /** Nút tròn mũi tên trên thẻ giới thiệu: xanh chủ đạo pha trong như mockup. */
  chipBlue: 'rgba(26,96,224,0.24)',
  /** Quầng sáng sau hình minh hoạ của thẻ giới thiệu. */
  glowBlue: 'rgba(26,96,224,0.10)',

  // Màn "Sản phẩm vay" (mockup 26/09/2026). Chữ, ô nhạt và đường kẻ dùng lại
  // các màu ở trên; riêng màu dưới đây đo từ ảnh `products-background.png`.
  /**
   * Màu dải nền trơn giữa hai lớp sóng: lót dưới ảnh nền lúc ảnh chưa nạp xong
   * và phủ hai bên cột nội dung trên web, để không lộ mảng trắng lệch tông.
   */
  productsBackdrop: '#f1f7fe',
  /**
   * Cùng màu trên nhưng trong suốt hẳn — điểm cuối của dải mờ ở hai mép cột trên
   * màn rộng. Không dùng 'transparent' vì iOS/Android hiểu là đen trong suốt, dải
   * màu sẽ ngả xám ở giữa.
   */
  productsBackdropClear: 'rgba(241,247,254,0)',

  // Màn "Hồ sơ vay" (mockup 26/09/2026). Chữ, ô nhạt, nhãn trạng thái dùng lại
  // các màu ở trên; riêng màu dưới đây đo bằng PIL từ `applications-background.png`.
  /**
   * Hàng 800 của ảnh — đường cắt giữa nửa trên (sóng + hình minh hoạ) và nửa
   * dưới (sóng đáy). Hàng này lệch màu theo chiều ngang chưa tới 1/255 nên lấp
   * khoảng hở giữa hai nửa bằng đúng màu này thì không lộ vết nối.
   */
  applicationsBackdrop: '#fafcfe',
  /**
   * Hàng trên cùng của ảnh đổi màu dần từ trái sang phải; bốn điểm dưới đây
   * (vị trí 0 · 0,45 · 0,8 · 1) dựng lại hàng đó, lệch tối đa ~2/255. Dùng phủ
   * dải phía trên ảnh — sau thanh trạng thái và khi kéo làm mới.
   */
  applicationsSkyLeft: '#ecf6fd',
  applicationsSkyMid: '#eaf5fe',
  applicationsSkyDeep: '#e1f0fe',
  applicationsSkyRight: '#e2f1fd',

  // Luồng nhập khoản vay ba bước (mockup "Nhập khoản vay" 26/09/2026). Chữ, nút,
  // chip, ô ghi chú dùng lại nhóm auth*/tint* ở trên; dưới đây chỉ là quầng sáng
  // tròn sau hình thẻ + khiên, đo bằng PIL (≈ #e2effd trên nền #f1f8fe).
  loanGlow: 'rgba(26,96,224,0.08)',
  /** Cùng màu nhưng trong suốt hẳn; 'transparent' trên iOS/Android là đen trong suốt, dải màu sẽ ngả xám. */
  loanGlowClear: 'rgba(26,96,224,0)',

  // Bước 2/3 "Xác nhận khoản vay" (mockup 26/09/2026). Chữ, ô tổng trả/tổng lãi,
  // đường kẻ dùng lại nhóm auth*/tint*/rowDivider ở trên; màu dưới đây đo bằng PIL.
  /**
   * Nền ô gốc/lãi/phí/phạt và chip ngày trong thẻ từng kỳ (ảnh: #f1f6fc–#f5f9fe):
   * nhạt hơn `tintBlue` để ô biểu tượng `tintBlue` nằm bên trong vẫn nổi lên.
   */
  scheduleTile: '#f3f7fd',
  /**
   * Số "tổng lãi" trên ô `tintGreen`. Xanh của mockup (#00aa5c) và `green` chỉ đạt
   * ~2,6–3,3:1 trên nền này; tông này giữ sắc xanh lá mà đạt 4,59:1 (AA chữ thường —
   * 18pt của RN vẫn dưới ngưỡng "chữ lớn" 18,66px của WCAG).
   */
  scheduleGreenText: '#0a7d4f',

  // Bước 1/3 "Nhập khoản vay": lớp phủ quanh nút "Tiếp tục" ghim đáy, để nội dung
  // cuộn ra sau nút mờ dần thay vì bị cắt ngang. Cùng màu `productsBackdrop` (nền
  // sóng) nhưng còn thấy lớp sóng phía sau.
  loanFooterVeil: 'rgba(241,247,254,0.92)',

  // Bước 3/3 "Nộp hồ sơ" (mockup 26/09/2026). Dòng nhập, hộp ghi chú, ô đồng ý
  // dùng lại nhóm auth*/tint*/rowDivider ở trên; dưới đây chỉ là lớp tối phủ màn
  // khi mở bảng chọn (mục đích vay, học vấn, nhà ở): lấy tông `authInk` pha trong
  // để nền sóng vẫn lộ ra mà bảng chọn trắng tách hẳn khỏi màn.
  applyFormScrim: 'rgba(10,44,104,0.36)',
} as const;

export type ColorName = keyof typeof Colors;
