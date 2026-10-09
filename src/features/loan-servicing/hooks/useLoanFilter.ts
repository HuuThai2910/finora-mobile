import { useState } from 'react';
import { buildLoanChips, type LoanFilter } from '../mappers/servicing';
import type { ServicingLoanSummary } from '../types';

/**
 * Lọc danh sách khoản vay theo trạng thái ngay trên máy.
 *
 * - Input: các khoản vay đã tải của `GET /loans/me`.
 * - Output: trạng thái đang chọn, hàm chọn, chip kèm số khoản vay, khoản vay hiển thị.
 * - Không gọi API: Loan Service chưa có tham số lọc theo trạng thái, nên chỉ lọc trong
 *   trang đã tải (tối đa 50 khoản, người vay thực tế có vài khoản).
 *
 * Lựa chọn chỉ có nghĩa trong màn này nên giữ bằng `useState`.
 */
export function useLoanFilter(loans: readonly ServicingLoanSummary[]) {
  const [selected, setSelected] = useState<LoanFilter>('all');

  return {
    selected,
    select: setSelected,
    chips: buildLoanChips(loans.map(loan => loan.status), selected),
    visible: selected === 'all' ? loans : loans.filter(loan => loan.status === selected),
  };
}
