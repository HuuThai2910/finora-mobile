import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { KycStatus } from '@/types/auth';
import { FontFamily, LineHeight, Radius, Spacing, lh } from '@/theme';
import { Icon } from '@/components/ui';
import { KYC_BADGE, KYC_LABEL } from '../constant';

type Props = {
  status: KycStatus;
  /** Có khi người dùng còn phải định danh: nhãn thành nút mở luồng eKYC. */
  onPress?: () => void;
};

/**
 * Nhãn trạng thái định danh dưới tên. Đã định danh thì chỉ là nhãn; chưa định
 * danh thì bấm được (kèm mũi tên) để đi thẳng vào luồng chụp CCCD.
 */
export default function KycBadge({ status, onPress }: Props) {
  const look = KYC_BADGE[status];
  // Nhãn viết hoa để hiển thị; trình đọc màn hình đọc bản chữ thường cho tự nhiên.
  const spoken = `Trạng thái định danh: ${KYC_LABEL[status].toLowerCase()}`;

  const content = (
    <>
      <Icon name={look.icon} size={13} color={look.foreground} strokeWidth={2.2} />
      <Text style={[styles.label, { color: look.foreground }]} maxFontSizeMultiplier={1.4}>
        {KYC_LABEL[status]}
      </Text>
      {onPress ? <Icon name="chevronRight" size={12} color={look.foreground} strokeWidth={2.4} /> : null}
    </>
  );

  if (!onPress) {
    return (
      <View style={[styles.pill, { backgroundColor: look.background }]} accessible accessibilityLabel={spoken}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      // Nhãn chỉ cao ~20pt; nới vùng chạm theo chiều dọc cho đủ 44pt.
      hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityLabel={spoken}
      accessibilityHint="Mở màn chụp căn cước công dân để định danh"
      style={({ pressed }) => [styles.pill, { backgroundColor: look.background }, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    // Máy rất hẹp (320pt) thì nhãn xuống dòng trong viên thuốc thay vì tràn sang mascot.
    maxWidth: '100%',
    gap: Spacing.xs,
    paddingLeft: 7,
    paddingRight: 9,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  pressed: { opacity: 0.6 },
  label: {
    flexShrink: 1,
    fontFamily: FontFamily.bold,
    fontSize: 10.5,
    // Chữ hoa có dấu (Ã, Ị) cần dòng cao hơn để Android không cắt ngọn dấu.
    lineHeight: lh(10.5, LineHeight.heading),
    letterSpacing: 0.4,
  },
});
