import { StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/theme';
import DetailButton from './DetailButton';
import DetailCard from './DetailCard';
import DetailNote from './DetailNote';

type Props = {
  checking: boolean;
  error: string | null;
  onCheck: () => void;
};

/**
 * Hợp đồng đang ở `SIGNING`: người vay phải xác nhận trong ứng dụng VNPT SmartCA
 * rồi quay lại. Màn vẫn tự hỏi kết quả định kỳ; nút này để người vay chủ động
 * kiểm tra ngay và thấy lỗi cụ thể nếu có.
 */
export default function ContractSmartCaCard({ checking, error, onCheck }: Props) {
  return (
    <DetailCard title="Đang chờ bạn xác nhận ký số" icon="shieldCheck">
      <Text style={styles.body}>
        Mở ứng dụng VNPT SmartCA, kiểm tra mã tài liệu và xác nhận giao dịch. Sau đó quay lại đây để
        FINORA lấy kết quả từ VNPT.
      </Text>
      {error ? <DetailNote tone="warn">{error}</DetailNote> : null}
      <DetailButton
        label="Tôi đã xác nhận, kiểm tra kết quả"
        icon="check"
        onPress={onCheck}
        loading={checking}
        disabled={checking}
      />
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
});
