import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, FontSize, IconSize, Radius, Spacing, lh } from '@/theme';

type Props = {
  icon: IconName;
  label: string;
  /** Viền xanh: ô đang được gõ, hoặc bảng chọn của dòng đang mở. */
  focused?: boolean;
  /** Lỗi thay chỗ dòng gợi ý và tô đỏ viền dòng. */
  error?: string;
  helper?: string;
  /** Mũi tên chỉ dành cho dòng mở bảng chọn; ô gõ chữ không có để không gây hiểu nhầm. */
  trailing?: React.ReactNode;
  /**
   * Thuộc tính chạm/trợ năng của cả dòng. Dòng chọn đặt vai trò nút; dòng gõ chữ để `accessible={false}` cho
   * trình đọc màn hình đọc thẳng ô nhập bên trong.
   */
  pressable: Omit<PressableProps, 'style' | 'children'>;
  /** Nhãn nhìn thấy đã nằm trong nhãn đọc của dòng/ô nhập; ẩn đi để không đọc hai lần. */
  hideLabelFromReader?: boolean;
  children: React.ReactNode;
};

/** Số đo dòng nhập theo bộ mockup mới (cùng dòng nhập ở bước "Nộp hồ sơ"). */
const ROW_MIN_HEIGHT = 64;
const TILE_SIZE = 40;

/**
 * Khung một dòng nhập của form rút tiền: ô biểu tượng xanh nhạt bên trái, nhãn nhỏ và giá trị bên dưới, đuôi tuỳ
 * chọn bên phải. Viền giữ nguyên độ dày ở mọi trạng thái, chỉ đổi màu, để nội dung không xê dịch khi focus; lỗi vừa
 * tô đỏ viền vừa có câu chữ bên dưới để không chỉ dựa vào màu.
 */
export default function WithdrawField({
  icon,
  label,
  focused = false,
  error,
  helper,
  trailing,
  pressable,
  hideLabelFromReader = false,
  children,
}: Props) {
  return (
    <View>
      <Pressable {...pressable} style={[styles.row, focused && styles.rowFocused, !!error && styles.rowError]}>
        <View style={styles.tile}>
          <Icon name={icon} size={IconSize.xs} color={Colors.authPrimary} strokeWidth={1.9} />
        </View>
        <View style={styles.body}>
          <Text
            style={styles.label}
            maxFontSizeMultiplier={1.4}
            accessibilityElementsHidden={hideLabelFromReader}
            importantForAccessibility={hideLabelFromReader ? 'no-hide-descendants' : 'auto'}
          >
            {label}
          </Text>
          {children}
        </View>
        {trailing}
      </Pressable>

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

/** Kiểu chữ của giá trị trong dòng, dùng chung cho chữ đã chọn và ô gõ chữ. */
export const withdrawValueStyles = StyleSheet.create({
  value: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body, 1.4),
    color: Colors.authInk,
  },
  // Ô nhập không đặt lineHeight: giá trị cứng làm phần thấp của "g", "y" bị cắt trên Android. Cỡ 16 để Safari trên
  // điện thoại không tự phóng to trang khi chạm vào ô.
  input: { fontFamily: FontFamily.semibold, fontSize: FontSize.body, color: Colors.authInk },
  placeholder: { fontFamily: FontFamily.regular, color: Colors.ink3 },
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    minHeight: ROW_MIN_HEIGHT,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
  },
  rowFocused: { borderColor: Colors.authPrimary, backgroundColor: Colors.authFocusBg },
  rowError: { borderColor: Colors.red },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tintBlue,
  },
  // `minWidth: 0` để chữ dài xuống dòng trong cột thay vì đẩy mũi tên ra ngoài dòng.
  body: { flex: 1, minWidth: 0, gap: Spacing.xxs },
  // Cùng cỡ nhãn "Tài khoản ví"/"Số dư khả dụng" của thẻ tài khoản ví.
  label: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  helper: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption, 1.5),
    color: Colors.authMuted,
  },
  error: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.caption,
    lineHeight: lh(FontSize.caption, 1.5),
    color: Colors.tagRedText,
  },
});
