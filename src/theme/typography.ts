import type { TextStyle } from 'react-native';

/**
 * Kiểu chữ quy đổi từ `bản-đẹp.html` (gốc `html{font-size:15px}` nên 1rem = 15px).
 * 23 cỡ chữ rời rạc trong mockup được gom về 8 bậc sau khi nhân SCALE = 1.5.
 */
export const FontFamily = {
  regular: 'BeVietnamPro_400Regular',
  medium: 'BeVietnamPro_500Medium',
  semibold: 'BeVietnamPro_600SemiBold',
  bold: 'BeVietnamPro_700Bold',
  extrabold: 'BeVietnamPro_800ExtraBold',
} as const;

/** Cỡ chữ theo bậc. Chú thích là khoảng rem tương ứng trong mockup. */
export const FontSize = {
  caption: 12, // .54–.60rem — nhãn tab bar, hint nhỏ, chuỗi hash
  micro: 14, // .62–.68rem — phụ đề, nhãn cột bảng
  body: 16, // .70–.76rem — p-item, nội dung chính
  title: 18, // .78–.84rem — nút chính, tiêu đề màn
  heading: 20, // .88–.95rem — tên sản phẩm
  display: 24, // 1.00–1.15rem — số dư ví
  figure: 30, // 1.30rem — số tiền hồ sơ vay
  hero: 36, // 1.50–1.60rem — tổng thanh toán
} as const;

/** `body{line-height:1.55}` và `h1,h2,h3{line-height:1.26}` của mockup. */
export const LineHeight = {
  body: 1.55,
  heading: 1.26,
} as const;

/** Tính lineHeight tuyệt đối cho một cỡ chữ. */
export const lh = (size: number, ratio: number = LineHeight.body) =>
  Math.round(size * ratio);

/**
 * Bộ style chữ dùng sẵn.
 * `letterSpacing`: mockup dùng −.02em cho tiêu đề và +.05em cho nhãn chữ hoa.
 */
export const Text_: Record<string, TextStyle> = {
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption),
  },
  captionBold: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption),
  },
  micro: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.micro,
    lineHeight: lh(FontSize.micro),
  },
  microBold: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.micro,
    lineHeight: lh(FontSize.micro),
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body),
  },
  bodyBold: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body),
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.title,
    lineHeight: lh(FontSize.title, LineHeight.heading),
    letterSpacing: -0.36,
  },
  heading: {
    fontFamily: FontFamily.extrabold,
    fontSize: FontSize.heading,
    lineHeight: lh(FontSize.heading, LineHeight.heading),
    letterSpacing: -0.4,
  },
  display: {
    fontFamily: FontFamily.extrabold,
    fontSize: FontSize.display,
    lineHeight: lh(FontSize.display, LineHeight.heading),
    letterSpacing: -0.48,
  },
  figure: {
    fontFamily: FontFamily.extrabold,
    fontSize: FontSize.figure,
    lineHeight: lh(FontSize.figure, LineHeight.heading),
    letterSpacing: -0.6,
  },
  hero: {
    fontFamily: FontFamily.extrabold,
    fontSize: FontSize.hero,
    lineHeight: lh(FontSize.hero, LineHeight.heading),
    letterSpacing: -0.72,
  },
  /** Nhãn chữ hoa nhỏ, lặp khoảng 20 lần trong mockup. */
  sectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.micro,
    lineHeight: lh(FontSize.micro),
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
};

/** Số liệu tài chính dùng chữ số đều bề ngang để cột không nhảy. */
export const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };
