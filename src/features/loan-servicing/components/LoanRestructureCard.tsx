import { StyleSheet, Text } from 'react-native';
import { DetailButton, DetailCard } from '@/features/applications';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/theme';

/**
 * Lối vào đề nghị cơ cấu từ màn chi tiết khoản vay. Câu dẫn nói rõ lịch hiện tại vẫn giữ
 * nguyên cho tới khi được duyệt, đúng điều khoản cơ cấu của Loan Service.
 */
export default function LoanRestructureCard({ onOpen }: { onOpen: () => void }) {
  return (
    <DetailCard title="Cơ cấu khoản vay" icon="refreshCw">
      <Text style={styles.body}>
        Khi gặp khó khăn, bạn có thể đề nghị gia hạn thêm kỳ hoặc đổi ngày đến hạn. Lịch trả hiện tại
        vẫn giữ nguyên cho tới khi FINORA duyệt và áp dụng lịch mới.
      </Text>
      <DetailButton label="Đề nghị cơ cấu hoặc gia hạn" variant="row" icon="fileText" onPress={onOpen} />
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
});
