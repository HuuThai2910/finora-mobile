import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/theme';

/**
 * Preview về mà chưa có kỳ nào (Loan Service bản cũ chưa trả `periods`). Giữ
 * nguyên lời nhắc của màn cũ: số kỳ đầu / kỳ cao nhất phía trên chỉ là tóm tắt,
 * không thay được lịch đầy đủ.
 */
export default function ScheduleEmptyNote() {
  return (
    <View style={styles.box} accessibilityLiveRegion="polite">
      <Text style={styles.title}>Chưa nhận được lịch trả từng kỳ</Text>
      <Text style={styles.body}>
        Hãy tải lại sau khi Loan Service đã được cập nhật. Các số “kỳ đầu” và “kỳ cao nhất” phía
        trên chỉ là số liệu tóm tắt, không thay thế lịch đầy đủ.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: Spacing.sm,
    padding: Spacing.xl,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.warnBorder,
    backgroundColor: Colors.warnBg,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.warnText,
    textAlign: 'center',
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.warnText,
    textAlign: 'center',
  },
});
