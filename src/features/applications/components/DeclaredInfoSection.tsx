import { PItem } from '@/components/phone';
import type { LoanApplication } from '@/types/loan';
import { formatDate, formatDong } from '@/utils/format';
import {
  EDUCATION_LEVEL_OPTIONS,
  HOME_OWNERSHIP_OPTIONS,
  PURPOSE_LABELS,
  REPAYMENT_LABELS,
} from '../constant';
import DisclosureSection from './DisclosureSection';

function optionLabel(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string | null,
): string {
  if (!value) return 'Chưa cung cấp';
  return options.find(option => option.value === value)?.label ?? value;
}

/**
 * Bản khai và snapshot sản phẩm chỉ để tra cứu lại lúc cần đối chiếu nên nằm
 * trong khối gấp gọn, không tranh chỗ với trạng thái và số tiền phải trả.
 */
export default function DeclaredInfoSection({ application }: { application: LoanApplication }) {
  const financial = application.financialInformation;
  const product = application.productSnapshot;

  return (
    <>
      <DisclosureSection
        title="Đề nghị vay đã gửi"
        hint="Sản phẩm, mục đích vay và ngày giải ngân mong muốn"
      >
        <PItem label="Sản phẩm" value={product.name} />
        <PItem
          label="Mục đích"
          value={PURPOSE_LABELS[application.purposeCode] ?? application.purposeCode}
          sub={application.purposeDetail || undefined}
        />
        <PItem
          label="Phương thức trả"
          value={REPAYMENT_LABELS[product.repaymentMethod] ?? product.repaymentMethod}
        />
        <PItem
          label="Ngày giải ngân mong muốn"
          value={formatDate(application.expectedDisbursementDate)}
        />
        <PItem label="Ngày nộp hồ sơ" value={formatDate(application.submittedAt)} last />
      </DisclosureSection>

      <DisclosureSection
        title="Thông tin tài chính đã khai"
        hint="Số liệu bạn cung cấp lúc nộp hồ sơ, dùng để chấm điểm"
      >
        <PItem label="Thu nhập hằng tháng" value={formatDong(financial.declaredMonthlyIncome)} />
        <PItem label="Nghĩa vụ nợ hằng tháng" value={formatDong(financial.monthlyDebtObligations)} />
        <PItem
          label="Tỷ lệ nợ trên thu nhập"
          value={`${financial.dtiSnapshot}%`}
          sub="Phần thu nhập hằng tháng đang dùng để trả nợ"
        />
        <PItem
          label="Số tháng đi làm"
          value={`${financial.employmentLengthMonths} tháng`}
        />
        <PItem
          label="Tình trạng nhà ở"
          value={optionLabel(HOME_OWNERSHIP_OPTIONS, financial.homeOwnership)}
        />
        <PItem
          label="Trình độ học vấn"
          value={optionLabel(EDUCATION_LEVEL_OPTIONS, financial.educationLevel)}
          last
        />
      </DisclosureSection>
    </>
  );
}
