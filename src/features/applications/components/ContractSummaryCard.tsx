import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, tabularNums } from '@/theme';
import type { LoanContractDetail } from '@/types/contract';
import { formatDong } from '@/utils/format';
import type { Countdown } from '../hook/useCountdown';
import { contractFact, contractKeyTerms } from '../mappers/contractSummary';
import { contractStatusMeta } from '../mappers/statusMeta';
import DetailCard from './DetailCard';
import DetailNote from './DetailNote';
import DetailStatusPill from './DetailStatusPill';
import ContractKeyTerms from './ContractKeyTerms';

type Props = {
  contract: LoanContractDetail;
  countdown: Countdown;
};

/**
 * Thẻ đầu màn hợp đồng (mockup 26/09/2026): đây là hợp đồng nào, đang ở trạng
 * thái gì, bao nhiêu tiền và mốc thời gian đáng chú ý. Tiền phải trả từng kỳ chỉ
 * nằm trong bản PDF nên không nhắc lại ở đây.
 */
export default function ContractSummaryCard({ contract, countdown }: Props) {
  const status = contractStatusMeta(contract.status);
  const fact = contractFact(contract, countdown);
  const amount = formatDong(contract.principalAmount);

  return (
    <DetailCard>
      {/* Nhãn trạng thái đứng cùng hàng dòng chữ nhỏ để mã hợp đồng (23 ký tự) có
          trọn bề ngang, không bị bẻ ở "LC-" trên máy 360pt. */}
      <View>
        <View style={styles.top}>
          <Text style={styles.eyebrow} maxFontSizeMultiplier={1.3}>
            HỢP ĐỒNG VAY ĐIỆN TỬ
          </Text>
          <DetailStatusPill status={status} />
        </View>
        {/* Chọn được để sao chép bằng nhấn giữ; app chưa có thư viện clipboard. */}
        <Text selectable style={styles.number} maxFontSizeMultiplier={1.3}>
          {contract.contractNumber}
        </Text>
      </View>

      <View accessible accessibilityLabel={`Số tiền vay ${amount}`}>
        <Text style={styles.amountLabel}>Số tiền vay</Text>
        <Text
          style={styles.amount}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          maxFontSizeMultiplier={1.2}
        >
          {amount}
        </Text>
      </View>

      <ContractKeyTerms terms={contractKeyTerms(contract, fact)} />

      {fact?.urgent ? (
        <DetailNote tone="warn">
          {contract.status === 'PENDING_SIGNATURE' && !countdown.expired
            ? `Hạn xác nhận ${fact.value}. Quá hạn thì hợp đồng này không ký được nữa.`
            : 'Hợp đồng đã quá hạn xác nhận nên không còn ký được.'}
        </DetailNote>
      ) : null}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  eyebrow: {
    flexShrink: 1,
    fontFamily: FontFamily.semibold,
    fontSize: 11.5,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: Colors.authMuted,
  },
  number: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authInk,
    ...tabularNums,
  },
  amountLabel: { fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 18, color: Colors.authMuted },
  amount: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.3,
    color: Colors.authInk,
    ...tabularNums,
  },
});
