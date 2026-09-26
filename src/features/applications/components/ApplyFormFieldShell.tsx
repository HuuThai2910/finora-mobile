import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, FontSize, IconSize, Spacing, lh } from '@/theme';
import { Icon } from '@/components/ui';
import { APPLY_FORM_BOX_RADIUS } from '../constant';

/** Số đo dòng nhập của mockup bước 3 (quy về pt theo cỡ chữ của app). */
const ROW_MIN_HEIGHT = 68;
const TILE_SIZE = 44;
const TILE_RADIUS = 12;

type Props = {
  icon: IconName;
  label: string;
  required?: boolean;
  /** Viền xanh: ô nhập đang được gõ, hoặc bảng chọn của dòng đang mở. */
  focused?: boolean;
  /** Lỗi thay chỗ dòng gợi ý và tô đỏ viền dòng. */
  error?: string;
  helper?: string;
  /** Mũi tên chỉ dành cho dòng mở bảng chọn; ô gõ chữ không có để không gây hiểu nhầm. */
  trailing?: React.ReactNode;
  /**
   * Thuộc tính chạm/trợ năng của cả dòng. Dòng chọn đặt vai trò nút; dòng gõ chữ
   * để `accessible={false}` cho trình đọc màn hình đọc thẳng ô nhập bên trong.
   */
  pressable: Omit<PressableProps, 'style' | 'children'>;
  /** Nhãn nhìn thấy đã có trong nhãn đọc của dòng/ô nhập; ẩn đi để không đọc hai lần. */
  hideLabelFromReader?: boolean;
  /** Mờ nhẹ khi nhấn — phản hồi cho dòng mở bảng chọn; dòng gõ chữ thì không cần. */
  pressFeedback?: boolean;
  children: React.ReactNode;
};

/**
 * Khung chung của một dòng nhập bước 3/3: ô biểu tượng xanh nhạt bên trái, nhãn
 * nhỏ (dấu * đỏ khi bắt buộc) và giá trị bên dưới, đuôi tuỳ chọn bên phải.
 *
 * Viền giữ nguyên độ dày ở mọi trạng thái, chỉ đổi màu: đổi độ dày làm nội dung
 * xê dịch 1pt mỗi lần focus. Lỗi vừa tô đỏ viền vừa có câu chữ bên dưới để
 * không chỉ dựa vào màu.
 */
export default function ApplyFormFieldShell({
  icon,
  label,
  required = false,
  focused = false,
  error,
  helper,
  trailing,
  pressable,
  hideLabelFromReader = false,
  pressFeedback = false,
  children,
}: Props) {
  return (
    <View>
      <Pressable
        {...pressable}
        style={({ pressed }) => [
          styles.row,
          focused && styles.rowFocused,
          !!error && styles.rowError,
          pressFeedback && pressed && styles.pressed,
        ]}
      >
        <View style={styles.tile}>
          <Icon name={icon} size={IconSize.sm} color={Colors.authPrimary} strokeWidth={1.9} />
        </View>
        <View style={styles.body}>
          <Text
            style={styles.label}
            accessibilityElementsHidden={hideLabelFromReader}
            importantForAccessibility={hideLabelFromReader ? 'no-hide-descendants' : 'auto'}
          >
            {label}
            {required ? <Text style={styles.required}> *</Text> : null}
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
export const applyFormValueStyles = StyleSheet.create({
  value: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body, 1.4),
    color: Colors.authInk,
  },
  // Ô nhập không đặt lineHeight: giá trị cứng làm phần thấp của "g", "y" bị cắt
  // trên Android. Cỡ ≥16 để Safari trên điện thoại không tự phóng to trang khi chạm.
  input: { fontFamily: FontFamily.semibold, fontSize: FontSize.body, color: Colors.authInk },
  placeholder: { fontFamily: FontFamily.regular, color: Colors.ink3 },
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    minHeight: ROW_MIN_HEIGHT,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xl,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    borderRadius: APPLY_FORM_BOX_RADIUS,
    backgroundColor: Colors.card,
  },
  rowFocused: { borderColor: Colors.authPrimary, backgroundColor: Colors.authFocusBg },
  rowError: { borderColor: Colors.red },
  pressed: { opacity: 0.85 },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: TILE_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tintBlue,
  },
  // `minWidth: 0` để chữ dài xuống dòng trong cột thay vì đẩy mũi tên ra ngoài dòng.
  body: { flex: 1, minWidth: 0, gap: Spacing.xxs },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.micro,
    lineHeight: lh(FontSize.micro, 1.4),
    color: Colors.authMuted,
  },
  required: { color: Colors.red },
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
    color: Colors.red,
  },
});
