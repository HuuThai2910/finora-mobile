import { isMocked } from '@/lib/mockFlag';
import * as investMock from '@/lib/mocks/invest';
import { apiFetch, investmentFetch } from '@/lib/api';
import { PIN_TOKEN_HEADER } from '@/features/pin';
import type {
  InvestmentContract,
  InvestmentCommitment,
  InvestorRescheduleConsent,
  PortfolioSummary,
} from '@/types/invest';
import {
  toInvestmentContract,
  toPortfolioSummary,
  type InvestorContractDto,
  type InvestmentCommitmentDto,
  type PortfolioDto,
  toInvestmentCommitment,
} from './mapper';

export const getPortfolio = async (): Promise<PortfolioSummary> => {
  if (isMocked('invest')) return investMock.getPortfolio();

  const portfolio = await investmentFetch<PortfolioDto>('/investments/portfolio');
  return toPortfolioSummary(portfolio);
};

/**
 * Hợp đồng đầu tư cần xử lý: ưu tiên bản đang chờ mình ký, không có thì bản gần nhất. Chưa có hợp
 * đồng nào là trạng thái bình thường (chưa góp vốn vào khoản nào đủ vốn), nên trả null cho màn hiện
 * trạng thái trống thay vì báo lỗi.
 */
export const getInvestmentContracts = async (signal?: AbortSignal): Promise<InvestmentContract[]> => {
  if (isMocked('signature')) return [await investMock.getInvestmentContract()];
  const contracts = await apiFetch<InvestorContractDto[]>('/investor/loan-contracts/me', { signal });
  return contracts.map(toInvestmentContract);
};

export const getInvestmentContract = async (
  contractNumber?: string,
  signal?: AbortSignal,
): Promise<InvestmentContract | null> => {
  if (isMocked('signature')) return investMock.getInvestmentContract();
  if (contractNumber) {
    const contract = await apiFetch<InvestorContractDto>(
      `/investor/loan-contracts/${encodeURIComponent(contractNumber)}`,
      { signal },
    );
    return toInvestmentContract(contract);
  }
  const contracts = await apiFetch<InvestorContractDto[]>('/investor/loan-contracts/me', { signal });
  const selected = contracts.find(item => (item.partyStatus === 'PENDING_SIGNATURE'
      || item.partyStatus === 'SIGNING')
      && item.contractStatus === 'PENDING_LENDER_SIGNATURES')
    ?? contracts[0];
  return selected ? toInvestmentContract(selected) : null;
};

export const getInvestmentCommitments = async (
  signal?: AbortSignal,
): Promise<InvestmentCommitment[]> => {
  if (isMocked('invest')) return [];
  const items = await investmentFetch<InvestmentCommitmentDto[]>('/investments/commitments', { signal });
  return items.map(toInvestmentCommitment);
};

/** Hủy lệnh sơ cấp khi listing còn OPEN; backend nhả hold sau commit và worker sẽ retry nếu Payment tạm lỗi. */
export const cancelInvestmentCommitment = async (
  commitment: InvestmentCommitment,
): Promise<void> => {
  if (!commitment.orderReference) throw new Error('Phần vốn chưa có mã lệnh để hủy.');
  await investmentFetch(`/investments/orders/${commitment.orderReference}/cancel`, { method: 'POST' });
};

export const declineInvestmentContract = async (
  contract: InvestmentContract,
  idempotencyKey: string,
  reasonDetail?: string,
): Promise<InvestmentContract> => {
  if (isMocked('signature')) return { ...contract, status: 'DECLINED', contractStatus: 'DECLINED' };
  const declined = await apiFetch<InvestorContractDto>(
    `/investor/loan-contracts/${contract.reference}/decline`,
    {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({
        version: contract.version,
        reasonCode: 'INVESTOR_CHANGED_MIND',
        reasonDetail: reasonDetail?.trim() || null,
      }),
    },
  );
  return toInvestmentContract(declined);
};

/**
 * Retry cùng một ý định phải truyền lại đúng idempotency key do screen đang giữ.
 * `pinToken` (phạm vi `SIGN_CONTRACT`) thì luôn mới cho từng lần bấm ký.
 */
export const signContract = async (
  contract: InvestmentContract,
  idempotencyKey: string,
  pinToken: string,
): Promise<InvestmentContract> => {
  if (isMocked('signature')) {
    await investMock.signContract();
    return { ...contract, status: 'SIGNED' };
  }
  const signed = await apiFetch<InvestorContractDto>(
    `/investor/loan-contracts/${contract.reference}/sign`,
    {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey, [PIN_TOKEN_HEADER]: pinToken },
      body: JSON.stringify({
        version: contract.version,
        documentHash: contract.documentHash,
        pdfDocumentHash: contract.pdfDocumentHash,
        signatureMethod: contract.availableSignatureMethod,
      }),
    },
  );
  return toInvestmentContract(signed);
};

/** Lấy trạng thái mới nhất của giao dịch SmartCA đang chờ nhà đầu tư xác nhận. */
export const refreshContractSignature = async (
  contract: InvestmentContract,
): Promise<InvestmentContract> => {
  const refreshed = await apiFetch<InvestorContractDto>(
    `/investor/loan-contracts/${contract.reference}/signature/refresh`,
    { method: 'POST' },
  );
  return toInvestmentContract(refreshed);
};

/** Danh sách đề nghị cơ cấu mà tài khoản nhà đầu tư hiện tại có quyền biểu quyết. */
type ConsentPage = { content: InvestorRescheduleConsent[] };

export const getRescheduleConsents = async (signal?: AbortSignal): Promise<InvestorRescheduleConsent[]> => {
  if (isMocked('invest')) return [];
  const page = await investmentFetch<ConsentPage>('/investments/reschedule-consents?page=0&size=100', { signal });
  return page.content;
};

/**
 * Đồng ý hoặc từ chối đề nghị cơ cấu. Cùng một lần bấm phải giữ nguyên idempotency key
 * để việc retry không tạo ra hai quyết định.
 */
export const decideRescheduleConsent = async (
  requestId: string,
  approve: boolean,
  idempotencyKey: string,
  comment?: string,
): Promise<InvestorRescheduleConsent> => investmentFetch<InvestorRescheduleConsent>(
  `/investments/reschedule-consents/${requestId}/${approve ? 'approve' : 'reject'}`,
  {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ comment: comment?.trim() || null }),
  },
);
