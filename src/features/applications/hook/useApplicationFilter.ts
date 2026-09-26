import { useState } from 'react';
import type { LoanContractSummary } from '@/types/contract';
import type { LoanApplication } from '@/types/loan';
import type { ApplicationStage } from '../constant';
import { applicationStage, buildStageChips, type StageFilter } from '../mappers/applicationStage';

/** Một hồ sơ kèm Contract (nếu đã lập) và nhóm lọc đã suy sẵn. */
export type StagedApplication = {
  application: LoanApplication;
  contract: LoanContractSummary | undefined;
  stage: ApplicationStage;
};

/**
 * Lọc danh sách hồ sơ theo nhóm trạng thái ngay trên máy.
 *
 * - Input: các hồ sơ `useMyApplications` đã tải và bảng Contract theo mã hồ sơ.
 * - Output: nhóm đang chọn, hàm chọn nhóm, chip kèm số hồ sơ, hồ sơ thuộc nhóm.
 * - Không gọi API: Loan Service chưa có tham số lọc theo trạng thái, nên chỉ lọc
 *   trong trang đã tải (20 hồ sơ đầu, cùng tham số với trang chủ).
 *
 * Lựa chọn chỉ có nghĩa trong màn này nên giữ bằng `useState`, không đưa lên Redux.
 */
export function useApplicationFilter(
  applications: readonly LoanApplication[],
  contracts: ReadonlyMap<string, LoanContractSummary>,
) {
  const [selected, setSelected] = useState<StageFilter>('all');

  const staged: StagedApplication[] = applications.map(application => {
    const contract = contracts.get(application.applicationNumber);
    return {
      application,
      contract,
      stage: applicationStage(
        application.status,
        contract?.status,
        application.termsConfirmation?.status,
      ),
    };
  });

  return {
    selected,
    select: setSelected,
    chips: buildStageChips(staged.map(item => item.stage), selected),
    visible: selected === 'all' ? staged : staged.filter(item => item.stage === selected),
  };
}
