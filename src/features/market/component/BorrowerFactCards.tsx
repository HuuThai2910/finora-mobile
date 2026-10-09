import { REPAYMENT_METHOD_LABEL } from '@/features/products';
import type { BorrowerProfile } from '@/types/invest';
import {
  formatAnnualRateShort,
  formatDate,
  formatDong,
  formatLocalDate,
  formatPercentValue,
} from '@/utils/format';
import {
  EDUCATION_LABEL,
  HOME_OWNERSHIP_LABEL,
  KYC_LABEL,
  formatEmployment,
  formatRuleValue,
  ruleValue,
} from '../borrowerDisplay';
import { ProfileCard, ProfileFootnote, ProfileRows, type ProfileRowData } from './ProfileCard';

/*
 * Bốn thẻ số liệu của màn hồ sơ người vay, cùng thứ tự với trang thẩm định của admin: khả năng trả
 * nợ, lịch sử tín dụng, nhân thân (không định danh) và khoản vay người vay đề nghị.
 */

/**
 * Dòng lấy từ bảng luật chỉ có khi có luật đọc trường đó (luật do admin cấu hình); luật có nhưng
 * thiếu dữ liệu thì ghi rõ thay vì bỏ trống.
 */
function traceRow(profile: BorrowerProfile, field: string, label: string): ProfileRowData | null {
  const value = ruleValue(profile.rules, field);
  if (value === undefined) return null;
  return { label, value: value === null ? 'Chưa tra được' : formatRuleValue(field, value) };
}

export function CapacityCard({ profile }: { profile: BorrowerProfile }) {
  const { capacity } = profile;
  return (
    <ProfileCard title="Khả năng trả nợ">
      <ProfileRows
        rows={[
          { label: 'Thu nhập hằng tháng', value: formatDong(capacity.monthlyIncome) },
          { label: 'Nợ phải trả hằng tháng', value: formatDong(capacity.monthlyDebt) },
          {
            label: 'Tỷ lệ nợ trên thu nhập (DTI)',
            hint: 'Phần thu nhập đang dùng để trả các khoản nợ hiện có',
            value: formatPercentValue(capacity.dtiPercent),
          },
          traceRow(profile, 'ty_le_tra_no_thang', 'Tiền trả mỗi kỳ so với thu nhập'),
          { label: 'Thâm niên làm việc', value: formatEmployment(capacity.employmentMonths) },
        ]}
      />
      {capacity.selfDeclared ? (
        <ProfileFootnote>
          {`Người vay tự khai lúc nộp hồ sơ${capacity.capturedAt ? ` ngày ${formatDate(capacity.capturedAt)}` : ''}.`}
        </ProfileFootnote>
      ) : null}
    </ProfileCard>
  );
}

export function CreditHistoryCard({ profile }: { profile: BorrowerProfile }) {
  const cic = traceRow(profile, 'cic_score', 'Điểm tín dụng CIC');
  const inquiries = traceRow(profile, 'so_lan_tra_cuu', 'Tra cứu CIC trong 6 tháng');
  const history = profile.creditHistory;
  const finora: ProfileRowData[] = !history
    ? [{ label: 'Lịch sử vay tại FINORA', value: 'Chưa có dữ liệu' }]
    : !history.hasHistory
      ? [{ label: 'Lịch sử vay tại FINORA', value: 'Chưa từng vay' }]
      : [
          { label: 'Đã tất toán tại FINORA', value: `${history.completedLoans} khoản` },
          { label: 'Trễ hạn tại FINORA trong 2 năm', value: `${history.delinquenciesLast2Years} lần` },
          { label: 'Vỡ nợ tại FINORA', value: `${history.defaultedLoans} khoản` },
        ];

  return (
    <ProfileCard title="Lịch sử tín dụng">
      <ProfileRows rows={[cic, inquiries, ...finora]} />
      <ProfileFootnote>
        {cic || inquiries
          ? 'Số liệu CIC do hệ thống đọc lúc chấm điểm hồ sơ.'
          : 'Lần chấm điểm này không có luật đọc dữ liệu CIC.'}
      </ProfileFootnote>
    </ProfileCard>
  );
}

export function BackgroundCard({ background }: { background: BorrowerProfile['background'] }) {
  return (
    <ProfileCard title="Nhân thân">
      <ProfileRows
        rows={[
          { label: 'Tuổi lúc nộp hồ sơ', value: background.age == null ? 'Chưa có' : `${background.age} tuổi` },
          { label: 'Định danh eKYC', value: background.kycStatus ? KYC_LABEL[background.kycStatus] : 'Chưa có' },
          {
            label: 'Nhà ở',
            value: background.homeOwnership
              ? HOME_OWNERSHIP_LABEL[background.homeOwnership] ?? background.homeOwnership
              : 'Chưa cung cấp',
          },
          {
            label: 'Học vấn',
            value: background.educationLevel
              ? EDUCATION_LABEL[background.educationLevel] ?? background.educationLevel
              : 'Chưa cung cấp',
          },
        ]}
      />
      {background.mockProfile ? (
        <ProfileFootnote>
          Tuổi và trạng thái eKYC đang lấy từ hồ sơ giả lập của môi trường thử nghiệm, chưa đọc từ hồ sơ định danh thật.
        </ProfileFootnote>
      ) : null}
    </ProfileCard>
  );
}

export function LoanRequestCard({ loan }: { loan: BorrowerProfile['loan'] }) {
  const { firstInstallment: first, maximumInstallment: max } = loan;
  // Trả góp đều thì mọi kỳ gần như bằng nhau nên chỉ cần một dòng; khác nhau thì ghi cả kỳ đầu.
  const installments: ProfileRowData[] =
    first != null && max != null && first !== max
      ? [
          { label: 'Kỳ trả đầu của người vay', value: formatDong(first) },
          { label: 'Kỳ trả cao nhất', value: formatDong(max) },
        ]
      : max != null || first != null
        ? [{ label: 'Mỗi kỳ người vay trả', value: formatDong(max ?? first ?? 0) }]
        : [];

  return (
    <ProfileCard title="Khoản vay người vay đề nghị">
      <ProfileRows
        rows={[
          { label: 'Mục đích vay', value: loan.purposeLabel },
          loan.purposeDetail ? { label: 'Phương án sử dụng vốn', value: loan.purposeDetail, stacked: true } : null,
          { label: 'Số tiền đề nghị', value: formatDong(loan.requestedAmount) },
          { label: 'Kỳ hạn', value: `${loan.termMonths} tháng` },
          { label: 'Cách trả nợ', value: REPAYMENT_METHOD_LABEL[loan.repaymentMethod] ?? loan.repaymentMethod },
          loan.finalAnnualRate == null ? null : { label: 'Lãi suất', value: formatAnnualRateShort(loan.finalAnnualRate) },
          ...installments,
          loan.totalRepayment == null
            ? null
            : { label: 'Tổng người vay phải trả', hint: 'Gốc và lãi theo lịch trả nợ', value: formatDong(loan.totalRepayment) },
          loan.expectedDisbursementDate
            ? { label: 'Ngày giải ngân dự kiến', value: formatLocalDate(loan.expectedDisbursementDate) }
            : null,
        ]}
      />
    </ProfileCard>
  );
}
