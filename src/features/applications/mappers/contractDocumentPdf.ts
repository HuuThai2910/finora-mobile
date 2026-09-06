import type { LoanContractDetail } from '@/types/contract';
import { formatDateTime } from '@/utils/format';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function documentLine(line: string, index: number): string {
  const safe = escapeHtml(line);
  if (!line.trim()) return '<div class="space"></div>';
  if (index === 0 && line === 'HỢP ĐỒNG VAY FINORA') return `<h1>${safe}</h1>`;
  if (/^\d+\.\s/.test(line)) return `<h2>${safe}</h2>`;
  if (line.startsWith('Kỳ ')) return `<p class="period">${safe}</p>`;
  return `<p>${safe}</p>`;
}

function confirmationReceipt(contract: LoanContractDetail): string {
  if (contract.status !== 'SIGNED' && contract.status !== 'EFFECTIVE' && contract.status !== 'COMPLETED') {
    return '';
  }

  return `
    <section class="receipt">
      <div class="receipt-mark">✓</div>
      <div>
        <h3>ĐÃ XÁC NHẬN ĐIỆN TỬ</h3>
        <p>Người xác nhận: ${escapeHtml(contract.signedBy ?? 'Người vay')}</p>
        <p>Thời gian: ${escapeHtml(contract.signedAt ? formatDateTime(contract.signedAt) : 'Không có dữ liệu')}</p>
        <p>Phương thức: Click-wrap trong hệ thống FINORA</p>
      </div>
    </section>`;
}

/**
 * Tạo bản PDF trình bày từ đúng `documentContent` Loan Service đã phát hành.
 * Không sửa hoặc băm lại nội dung: chữ ký vẫn đối chiếu bằng `documentHash`
 * của bản text gốc, còn PDF giúp người vay đọc, lưu và chia sẻ thuận tiện.
 */
export function buildContractPdfHtml(contract: LoanContractDetail): string {
  const content = contract.documentContent
    .split('\n')
    .map(documentLine)
    .join('');

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    @page { size: A4; margin: 17mm 16mm 18mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #172033; font-family: Arial, "Helvetica Neue", sans-serif; font-size: 11pt; line-height: 1.55; }
    .brand { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #1d4ed8; padding-bottom: 10px; margin-bottom: 22px; }
    .brand strong { color: #1d4ed8; font-size: 18pt; letter-spacing: 1px; }
    .brand span { color: #64748b; font-size: 9pt; }
    h1 { margin: 0 0 22px; text-align: center; font-size: 20pt; letter-spacing: .4px; }
    h2 { color: #1e40af; font-size: 13pt; margin: 22px 0 8px; page-break-after: avoid; }
    h3 { margin: 0 0 6px; color: #166534; font-size: 11pt; }
    p { margin: 4px 0; }
    .period { margin: 7px 0; padding: 7px 9px; background: #f8fafc; border-left: 3px solid #bfdbfe; page-break-inside: avoid; }
    .space { height: 8px; }
    .receipt { display: flex; gap: 12px; margin-top: 26px; padding: 14px; border: 1px solid #86efac; background: #f0fdf4; page-break-inside: avoid; }
    .receipt-mark { width: 30px; height: 30px; border-radius: 15px; background: #16a34a; color: white; text-align: center; line-height: 30px; font-weight: bold; }
    .receipt p { margin: 2px 0; font-size: 9.5pt; }
    .evidence { margin-top: 26px; padding-top: 10px; border-top: 1px solid #cbd5e1; color: #64748b; font-size: 8pt; word-break: break-all; }
  </style>
</head>
<body>
  <header class="brand">
    <strong>FINORA</strong>
    <span>Bản hợp đồng điện tử · ${escapeHtml(contract.contractNumber)}</span>
  </header>
  <main>${content}</main>
  ${confirmationReceipt(contract)}
  <footer class="evidence">
    Bản PDF này trình bày nguyên văn nội dung do Loan Service phát hành. Mã kiểm tra nội dung gốc (SHA-256):
    ${escapeHtml(contract.documentHash)}
  </footer>
</body>
</html>`;
}
