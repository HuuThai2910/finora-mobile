import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, Spacing, lh } from '@/theme';
import { Icon } from '@/components/ui';
import { LoanPrimaryButton, LoanStepFooter } from '@/features/products';
import { APPLY_FORM_BOX_RADIUS } from '../constant';

type Props = {
  onPress: () => void;
  /** Đang gửi hồ sơ: nút khoá và hiện vòng xoay để không bấm lặp. */
  submitting: boolean;
  /** Lỗi từ máy chủ ở lần nộp gần nhất; lỗi từng ô nằm tại ô đó. */
  error: string | null;
};

/**
 * Nút "Nộp hồ sơ" ghim đáy bước 3/3, cùng vùng ghim và cùng nút chính với bước
 * 1–2 để ba bước liền mạch; nội dung cuộn tới sát nút thì mờ dần.
 *
 * Nút luôn bấm được như màn cũ: bấm khi còn thiếu thông tin thì form báo lỗi tại
 * từng ô. Lỗi máy chủ đặt ngay trên nút để luôn thấy dù đang cuộn ở đâu.
 */
export default function ApplyFormSubmitBar({ onPress, submitting, error }: Props) {
  return (
    <LoanStepFooter>
      {error ? (
        <View style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Icon name="alert" size={IconSize.xs} color={Colors.tagRedText} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <LoanPrimaryButton label="Nộp hồ sơ" onPress={onPress} loading={submitting} />
    </LoanStepFooter>
  );
}

const styles = StyleSheet.create({
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: APPLY_FORM_BOX_RADIUS,
    backgroundColor: Colors.redBg,
  },
  errorText: {
    flex: 1,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.micro,
    lineHeight: lh(FontSize.micro, 1.45),
    color: Colors.tagRedText,
  },
});
