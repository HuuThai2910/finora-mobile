import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui';
import Icon from '@/components/ui/Icon';
import { Colors } from '@/constants/colors';
import { IconSize, MIN_TOUCH, Radius, Spacing, Text_, tabularNums } from '@/theme';
import type { LoanContractDetail } from '@/types/contract';
import { formatAnnualRate, formatDate, formatDateTime, formatDong } from '@/utils/format';
import { REPAYMENT_LABELS } from '../constant';
import ContractDocumentEvidence from './ContractDocumentEvidence';

type Props = {
  contract: LoanContractDetail;
  onOpenSchedule: () => void;
};

/**
 * Trình bày Contract theo cách người vay có thể quét nhanh như một hồ sơ ngân hàng.
 *
 * Các con số đều lấy trực tiếp từ snapshot Contract; component không tự tính lại. Toàn văn
 * `documentContent` và hash vẫn được giữ trong vùng đối chiếu để bản trình bày không làm mất
 * bằng chứng mà borrower đã ký.
 */
export default function ContractDocumentSection({ contract, onOpenSchedule }: Props) {
  const repaymentLabel = REPAYMENT_LABELS[contract.repaymentMethod] ?? contract.repaymentMethod;

  return (
    <View style={styles.root}>
      <DocumentSection index="01" title="Thông tin hợp đồng">
        <InformationRow label="Mã hồ sơ vay" value={contract.applicationNumber} selectable />
        <InformationRow label="Ngày giải ngân dự kiến" value={formatDate(contract.expectedDisbursementDate)} />
        <InformationRow label="Hạn xác nhận" value={formatDateTime(contract.expiresAt)} last />
      </DocumentSection>

      <DocumentSection index="02" title="Điều khoản khoản vay">
        <InformationRow label="Số tiền vay" value={formatDong(contract.principalAmount)} />
        <InformationRow label="Lãi suất áp dụng" value={formatAnnualRate(contract.annualInterestRate)} />
        <InformationRow label="Phương thức trả" value={repaymentLabel} />
        <InformationRow label="Tổng tiền lãi" value={formatDong(contract.totalInterest)} />
        <InformationRow label="Tổng phí" value={formatDong(contract.totalFees)} />
        <InformationRow label="Tổng tiền phạt dự kiến" value={formatDong(contract.totalPenalties)} />
        <InformationRow label="Tổng nghĩa vụ thanh toán" value={formatDong(contract.totalRepayment)} strong last />
      </DocumentSection>

      <DocumentSection index="03" title="Lịch trả nợ">
        <Text style={styles.paragraph}>
          Lịch được lập theo ngày giải ngân dự kiến. Ngày đến hạn thực tế có thể được cập nhật theo
          ngày giải ngân chính thức.
        </Text>
        <View style={styles.scheduleSummary}>
          <View>
            <Text style={styles.scheduleCaption}>Số kỳ thanh toán</Text>
            <Text style={styles.scheduleValue}>{contract.schedulePeriods.length} kỳ</Text>
          </View>
          <View style={styles.scheduleDivider} />
          <View style={styles.scheduleRight}>
            <Text style={styles.scheduleCaption}>Kỳ cao nhất</Text>
            <Text style={styles.scheduleValue}>{formatDong(contract.maximumInstallment)}</Text>
          </View>
        </View>
        <Pressable
          onPress={onOpenSchedule}
          accessibilityRole="button"
          accessibilityLabel={`Xem đầy đủ lịch trả nợ ${contract.schedulePeriods.length} kỳ`}
          style={({ pressed }) => [styles.scheduleAction, pressed && styles.pressed]}
        >
          <View style={styles.scheduleActionIcon}>
            <Icon name="clock" size={IconSize.xs} color={Colors.brand} />
          </View>
          <View style={styles.scheduleActionCopy}>
            <Text style={styles.scheduleActionTitle}>Xem lịch trả nợ từng kỳ</Text>
            <Text style={styles.scheduleActionHint}>Chi tiết tiền gốc, lãi, phí và dư nợ còn lại</Text>
          </View>
          <Icon name="chevronRight" size={IconSize.xs} color={Colors.brand} />
        </Pressable>
      </DocumentSection>

      <DocumentSection index="04" title="Xác nhận của người vay">
        <Text style={styles.paragraph}>
          Người vay xác nhận đã kiểm tra số tiền vay, lãi suất, thời hạn, tổng nghĩa vụ thanh toán
          và lịch trả nợ trước khi quyết định ký.
        </Text>
        <View style={styles.consentNotice}>
          <Icon name="shield" size={IconSize.sm} color={Colors.brand} />
          <Text style={styles.consentText}>
            Việc ký được ghi nhận bằng hình thức click-wrap trong FINORA; không phải hình ảnh chữ ký
            tay hoặc chữ ký số SmartCA.
          </Text>
        </View>
      </DocumentSection>

      <ContractDocumentEvidence contract={contract} />
    </View>
  );
}

function DocumentSection({ index, title, children }: { index: string; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeading}>
        <View style={styles.sectionIndex}><Text style={styles.sectionIndexText}>{index}</Text></View>
        <Text style={styles.sectionTitle} accessibilityRole="header">{title}</Text>
      </View>
      <Card style={styles.sectionCard}>{children}</Card>
    </View>
  );
}

function InformationRow({
  label,
  value,
  strong = false,
  selectable = false,
  last = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  selectable?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text selectable={selectable} style={[styles.infoValue, strong && styles.infoValueStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.xxl },
  sectionWrap: { gap: Spacing.md },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  sectionIndex: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.brand50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIndexText: { ...Text_.captionBold, color: Colors.brand, ...tabularNums },
  sectionTitle: { ...Text_.title, color: Colors.ink, flex: 1 },
  sectionCard: { paddingVertical: Spacing.sm },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { ...Text_.micro, color: Colors.ink3, flex: 1 },
  infoValue: { ...Text_.microBold, color: Colors.ink, flex: 1.15, textAlign: 'right', ...tabularNums },
  infoValueStrong: { ...Text_.bodyBold, color: Colors.brand, ...tabularNums },
  paragraph: { ...Text_.micro, color: Colors.ink2, lineHeight: 22 },
  scheduleSummary: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.line,
  },
  scheduleDivider: { width: 1, backgroundColor: Colors.line, marginHorizontal: Spacing.xl },
  scheduleRight: { flex: 1, alignItems: 'flex-end' },
  scheduleCaption: { ...Text_.caption, color: Colors.ink3 },
  scheduleValue: { ...Text_.microBold, color: Colors.ink, marginTop: Spacing.xs, ...tabularNums },
  scheduleAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: MIN_TOUCH,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.brand50,
  },
  scheduleActionIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleActionCopy: { flex: 1, gap: Spacing.xxs },
  scheduleActionTitle: { ...Text_.microBold, color: Colors.brand },
  scheduleActionHint: { ...Text_.caption, color: Colors.ink3 },
  pressed: { opacity: 0.7 },
  consentNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.brand50,
  },
  consentText: { ...Text_.caption, color: Colors.ink2, lineHeight: 19, flex: 1 },
});
