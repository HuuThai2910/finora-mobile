import type { IconName } from '@/constants/icons';
import type { LoanContractSummary } from '@/types/contract';
import type { LoanApplication } from '@/types/loan';
import { formatDate, formatDong } from '@/utils/format';
import { NEUTRAL_PURPOSE_ICON, PURPOSE_ICONS, PURPOSE_LABELS, type StatusMeta } from '../constant';
import { applicationJourneyStatus } from './statusMeta';

/** Dữ liệu đã sẵn sàng để vẽ một thẻ ở màn "Hồ sơ vay". */
export type ApplicationCardView = {
  applicationNumber: string;
  productName: string;
  purposeLabel: string;
  icon: IconName;
  amount: string;
  term: string;
  rate: string;
  submittedOn: string;
  status: StatusMeta;
  /** Cả thẻ là một nút duy nhất nên nhãn đọc phải gói đủ thông tin trên thẻ. */
  accessibilityLabel: string;
};

// Backend lưu lãi suất tới 4 chữ số lẻ; hiện đủ để không làm tròn sai con số đã
// công bố, số chẵn thì Intl tự bỏ phần lẻ ("13" chứ không phải "13,0000").
const rateFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 4 });

/**
 * Trên màn chi tiết, nhãn "Khác" đứng sau tiêu đề "Mục đích vay" nên đủ nghĩa;
 * trên thẻ nó đứng một mình, nên dùng đúng nhãn backend của `LoanPurpose.OTHER`.
 */
function purposeLabel(code: string): string {
  if (code === 'OTHER') return 'Mục đích khác';
  // Mã lạ (backend bổ sung sau) hiện nguyên mã như màn chi tiết, để còn tra được.
  return PURPOSE_LABELS[code] ?? code;
}

/** Chuyển một hồ sơ của `GET /loan-applications/me` (kèm Contract nếu có) sang dữ liệu thẻ. */
export function toApplicationCardView(
  application: LoanApplication,
  contract?: LoanContractSummary,
): ApplicationCardView {
  const status = applicationJourneyStatus(
    application.status,
    contract?.status,
    application.termsConfirmation?.status,
  );
  // Lãi suất chính thức chỉ có sau khi duyệt (định giá theo rủi ro); trước đó chỉ
  // có lãi suất công bố của sản phẩm tại lúc nộp. Hồ sơ duyệt từ trước khi có
  // định giá không có `finalAnnualInterestRate` nên lùi về lãi suất sản phẩm.
  const annualRate =
    application.status === 'APPROVED'
      ? application.finalAnnualInterestRate ?? application.productSnapshot.annualInterestRate
      : application.productSnapshot.annualInterestRate;

  const productName = application.productSnapshot.name;
  const purpose = purposeLabel(application.purposeCode);
  const amount = formatDong(application.requestedAmount);
  const term = `${application.requestedTermMonths} tháng`;
  const rate = `${rateFormat.format(annualRate)}%/năm`;
  const submittedOn = formatDate(application.submittedAt);

  return {
    applicationNumber: application.applicationNumber,
    productName,
    purposeLabel: purpose,
    icon: PURPOSE_ICONS[application.purposeCode] ?? NEUTRAL_PURPOSE_ICON,
    amount,
    term,
    rate,
    submittedOn,
    status,
    accessibilityLabel:
      `${productName}, ${status.label}. Số tiền ${amount}, kỳ hạn ${term}, lãi suất ${rate}. ` +
      `Mục đích: ${purpose}. Mã hồ sơ ${application.applicationNumber}, nộp ngày ${submittedOn}.`,
  };
}
