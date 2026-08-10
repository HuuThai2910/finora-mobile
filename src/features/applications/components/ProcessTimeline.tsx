import { StyleSheet, Text, View } from 'react-native';
import { SectionLabel } from '@/components/ui';
import { StepList, type Step } from '@/components/phone';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';

type Props = {
  title: string;
  steps: readonly Step[];
  /** Lịch sử tải lỗi vẫn không được chặn phần còn lại của màn. */
  failed?: boolean;
};

/**
 * Lịch sử chuyển trạng thái vốn là một dòng thời gian nhưng bản cũ vẽ bằng dòng
 * dữ liệu hai cột nên không thấy được thứ tự và bước đang chạy. Dùng lại
 * `StepList` để cả app có chung một ngôn ngữ trình bày tiến trình.
 */
export default function ProcessTimeline({ title, steps, failed = false }: Props) {
  return (
    <View style={styles.wrap}>
      <SectionLabel>{title}</SectionLabel>
      {failed ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Chưa tải được tiến trình xử lý. Kéo xuống để tải lại; các thông tin khác vẫn dùng được.
          </Text>
        </View>
      ) : steps.length === 0 ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>Chưa có mốc xử lý nào được ghi nhận.</Text>
        </View>
      ) : (
        <StepList steps={steps} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: Spacing.section },
  notice: {
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  noticeText: { ...Text_.micro, color: Colors.ink2 },
});
