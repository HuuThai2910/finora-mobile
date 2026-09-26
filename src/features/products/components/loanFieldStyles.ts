import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, lh } from '@/theme';

/**
 * Kiểu chữ và khoảng cách chung của ba mục nhập ở bước 1 (số tiền, kỳ hạn, ngày
 * giải ngân), để ba mục thẳng hàng và cùng nhịp như mockup.
 */
export const loanFieldStyles = StyleSheet.create({
  section: { gap: Spacing.md },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  // Nhãn mục và chữ phụ bên phải đều được xuống dòng khi chữ phóng to, không tràn.
  label: {
    flexShrink: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body, 1.4),
    color: Colors.authInk,
  },
  required: { color: Colors.red },
  aside: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption, 1.4),
    color: Colors.authMuted,
  },
  helper: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption, 1.5),
    color: Colors.authMuted,
  },
  error: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption, 1.5),
    color: Colors.red,
  },
});
