import { StyleSheet, Text, View } from 'react-native';
import { DetailButton, DetailCard, DetailNote } from '@/features/applications';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, tabularNums } from '@/theme';
import { formatDong, formatLocalDate } from '@/utils/format';
import { canPrepayLoan, dueAmountOf } from '../mappers/servicing';
import type { ServicingLoanSummary } from '../types';

type Props = {
  loan: ServicingLoanSummary;
  onPay: () => void;
  onPrepay: () => void;
  onSettle: () => void;
};

/**
 * "Thanh toán" của màn chi tiết khoản vay: số tiền màn thanh toán sắp thu in lớn (khoản
 * quá hạn nếu có, không thì kỳ tới), nút trả chính, rồi hai lối trả trước. Số liệu đang chờ
 * đồng bộ thì khoá cả ba nút như màn cũ, vì thu tiền theo số cũ sẽ bị backend từ chối.
 */
export default function LoanPaymentCard({ loan, onPay, onPrepay, onSettle }: Props) {
  const overdue = loan.overdueAmount > 0;
  const amount = dueAmountOf(loan);
  const prepay = canPrepayLoan(loan);

  return (
    <DetailCard title="Thanh toán" icon="wallet">
      <View accessible accessibilityLabel={`${overdue ? 'Số tiền quá hạn' : 'Số tiền kỳ tới'} ${formatDong(amount)}`}>
        <View style={styles.amountRow}>
          <Text style={styles.amount} maxFontSizeMultiplier={1.2}>
            {formatDong(amount)}
          </Text>
          <Text style={styles.unit}>{overdue ? '/ quá hạn' : '/ kỳ tới'}</Text>
        </View>
        {overdue ? (
          <Text style={styles.overdue}>
            {loan.daysPastDue > 0 ? `Đã quá hạn ${loan.daysPastDue} ngày` : 'Có khoản đã quá hạn'}
          </Text>
        ) : loan.nextDueDate ? (
          <Text style={styles.caption}>{`Đến hạn ${formatLocalDate(loan.nextDueDate)}`}</Text>
        ) : null}
      </View>

      {overdue ? (
        <DetailNote tone="warn">
          Khoản thanh toán tiếp theo được ghi nhận là khắc phục quá hạn. Hãy thanh toán sớm để khoản vay trở lại đúng lịch.
        </DetailNote>
      ) : null}
      {loan.stale ? (
        <DetailNote tone="warn">
          Số liệu khoản vay đang chờ đồng bộ lại. Hãy kéo xuống để làm mới trước khi thanh toán.
        </DetailNote>
      ) : null}

      <View style={styles.actions}>
        <DetailButton
          label={overdue ? 'Khắc phục quá hạn' : 'Thanh toán kỳ tới'}
          icon="wallet"
          onPress={onPay}
          disabled={loan.stale || amount <= 0}
        />
        {prepay ? (
          <>
            <DetailButton label="Trả trước một phần gốc" variant="row" icon="coins" onPress={onPrepay} disabled={loan.stale} />
            <DetailButton
              label="Tất toán toàn bộ trước hạn"
              variant="row"
              icon="circleCheck"
              onPress={onSettle}
              disabled={loan.stale}
            />
          </>
        ) : null}
      </View>

      <Text style={styles.fine}>Tiền được trừ từ số dư ví FINORA của bạn sau khi bạn xác nhận bằng mã PIN.</Text>
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  amountRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: Spacing.md },
  amount: {
    fontFamily: FontFamily.extrabold,
    fontSize: 30,
    lineHeight: 40,
    letterSpacing: -0.4,
    color: Colors.authInk,
    ...tabularNums,
  },
  unit: { fontFamily: FontFamily.regular, fontSize: 15, lineHeight: 21, color: Colors.authMuted },
  caption: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted, ...tabularNums },
  overdue: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 19, color: Colors.tagRedText },
  actions: { gap: Spacing.md },
  fine: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
});
