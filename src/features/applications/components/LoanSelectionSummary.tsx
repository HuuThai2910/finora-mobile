import { Card } from '@/components/ui';
import { PItem } from '@/components/phone';
import { formatDate, formatDong } from '@/utils/format';

type Props = {
  productName: string;
  amount: number;
  termMonths: number;
  annualInterestRate: number;
  expectedDisbursementDate: string;
};

/** Bản đọc lại lựa chọn bước 1; không tạo ô nhập thứ hai cho cùng amount/term. */
export default function LoanSelectionSummary({
  productName,
  amount,
  termMonths,
  annualInterestRate,
  expectedDisbursementDate,
}: Props) {
  return (
    <Card flush>
      <PItem label="Sản phẩm" value={productName} />
      <PItem label="Số tiền vay" value={formatDong(amount)} valueTone="brand" />
      <PItem label="Kỳ hạn" value={`${termMonths} tháng`} />
      <PItem label="Lãi suất sản phẩm" value={`${annualInterestRate}%/năm`} />
      <PItem label="Ngày giải ngân dự kiến" value={formatDate(expectedDisbursementDate)} last />
    </Card>
  );
}
