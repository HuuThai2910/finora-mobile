import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';
import type { LoanApplication } from '@/types/loan';
import { formatDate, formatDong, formatPercentValue } from '@/utils/format';
import {
  EDUCATION_LEVEL_OPTIONS,
  HOME_OWNERSHIP_OPTIONS,
  PURPOSE_LABELS,
  REPAYMENT_LABELS,
} from '../constant';
import DetailCard from './DetailCard';

const NOT_PROVIDED = 'Chưa cung cấp';

function optionLabel(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string | null,
): string {
  if (!value) return NOT_PROVIDED;
  return options.find(option => option.value === value)?.label ?? value;
}

/**
 * "Thông tin bạn đã gửi": bản khai và snapshot sản phẩm, chỉ để tra cứu lại khi
 * cần đối chiếu. Cố ý trình bày trầm (không ô màu, không nhãn) ở cuối màn để
 * không tranh chỗ với trạng thái và số tiền phải trả; nhóm như trước (đề nghị
 * vay, tài chính đã khai) nhưng mở sẵn, vì phần này đã nằm cuối màn.
 */
export default function DeclaredInfoSection({ application }: { application: LoanApplication }) {
  const financial = application.financialInformation;
  const product = application.productSnapshot;

  return (
    <DetailCard title="Thông tin bạn đã gửi" icon="fileText">
      <Text style={styles.note}>
        Bản chụp lúc nộp hồ sơ, không thay đổi khi bạn cập nhật hồ sơ cá nhân.
      </Text>

      <InfoGroup title="Đề nghị vay đã gửi">
        <InfoRow label="Sản phẩm" value={product.name} first />
        <InfoRow label="Mục đích" value={PURPOSE_LABELS[application.purposeCode] ?? application.purposeCode} />
        {application.purposeDetail ? (
          <InfoRow label="Phương án sử dụng vốn" value={application.purposeDetail} stacked />
        ) : null}
        <InfoRow
          label="Phương thức trả"
          value={REPAYMENT_LABELS[product.repaymentMethod] ?? product.repaymentMethod}
        />
        <InfoRow label="Ngày giải ngân mong muốn" value={formatDate(application.expectedDisbursementDate)} />
        <InfoRow label="Ngày nộp hồ sơ" value={formatDate(application.submittedAt)} />
      </InfoGroup>

      <InfoGroup title="Thông tin tài chính đã khai">
        <InfoRow label="Thu nhập hằng tháng" value={formatDong(financial.declaredMonthlyIncome)} first />
        <InfoRow label="Nghĩa vụ nợ hằng tháng" value={formatDong(financial.monthlyDebtObligations)} />
        <InfoRow
          label="Tỷ lệ nợ trên thu nhập"
          hint="Phần thu nhập hằng tháng đang dùng để trả nợ"
          value={formatPercentValue(financial.dtiSnapshot)}
        />
        <InfoRow
          label="Số tháng đi làm"
          value={
            financial.employmentLengthMonths == null
              ? NOT_PROVIDED
              : `${financial.employmentLengthMonths} tháng`
          }
        />
        <InfoRow label="Tình trạng nhà ở" value={optionLabel(HOME_OWNERSHIP_OPTIONS, financial.homeOwnership)} />
        <InfoRow label="Trình độ học vấn" value={optionLabel(EDUCATION_LEVEL_OPTIONS, financial.educationLevel)} />
      </InfoGroup>
    </DetailCard>
  );
}

function InfoGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.groupTitle} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

type RowProps = {
  label: string;
  value: string;
  /** Câu giải thích nhãn, in nhỏ ngay dưới nhãn. */
  hint?: string;
  /** Chữ tự do (phương án sử dụng vốn): nhãn trên, nội dung dưới trọn bề ngang. */
  stacked?: boolean;
  /** Dòng đầu nhóm không kẻ đường phía trên. */
  first?: boolean;
};

function InfoRow({ label, value, hint, stacked = false, first = false }: RowProps) {
  return (
    <View
      style={[styles.row, !first && styles.rowDivided]}
      accessible
      accessibilityLabel={hint ? `${label}: ${value}. ${hint}` : `${label}: ${value}`}
    >
      <View style={stacked ? styles.lineStacked : styles.line}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, stacked && styles.valueStacked]}>{value}</Text>
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  groupTitle: {
    marginTop: Spacing.xs,
    marginBottom: 2,
    fontFamily: FontFamily.semibold,
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.authLabel,
  },
  row: { gap: 2, paddingVertical: 10 },
  rowDivided: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.authBorder },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  lineStacked: { gap: 2 },
  label: {
    flexShrink: 1,
    fontFamily: FontFamily.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.authMuted,
  },
  hint: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  // Giá trị dài (tên sản phẩm do admin đặt) xuống dòng trong cột phải, tối đa 60% bề ngang.
  value: {
    maxWidth: '60%',
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: FontFamily.semibold,
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.authInk,
  },
  valueStacked: { maxWidth: '100%', textAlign: 'left', fontFamily: FontFamily.regular },
});
