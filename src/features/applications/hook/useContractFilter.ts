import { useState } from 'react';
import type { LoanContractSummary } from '@/types/contract';
import { buildContractChips, type ContractFilter } from '../mappers/contractCard';

/**
 * Lọc danh sách hợp đồng theo trạng thái ngay trên máy.
 *
 * - Input: các hợp đồng đã tải của `GET /loan-contracts/me`.
 * - Output: trạng thái đang chọn, hàm chọn, chip kèm số hợp đồng, hợp đồng hiển thị.
 * - Không gọi API: Loan Service chưa có tham số lọc theo trạng thái, nên chỉ lọc
 *   trong trang đã tải.
 *
 * Lựa chọn chỉ có nghĩa trong màn này nên giữ bằng `useState`, không đưa lên Redux.
 */
export function useContractFilter(contracts: readonly LoanContractSummary[]) {
  const [selected, setSelected] = useState<ContractFilter>('all');

  return {
    selected,
    select: setSelected,
    chips: buildContractChips(contracts.map(item => item.status), selected),
    visible: selected === 'all' ? contracts : contracts.filter(item => item.status === selected),
  };
}
