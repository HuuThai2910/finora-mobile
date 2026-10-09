import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing } from '@/theme';

/**
 * Kiểu chung của các ô trong biểu mẫu đề nghị cơ cấu, theo ô nhập của màn "Nạp tiền vào ví"
 * và bước nhập khoản vay: nhãn đậm vừa, khung viền nhạt bo 12pt, viền xanh khi đang gõ,
 * viền đỏ kèm câu báo khi sai. Viền giữ nguyên độ dày ở mọi trạng thái, chỉ đổi màu, để chữ
 * trong ô không xê dịch khi focus.
 */
export const rescheduleFieldStyles = StyleSheet.create({
  section: { gap: Spacing.sm },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: Spacing.md },
  label: { flexShrink: 1, fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authLabel },
  required: { color: Colors.red },
  aside: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  box: {
    minHeight: MIN_TOUCH + Spacing.xs,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.authBorder,
    borderRadius: 12,
    backgroundColor: Colors.card,
  },
  boxFocused: { borderColor: Colors.authPrimary, backgroundColor: Colors.authFocusBg },
  boxInvalid: { borderColor: Colors.red },
  input: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: FontFamily.semibold,
    // ≥16 để Safari trên điện thoại không tự phóng to trang khi chạm vào ô.
    fontSize: 16,
    color: Colors.authInk,
    // Trên web trình duyệt tự vẽ khung focus; viền ô đã báo focus rồi.
    outlineStyle: 'solid',
    outlineWidth: 0,
  },
  helper: { fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 18, color: Colors.authMuted },
  error: { fontFamily: FontFamily.medium, fontSize: 12.5, lineHeight: 18, color: Colors.tagRedText },
  pressed: { opacity: 0.7 },
  // Thanh "Xong" trên bàn phím số của iOS (bàn phím này không có phím Return).
  accessory: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.authFocusBg,
    borderTopWidth: 1,
    borderTopColor: Colors.authBorder,
  },
  accessoryButton: { minHeight: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  accessoryText: { fontFamily: FontFamily.semibold, fontSize: 16, color: Colors.authPrimary },
  chip: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    backgroundColor: Colors.card,
  },
  chipSelected: { borderColor: Colors.authPrimary, backgroundColor: Colors.tintBlue },
});
