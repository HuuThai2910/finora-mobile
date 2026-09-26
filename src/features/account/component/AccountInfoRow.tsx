import { isValidElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, LineHeight, Spacing, lh } from '@/theme';
import AccountInfoTile from './AccountInfoTile';

/** Giá trị chưa khai hiển thị nhất quán một kiểu thay vì ô trống (giữ nguyên chữ của màn cũ). */
const EMPTY_VALUE = 'Chưa cập nhật';

type Props = {
  icon: IconName;
  label: string;
  /**
   * Chuỗi (hoặc `null` khi hồ sơ chưa có trường này) thì cả dòng gộp thành một
   * mục "nhãn, giá trị" cho trình đọc màn hình.
   *
   * Phần tử (như `KycBadge`) thì dòng KHÔNG gộp: phần tử đó có thể là nút bấm và
   * iOS không cho chạm tới nút nằm trong một khối đã gộp. Vì vậy phần tử phải tự
   * đọc cả nhãn lẫn giá trị; chữ nhãn của dòng được ẩn để không bị đọc hai lần.
   */
  value: string | null | React.ReactElement;
  /** Bản đọc cho trình đọc màn hình khi chữ hiển thị đã chèn điểm ngắt dòng (email). */
  spokenValue?: string;
};

const LABEL_SIZE = 14;
const VALUE_SIZE = 14.5;
/** Đệm trên/dưới mỗi dòng; khung giả lúc tải dùng lại để giữ đúng nhịp dòng. */
export const INFO_ROW_PADDING = 9;

/**
 * Nối hai âm tiết cuối của nhãn bằng dấu cách không ngắt: từ ghép tiếng Việt
 * thường nằm ở cuối ("định danh", "thường trú", "điện thoại"), nên khi chữ phóng
 * to phải xuống dòng thì gãy thành "Trạng thái / định danh" thay vì để một âm
 * tiết mồ côi "Trạng thái định / danh".
 */
const keepLastWordTogether = (label: string) => label.replace(/ (\S+)$/, '\u00a0$1');

/**
 * Một dòng thông tin: ô icon, nhãn nhạt bên trái, giá trị đậm màu canh phải.
 * Giá trị dài (email, địa chỉ) xuống dòng trong cột của nó, không chạy xuống
 * dưới nhãn và không tràn khỏi thẻ.
 */
export default function AccountInfoRow({ icon, label, value, spokenValue }: Props) {
  const shownLabel = keepLastWordTogether(label);

  if (isValidElement(value)) {
    return (
      <View style={styles.row}>
        <AccountInfoTile icon={icon} />
        <Text style={styles.label} aria-hidden>
          {shownLabel}
        </Text>
        <View style={styles.element}>{value}</View>
      </View>
    );
  }

  const text = value?.trim() || null;

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${label}, ${text ? (spokenValue ?? text) : EMPTY_VALUE}`}
    >
      <AccountInfoTile icon={icon} />
      <Text style={styles.label}>{shownLabel}</Text>
      <Text
        style={[styles.value, !text && styles.empty]}
        // Địa chỉ dài xuống nhiều dòng: chia đều các dòng (Android) và tránh để
        // một chữ mồ côi ở dòng cuối (iOS). Bản web không có hai thuộc tính này.
        textBreakStrategy="balanced"
        lineBreakStrategyIOS="push-out"
      >
        {text ?? EMPTY_VALUE}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: INFO_ROW_PADDING,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rowDivider,
  },
  // Nhãn giữ bề rộng tự nhiên (không bị giá trị dài chèn ép); chỉ khi chữ phóng
  // to quá nửa dòng mới xuống dòng, để giá trị vẫn còn chỗ.
  label: {
    flexShrink: 1,
    // Bản web mặc định không cho chữ co nhỏ hơn "từ" dài nhất; hạ về 0 để chữ
    // phóng rất to vẫn xuống dòng trong khung thay vì tràn ra ngoài thẻ.
    minWidth: 0,
    maxWidth: '50%',
    marginLeft: Spacing.lg,
    fontFamily: FontFamily.regular,
    fontSize: LABEL_SIZE,
    lineHeight: lh(LABEL_SIZE, LineHeight.heading),
    color: Colors.authMuted,
  },
  // Giá trị canh phải nên khoảng hở thật với nhãn thường rộng hơn nhiều; 8pt chỉ
  // là mức tối thiểu, đủ để dòng "Trạng thái định danh" + nhãn vẫn vừa máy 360pt.
  value: {
    flex: 1,
    // Như nhãn: email rất dài (không có dấu cách) phải xuống dòng, không tràn thẻ.
    minWidth: 0,
    marginLeft: Spacing.md,
    textAlign: 'right',
    fontFamily: FontFamily.regular,
    fontSize: VALUE_SIZE,
    // Họ tên lưu chữ hoa từ CCCD (Ễ, Ỳ, Ọ...) cần dòng cao hơn để Android không cắt ngọn dấu.
    lineHeight: lh(VALUE_SIZE, LineHeight.heading),
    color: Colors.authInk,
  },
  empty: { color: Colors.authMuted },
  // Nhãn trạng thái không bị bóp (chữ trong viên thuốc gãy dòng trông như lỗi);
  // thiếu chỗ thì nhãn bên trái xuống dòng trước. Trần 60% để chữ phóng rất to
  // vẫn không đẩy viên thuốc tràn khỏi thẻ.
  element: {
    flexGrow: 1,
    flexShrink: 0,
    maxWidth: '60%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: Spacing.md,
  },
});
