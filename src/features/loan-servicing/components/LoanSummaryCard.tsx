import { StyleSheet, Text, View } from 'react-native';
import { DetailButton, DetailCard, DetailNote } from '@/features/applications';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, tabularNums } from '@/theme';
import { formatDong, formatLocalDate, formatRecentTime } from '@/utils/format';
import { loanStatusLook, principalPaidPercent } from '../mappers/servicing';
import type { ServicingLoanSummary } from '../types';
import LoanStatusPill from './LoanStatusPill';

type Props = {
  loan: ServicingLoanSummary;
  /** Số kỳ của lịch trả; 0 thì nút chỉ ghi "Xem lịch trả nợ". */
  periodCount: number;
  onOpenSchedule: () => void;
};

const BAR_HEIGHT = 8;

/**
 * Câu giải thích cho trạng thái không còn thao tác tiền nào trên app. Điều kiện khoá giữ
 * đúng như màn cũ: chỉ ACTIVE và DEFAULTED được thanh toán, cơ cấu.
 */
const LOCKED_NOTES: Partial<Record<ServicingLoanSummary['status'], string>> = {
  SETTLED: 'Bạn đã tất toán khoản vay này. Lịch trả nợ vẫn còn để bạn xem lại.',
  RESTRUCTURING:
    'Khoản vay đang được áp dụng lịch cơ cấu đã duyệt. Thanh toán tạm khoá cho tới khi lịch mới có hiệu lực.',
  WRITTEN_OFF: 'Khoản vay đã được xử lý rủi ro. Ứng dụng chỉ còn cho xem và đối chiếu số liệu.',
};

/**
 * Thẻ đầu màn chi tiết khoản vay, cùng dáng thẻ đầu "Chi tiết hợp đồng": đây là khoản vay
 * nào, đang ở trạng thái gì, còn nợ bao nhiêu và đã trả được bao nhiêu phần gốc. Mọi con
 * số lấy nguyên từ Loan Service; app chỉ chia gốc đã trả cho gốc vay để vẽ thanh tiến độ.
 */
export default function LoanSummaryCard({ loan, periodCount, onOpenSchedule }: Props) {
  const status = loanStatusLook(loan.status);
  const amount = formatDong(loan.totalOutstanding);
  const paid = principalPaidPercent(loan);
  const lockedNote = LOCKED_NOTES[loan.status];

  return (
    <DetailCard>
      {/* Nhãn trạng thái cùng hàng dòng chữ nhỏ để mã khoản vay (23 ký tự) có trọn bề ngang. */}
      <View>
        <View style={styles.top}>
          <Text style={styles.eyebrow} maxFontSizeMultiplier={1.3}>
            KHOẢN VAY
          </Text>
          <LoanStatusPill status={status} size="md" />
        </View>
        {/* Chọn được để sao chép bằng nhấn giữ; app chưa có thư viện clipboard. */}
        <Text selectable style={styles.number} maxFontSizeMultiplier={1.3}>
          {loan.loanNumber}
        </Text>
      </View>

      <View accessible accessibilityLabel={`Dư nợ còn lại ${amount}`}>
        <Text style={styles.amountLabel}>Dư nợ còn lại</Text>
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

      <View>
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityLabel="Phần gốc đã trả"
          accessibilityValue={{ min: 0, max: 100, now: paid }}
        >
          <View style={[styles.fill, { width: `${paid}%` }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressText} maxFontSizeMultiplier={1.3}>{`Đã trả ${paid}% gốc`}</Text>
          <Text style={styles.progressText} maxFontSizeMultiplier={1.3}>
            {`Gốc vay ${formatDong(loan.principalAmount)}`}
          </Text>
        </View>
      </View>

      <View style={styles.figures}>
        <Figure label="Gốc còn lại" value={formatDong(loan.principalOutstanding)} />
        <Figure label="Ngày đáo hạn" value={formatLocalDate(loan.maturityDate)} divided />
      </View>

      {lockedNote ? <DetailNote>{lockedNote}</DetailNote> : null}

      <DetailButton
        label={periodCount > 0 ? `Xem lịch trả nợ ${periodCount} kỳ` : 'Xem lịch trả nợ'}
        variant="row"
        icon="calendarCheck"
        onPress={onOpenSchedule}
      />

      <Text style={styles.fine}>{`Số liệu cập nhật ${formatRecentTime(loan.dataAsOf).toLowerCase()}`}</Text>
    </DetailCard>
  );
}

function Figure({ label, value, divided = false }: { label: string; value: string; divided?: boolean }) {
  return (
    <View style={[styles.figure, divided && styles.figureDivided]} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.figureValue} maxFontSizeMultiplier={1.3}>
        {value}
      </Text>
      <Text style={styles.figureLabel} maxFontSizeMultiplier={1.3}>
        {label}
      </Text>
    </View>
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
  track: { height: BAR_HEIGHT, borderRadius: BAR_HEIGHT / 2, backgroundColor: Colors.authBorder, overflow: 'hidden' },
  fill: { height: BAR_HEIGHT, borderRadius: BAR_HEIGHT / 2, backgroundColor: Colors.authPrimary },
  progressRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    columnGap: Spacing.md,
    marginTop: 6,
  },
  progressText: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted, ...tabularNums },
  // Mỗi cột rộng theo con số rồi chia đều phần dư, như dải số ở thẻ thanh toán của hồ sơ vay.
  figures: {
    flexDirection: 'row',
    paddingTop: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.authBorder,
  },
  figure: { flexGrow: 1, flexShrink: 1, flexBasis: 'auto', gap: 2, paddingRight: Spacing.md },
  figureDivided: { paddingLeft: 12, borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: Colors.authBorder },
  figureValue: { fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 21, color: Colors.authInk, ...tabularNums },
  figureLabel: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  fine: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
});
