import { PItem } from '@/components/phone';
import type { LoanContractDetail } from '@/types/contract';
import { formatRecentTime } from '@/utils/format';
import DetailCard from './DetailCard';
import DetailNote from './DetailNote';

export default function ContractDisbursementCard({ contract }: { contract: LoanContractDetail }) {
  if (!contract.disbursementStatus) return null;
  const completed = contract.disbursementStatus === 'COMPLETED';
  const needsAttention = contract.disbursementStatus === 'REPAIR_REQUIRED'
    || contract.disbursementStatus === 'PAYMENT_FAILED';

  return (
    <DetailCard>
      <PItem label="Giải ngân" value={statusLabel(contract.disbursementStatus)} />
      {contract.paymentReference ? <PItem label="Mã thanh toán" value={contract.paymentReference} /> : null}
      {contract.fineractLoanId ? <PItem label="Mã khoản vay core" value={String(contract.fineractLoanId)} /> : null}
      {contract.disbursedAt ? <PItem label="Hoàn tất lúc" value={formatRecentTime(contract.disbursedAt)} last /> : null}
      {completed ? (
        <DetailNote>Khoản vay đã được ghi nhận trên core lending và hoàn tất giải ngân.</DetailNote>
      ) : needsAttention ? (
        <DetailNote tone="warn">
          Giao dịch đang được FINORA đối soát. Hợp đồng vẫn có hiệu lực và hệ thống không tạo lệnh chuyển tiền thứ hai khi chưa xác định kết quả.
        </DetailNote>
      ) : (
        <DetailNote>Hệ thống đang tự động xử lý giải ngân. Bạn không cần ký hoặc gửi lại yêu cầu.</DetailNote>
      )}
    </DetailCard>
  );
}

function statusLabel(status: NonNullable<LoanContractDetail['disbursementStatus']>): string {
  switch (status) {
    case 'WAITING_PAYMENT': return 'Đang chuyển tiền';
    case 'CORE_BOOKING_PENDING': return 'Đã chuyển tiền, chờ ghi nhận khoản vay';
    case 'CORE_BOOKING': return 'Đang ghi nhận khoản vay';
    case 'RETRY_PENDING': return 'Đang tự động thử lại';
    case 'REPAIR_REQUIRED': return 'Cần đối soát';
    case 'COMPLETED': return 'Đã giải ngân';
    case 'PAYMENT_FAILED': return 'Thanh toán cần kiểm tra';
  }
}
