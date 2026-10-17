import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  MarketStackParamList,
  ProfileStackParamList,
  WalletStackParamList,
} from '@/navigation/types';
import type { ActionTarget } from '@/types/assistant';

/**
 * Đích của một nút trong câu trả lời, đã đổi sang đúng kiểu của navigation.
 *
 * Server gửi `{screen, params}` toàn chuỗi (bảng `deeplinks.py`, spec mục 13.3). App không tin tên
 * màn đó: chỉ màn có trong bảng dưới mới thành nút, tham số được kiểm lại và đổi sang số khi màn cần
 * số. Màn lạ hoặc tham số sai thì trả `null` để nút bị ẩn, nên câu trả lời không bao giờ đưa người
 * dùng tới một màn tùy ý.
 *
 * Mỗi màn nằm trong stack của một tab. `initial: false` giữ màn gốc của tab bên dưới, để nút quay
 * lại từ màn được mở về đúng danh sách của tab đó.
 */
export type AssistantNavTarget =
  | { tab: 'Hồ sơ'; params: NavigatorScreenParams<ProfileStackParamList> }
  | { tab: 'Sàn'; params: NavigatorScreenParams<MarketStackParamList> }
  | { tab: 'Ví'; params: NavigatorScreenParams<WalletStackParamList> };

type Params = Readonly<Record<string, string | undefined>>;
type Builder = (params: Params) => AssistantNavTarget | null;

/** Cùng khuôn `MA_NGHIEP_VU` của server: không khoảng trắng, không "/" hay "?". */
const CODE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DIGITS = /^\d{1,12}$/;

const code = (params: Params, key: string): string | null => {
  const value = params[key];
  return value !== undefined && CODE.test(value) ? value : null;
};

const positiveInt = (params: Params, key: string): number | null => {
  const value = params[key];
  if (value === undefined || !DIGITS.test(value)) return null;
  const parsed = Number(value);
  return parsed > 0 ? parsed : null;
};

const profile = (params: NavigatorScreenParams<ProfileStackParamList>): AssistantNavTarget => ({ tab: 'Hồ sơ', params });
const market = (params: NavigatorScreenParams<MarketStackParamList>): AssistantNavTarget => ({ tab: 'Sàn', params });
const wallet = (params: NavigatorScreenParams<WalletStackParamList>): AssistantNavTarget => ({ tab: 'Ví', params });

/** Màn cần đúng một mã nghiệp vụ dạng chuỗi. */
const withCode =
  (key: string, build: (value: string) => AssistantNavTarget): Builder =>
  params => {
    const value = code(params, key);
    return value ? build(value) : null;
  };

const applyForm: Builder = params => {
  const productId = positiveInt(params, 'productId');
  const amount = positiveInt(params, 'amount');
  const termMonths = positiveInt(params, 'termMonths');
  const expectedDisbursementDate = params.expectedDisbursementDate;
  if (!productId || !amount || !termMonths) return null;
  if (!expectedDisbursementDate || !ISO_DATE.test(expectedDisbursementDate)) return null;
  return market({
    screen: 'ApplyForm',
    params: { productId, amount, termMonths, expectedDisbursementDate },
    initial: false,
  });
};

/** Map thay cho object thường để tên màn lạ như "constructor" không trúng thuộc tính có sẵn. */
const BUILDERS = new Map<string, Builder>([
  ['ApplicationDetail', withCode('applicationNumber', applicationNumber =>
    profile({ screen: 'ApplicationDetail', params: { applicationNumber }, initial: false }))],
  ['ContractDetail', withCode('contractNumber', contractNumber =>
    profile({ screen: 'ContractDetail', params: { contractNumber }, initial: false }))],
  ['LoanServicingDetail', withCode('loanNumber', loanNumber =>
    profile({ screen: 'LoanServicingDetail', params: { loanNumber }, initial: false }))],
  ['LoanPayment', withCode('loanNumber', loanNumber =>
    profile({ screen: 'LoanPayment', params: { loanNumber }, initial: false }))],
  ['PartialPrepayment', withCode('loanNumber', loanNumber =>
    profile({ screen: 'PartialPrepayment', params: { loanNumber }, initial: false }))],
  ['EarlySettlement', withCode('loanNumber', loanNumber =>
    profile({ screen: 'EarlySettlement', params: { loanNumber }, initial: false }))],
  ['RescheduleLoan', withCode('loanNumber', loanNumber =>
    profile({ screen: 'RescheduleLoan', params: { loanNumber }, initial: false }))],
  ['EkycCapture', () => profile({ screen: 'EkycCapture', params: { side: 'front' }, initial: false })],
  ['AccountInfo', () => profile({ screen: 'AccountInfo', initial: false })],
  ['ProductDetail', params => {
    const productId = positiveInt(params, 'productId');
    return productId ? market({ screen: 'ProductDetail', params: { productId }, initial: false }) : null;
  }],
  ['ApplyForm', applyForm],
  ['LoanDetail', withCode('loanId', loanId => market({ screen: 'LoanDetail', params: { loanId }, initial: false }))],
  ['TopUp', () => wallet({ screen: 'TopUp', initial: false })],
  ['OrderBook', params => {
    const listingId = positiveInt(params, 'listingId');
    return listingId ? wallet({ screen: 'OrderBook', params: { listingId }, initial: false }) : null;
  }],
  ['MyBookOrders', () => wallet({ screen: 'MyBookOrders', initial: false })],
  ['AutoInvest', () => wallet({ screen: 'AutoInvest', initial: false })],
  ['Portfolio', () => wallet({ screen: 'Portfolio', initial: false })],
  ['InvestContract', () => wallet({ screen: 'InvestContract', initial: false })],
]);

export function toNavTarget(target: ActionTarget): AssistantNavTarget | null {
  if (!target.screen) return null;
  const build = BUILDERS.get(target.screen);
  return build ? build(target.params) : null;
}
