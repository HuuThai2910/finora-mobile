import { StyleSheet, View } from 'react-native';
import { DetailButton, DetailCard, DetailNote } from '@/features/applications';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';
import { rescheduleStatusLook } from '../mappers/servicing';
import type { RescheduleRequest } from '../types';
import LoanStatusPill from './LoanStatusPill';
import RescheduleRequestItem from './RescheduleRequestItem';

type Props = {
  request: RescheduleRequest;
  /** Vừa gửi trong lần mở màn này: tiêu đề báo đã gửi và có lối về chi tiết khoản vay. */
  justSubmitted: boolean;
  onBack: () => void;
};

/**
 * Đề nghị chưa kết thúc của khoản vay. Loan Service chỉ giữ một đề nghị như vậy cho mỗi
 * khoản vay, nên khi có nó màn hiện thẻ này thay cho biểu mẫu (gửi thêm sẽ bị từ chối).
 */
export default function RescheduleActiveCard({ request, justSubmitted, onBack }: Props) {
  return (
    <DetailCard
      title={justSubmitted ? 'Đã gửi đề nghị' : 'Đề nghị đang xử lý'}
      // Vừa gửi xong thì ô dấu tích xanh lá cho thấy thao tác đã thành công.
      badge={justSubmitted ? { icon: 'check', color: Colors.green } : undefined}
      icon={justSubmitted ? undefined : 'clock'}
      right={<LoanStatusPill status={rescheduleStatusLook(request.status)} />}
    >
      <RescheduleRequestItem request={request} hideStatus />
      <DetailNote>
        FINORA sẽ thẩm định trước. Nếu đạt, toàn bộ nhà đầu tư đang nắm Note phải đồng ý rồi Fineract mới
        áp dụng lịch mới. Trong thời gian chờ, lịch trả hiện tại vẫn có hiệu lực.
      </DetailNote>
      {justSubmitted ? (
        <View style={styles.action}>
          <DetailButton label="Về chi tiết khoản vay" variant="outline" onPress={onBack} />
        </View>
      ) : null}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  action: { marginTop: Spacing.xs },
});
