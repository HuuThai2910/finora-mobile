import { Alert, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { openSmartCaApp, smartCaOpenFailureMessage } from '@/lib/smartCaApp';
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
  const openSmartCa = async () => {
    const result = await openSmartCaApp();
    const message = smartCaOpenFailureMessage(result);
    if (message) Alert.alert('Không mở được SmartCA', message);
  };

  return (
    <DetailCard title="Đang chờ bạn xác nhận ký số" icon="shieldCheck">
      <Text style={styles.body}>
        Mở ứng dụng VNPT SmartCA, kiểm tra mã tài liệu và xác nhận giao dịch. Sau đó quay lại đây để
        FINORA lấy kết quả từ VNPT.
      </Text>
      {error ? <DetailNote tone="warn">{error}</DetailNote> : null}
      <View style={styles.actions}>
        <DetailButton label="Mở VNPT SmartCA" icon="shieldCheck" onPress={() => void openSmartCa()} />
        <DetailButton
          label="Tôi đã xác nhận, kiểm tra kết quả"
          icon="check"
          variant="outline"
          onPress={onCheck}
          loading={checking}
          disabled={checking}
        />
      </View>
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  actions: { gap: 10 },
});
