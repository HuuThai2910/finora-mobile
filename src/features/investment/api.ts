import { isMocked } from '@/lib/mockFlag';
import * as investMock from '@/lib/mocks/invest';
import { apiFetch, investmentFetch } from '@/lib/api';
import { PIN_TOKEN_HEADER } from '@/features/pin';
import type {
  AutoInvestConfig,
  AutoInvestMatch,
  InvestmentContract,
  InvestorRescheduleConsent,
  PortfolioSummary,
} from '@/types/invest';
import {
  toAutoInvestConfig,
  toAutoInvestMatch,
  toInvestmentContract,
  toPortfolioSummary,
  type AutoInvestConfigDto,
  type AutoInvestMatchDto,
  type InvestorContractDto,
  type PortfolioDto,
} from './mapper';

export const getPortfolio = async (): Promise<PortfolioSummary> => {
  if (isMocked('invest')) return investMock.getPortfolio();

  const portfolio = await investmentFetch<PortfolioDto>('/investments/portfolio');
  return toPortfolioSummary(portfolio);
};

export const getAutoInvest = async (signal?: AbortSignal): Promise<AutoInvestConfig> => {
  if (isMocked('invest')) return investMock.getAutoInvest();
  const dto = await investmentFetch<AutoInvestConfigDto>('/investments/auto-invest', { signal });
  return toAutoInvestConfig(dto);
};

export const getAutoInvestMatches = async (signal?: AbortSignal): Promise<AutoInvestMatch[]> => {
  if (isMocked('invest')) return investMock.getAutoInvestMatches();
  const dtos = await investmentFetch<AutoInvestMatchDto[]>('/investments/auto-invest/matches?limit=20', {
    signal,
  });
  return dtos.map(toAutoInvestMatch);
};

/**
 * Lưu toàn bộ tiêu chí; bật lại sau khi tắt thì xuống cuối hàng chờ khớp lệnh.
 * Cần token PIN phạm vi `AUTO_INVEST` vì cấu hình này tự giữ tiền trong ví khi khớp. Bật quy tắc phải kèm phiên bản
 * công bố rủi ro người dùng vừa đọc (Q5); backend từ chối `RISK_DISCLOSURE_OUTDATED` nếu bản đã đổi.
 */
export const saveAutoInvest = async (
  config: AutoInvestConfig,
  pinToken: string,
  riskAcknowledgementVersion?: string,
): Promise<AutoInvestConfig> => {
  if (isMocked('invest')) return investMock.saveAutoInvest(config);
  const dto = await investmentFetch<AutoInvestConfigDto>('/investments/auto-invest', {
    method: 'PUT',
    headers: { [PIN_TOKEN_HEADER]: pinToken },
    body: JSON.stringify({
      enabled: config.enabled,
      grades: config.grades,
      minAnnualRate: config.minAnnualRate,
      maxTermMonths: config.maxTermMonths,
      amountPerLoan: config.amountPerLoan,
      riskAcknowledgementVersion: config.enabled ? riskAcknowledgementVersion : undefined,
    }),
  });
  return toAutoInvestConfig(dto);
};

/**
 * Hợp đồng đầu tư cần xử lý: ưu tiên bản đang chờ mình ký, không có thì bản gần nhất. Chưa có hợp
 * đồng nào là trạng thái bình thường (chưa góp vốn vào khoản nào đủ vốn), nên trả null cho màn hiện
 * trạng thái trống thay vì báo lỗi.
 */
export const getInvestmentContract = async (signal?: AbortSignal): Promise<InvestmentContract | null> => {
  if (isMocked('signature')) return investMock.getInvestmentContract();
  const contracts = await apiFetch<InvestorContractDto[]>('/investor/loan-contracts/me', { signal });
  const selected = contracts.find(item => (item.partyStatus === 'PENDING_SIGNATURE'
      || item.partyStatus === 'SIGNING')
      && item.contractStatus === 'PENDING_LENDER_SIGNATURES')
    ?? contracts[0];
  return selected ? toInvestmentContract(selected) : null;
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
