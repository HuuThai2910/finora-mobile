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
} from '../borrowerDisplay';
import { ProfileCard, ProfileFootnote, ProfileRows, type ProfileRowData } from './ProfileCard';

/*
 * Ba thẻ số liệu của màn hồ sơ người vay, cùng thứ tự với trang thẩm định của admin: khả năng trả
 * nợ, nhân thân (không định danh) và khoản vay người vay đề nghị.
 */

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
