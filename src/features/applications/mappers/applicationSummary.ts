import type { IconName } from '@/constants/icons';
import type { LoanContractSummary } from '@/types/contract';
import type { LoanApplication, LoanApplicationHistory, LoanApplicationStatus } from '@/types/loan';
import { formatAnnualRateShort } from '@/utils/format';
import { REPAYMENT_LABELS, REPAYMENT_SHORT_LABELS } from '../constant';
import { contractActionLabel } from './statusMeta';

/** Một ô thông số của thẻ tóm tắt: ô biểu tượng, giá trị đậm, nhãn nhỏ. */
export type KeyTerm = { icon: IconName; label: string; value: string };

/**
 * Ba thông số dưới số tiền vay ở thẻ tóm tắt (mockup 26/09/2026): kỳ hạn, lãi
 * suất, hình thức trả. Số tiền vay không nằm trong dải này vì đã in cỡ lớn ngay
 * phía trên.
 *
 * Lãi suất là mức sau thẩm định khi hồ sơ đã có điều khoản cuối, còn lại là mức
 * cơ sở của sản phẩm lúc nộp. Nhãn nói rõ đó là mức nào (cuối, đề nghị đang chờ
 * bạn trả lời, hay cơ sở) để con số không bị đọc nhầm thành lãi đã chốt.
 */
export function buildKeyTerms(application: LoanApplication, showFinalTerms: boolean): KeyTerm[] {
  const product = application.productSnapshot;
  const finalRate = showFinalTerms ? application.finalAnnualInterestRate : null;
  const pending = application.termsConfirmation?.status === 'PENDING';

  const rate: KeyTerm =
    finalRate != null
      ? {
          icon: 'chartNoAxesColumn',
          label: pending ? 'Lãi suất đề nghị' : 'Lãi suất cuối',
          value: formatAnnualRateShort(finalRate),
        }
      : {
          icon: 'chartNoAxesColumn',
          label: 'Lãi suất cơ sở',
          value: formatAnnualRateShort(product.annualInterestRate),
        };

  return [
    { icon: 'calendar', label: 'Kỳ hạn', value: `${application.requestedTermMonths} tháng` },
    rate,
    {
      icon: 'refreshCw',
      label: 'Hình thức trả',
      // Mã phương thức backend mới bổ sung thì hiện nguyên mã, như phần thông tin đã gửi.
      value:
        REPAYMENT_SHORT_LABELS[product.repaymentMethod] ??
        REPAYMENT_LABELS[product.repaymentMethod] ??
        product.repaymentMethod,
    },
  ];
}

/** Ngày ra kết quả, in dưới nhãn trạng thái ở thẻ tóm tắt. */
export type DecisionDate = { label: string; at: string };

const DECISION_LABELS: Partial<Record<LoanApplicationStatus, string>> = {
  APPROVED: 'Ngày duyệt',
  REJECTED: 'Ngày có kết quả',
};

/**
 * Application không có trường ngày duyệt riêng, nên lấy lần gần nhất hồ sơ
 * chuyển sang đúng trạng thái hiện tại trong lịch sử backend ghi nhận. Lịch sử
 * chưa tải được thì không hiện ngày, không đoán bằng `updatedAt` vì trường đó
 * còn đổi khi borrower xác nhận điều khoản. Hồ sơ đã rút dùng thẳng `withdrawnAt`.
 */
export function decisionDateOf(
  application: LoanApplication,
  history: readonly LoanApplicationHistory[],
): DecisionDate | null {
  if (application.status === 'WITHDRAWN') {
    return application.withdrawnAt ? { label: 'Ngày rút hồ sơ', at: application.withdrawnAt } : null;
  }

  const label = DECISION_LABELS[application.status];
  if (!label) return null;

  let latest: LoanApplicationHistory | null = null;
  for (const entry of history) {
    if (entry.toStatus !== application.status) continue;
    if (!latest || new Date(entry.createdAt).getTime() > new Date(latest.createdAt).getTime()) {
      latest = entry;
    }
  }
  return latest ? { label, at: latest.createdAt } : null;
}

/** Nút hợp đồng ở thẻ tóm tắt. */
export type ContractAction = {
  label: string;
  /** `null` khi chưa dò ra hợp đồng của hồ sơ: nút mở danh sách hợp đồng thay vì một hợp đồng cụ thể. */
  contractNumber: string | null;
  /** Người vay phải làm ngay (đọc và ký, xác nhận SmartCA) thì nút đặc; chỉ để xem lại thì nút dòng nhạt. */
  urgent: boolean;
};

/**
 * Chỉ hồ sơ đã duyệt mà điều khoản không còn chờ hay bị từ chối mới có hợp đồng
 * (PENDING/DECLINED/EXPIRED chắc chắn chưa có Contract), cùng điều kiện với việc
 * hook có dò hợp đồng hay không.
 */
export function contractActionOf(
  application: LoanApplication,
  contract: LoanContractSummary | null,
): ContractAction | null {
  const terms = application.termsConfirmation?.status;
  const contractStage =
    application.status === 'APPROVED' &&
    (terms == null || terms === 'AUTO_AUTHORIZED' || terms === 'ACCEPTED');
  if (!contractStage) return null;

  if (!contract) return { label: 'Xem hợp đồng', contractNumber: null, urgent: true };
  return {
    label: contractActionLabel(contract.status),
    contractNumber: contract.contractNumber,
    urgent: contract.status === 'PENDING_SIGNATURE' || contract.status === 'SIGNING',
  };
}
