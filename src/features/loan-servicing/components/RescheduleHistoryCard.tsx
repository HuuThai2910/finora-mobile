import { StyleSheet, View } from 'react-native';
import { DetailCard } from '@/features/applications';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';
import type { RescheduleRequest } from '../types';
import RescheduleRequestItem from './RescheduleRequestItem';

/** Các đề nghị đã có kết quả (hoặc cũ hơn đề nghị đang xử lý), mới nhất trước như API trả về. */
export default function RescheduleHistoryCard({ requests }: { requests: readonly RescheduleRequest[] }) {
  return (
    <DetailCard title="Đề nghị trước đây" icon="clock">
      {requests.map((request, index) => (
        <View key={request.requestId} style={index > 0 && styles.divided}>
          <RescheduleRequestItem request={request} />
        </View>
      ))}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  divided: {
    paddingTop: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.authBorder,
  },
});
