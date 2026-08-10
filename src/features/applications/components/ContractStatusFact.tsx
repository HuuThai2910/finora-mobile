import { StyleSheet, Text, View } from 'react-native';
import { Spacing, Text_ } from '@/theme';
import type { LoanContractDetail } from '@/types/contract';
import { formatDateTime } from '@/utils/format';
import type { Countdown } from '../hook/useCountdown';

type Props = {
  contract: LoanContractDetail;
  countdown: Countdown;
  /** Màu chữ của tông trạng thái đang bao quanh. */
  color: string;
  urgentColor: string;
};

/**
 * Mốc thời gian quan trọng nhất theo trạng thái hiện tại, đặt ngay trong khối
 * trạng thái.
 *
 * Bản trước liệt kê cả bốn mốc trong một thẻ "Mốc thời gian" riêng, trong khi
 * dòng thời gian ở cuối màn đã dựng lại đúng những mốc đó từ lịch sử hợp đồng.
 * Ở đây chỉ nêu mốc mà người dùng cần biết ngay, phần còn lại để dòng thời gian
 * kể.
 */
export default function ContractStatusFact({ contract, countdown, color, urgentColor }: Props) {
  const fact = describe(contract, countdown);
  if (!fact) return null;

  const tint = fact.urgent ? urgentColor : color;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: tint, opacity: 0.72 }]}>{fact.label}</Text>
      <Text style={[styles.value, { color: tint }]}>{fact.value}</Text>
      {fact.hint ? <Text style={[styles.hint, { color: tint }]}>{fact.hint}</Text> : null}
    </View>
  );
}

type Fact = { label: string; value: string; hint?: string; urgent: boolean };

function describe(contract: LoanContractDetail, countdown: Countdown): Fact | null {
  switch (contract.status) {
    case 'PENDING_SIGNATURE':
      if (countdown.expired) return null;
      return {
        label: 'HẠN XÁC NHẬN',
        value: countdown.label || 'sắp hết hạn',
        hint: countdown.urgent ? 'Quá hạn thì hợp đồng này không ký được nữa.' : undefined,
        urgent: countdown.urgent,
      };
    case 'SIGNED':
      return contract.signedAt
        ? { label: 'BẠN ĐÃ KÝ LÚC', value: formatDateTime(contract.signedAt), urgent: false }
        : null;
    case 'EFFECTIVE':
      return contract.effectiveAt
        ? { label: 'CÓ HIỆU LỰC TỪ', value: formatDateTime(contract.effectiveAt), urgent: false }
        : null;
    case 'DECLINED':
      return contract.declinedAt
        ? {
            label: 'BẠN ĐÃ TỪ CHỐI LÚC',
            value: formatDateTime(contract.declinedAt),
            hint: contract.declineReasonDetail?.trim() || undefined,
            urgent: false,
          }
        : null;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xxs },
  label: { ...Text_.sectionLabel, fontSize: 12 },
  value: { ...Text_.title },
  hint: { ...Text_.caption },
});
