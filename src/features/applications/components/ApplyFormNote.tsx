import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, Spacing, lh } from '@/theme';
import { Icon } from '@/components/ui';
import { APPLY_FORM_BOX_RADIUS } from '../constant';

type Props = {
  /** Nội dung nguyên văn của màn cũ; không soạn lại câu chữ công bố. */
  children: string;
};

/**
 * Hộp ghi chú nền xanh nhạt có biểu tượng "i" của bước 3/3 (nhắc không nhập lại
 * khoản vay, và việc sẽ xảy ra sau khi nộp). Biểu tượng chỉ để nhận diện nên ẩn
 * với trình đọc màn hình; câu chữ đã đủ nghĩa.
 */
export default function ApplyFormNote({ children }: Props) {
  return (
    <View style={styles.box}>
      <Icon name="info" size={IconSize.sm} color={Colors.authPrimary} strokeWidth={2} />
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: APPLY_FORM_BOX_RADIUS,
    backgroundColor: Colors.authNoteBg,
  },
  text: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.micro,
    lineHeight: lh(FontSize.micro, 1.45),
    color: Colors.authMuted,
  },
});
