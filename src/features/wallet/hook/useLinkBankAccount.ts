import { useRef, useState } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { ApiError, generateIdempotencyKey, toUserMessage } from '@/lib/api';
import { usePinGuard } from '@/features/pin';
import type { BankAccount, BankAccountInquiry, BankLinkChallenge } from '@/types/wallet';
import { confirmBankLink, getBanks, inquireBankAccount, resendBankLinkOtp, startBankLink } from '../api';
import { BANK_ACCOUNT_NUMBER_PATTERN, BANK_LINK_OTP_LENGTH } from '../mappers/bankAccount';

export type LinkStep = 'account' | 'otp' | 'done';

/** Lỗi kết thúc yêu cầu đang chờ OTP: phải bắt đầu lại từ bước nhập tài khoản. */
const TERMINAL_OTP_CODES = new Set(['BANK_LINK_LOCKED', 'BANK_LINK_NOT_PENDING', 'BANK_LINK_RESEND_LIMIT']);

/**
 * Luồng liên kết một tài khoản ngân hàng (BL-001), ba bước:
 * 1. chọn ngân hàng + nhập số tài khoản → hỏi ngân hàng tên chủ tài khoản (chưa lưu gì);
 * 2. tên khớp eKYC thì xác nhận PIN `BANK_ACCOUNT` → ngân hàng gửi OTP (bản giả lập gửi vào hộp thư FINORA);
 * 3. nhập OTP → tài khoản được liên kết.
 *
 * State nằm cục bộ trong màn: rời màn là bỏ, số tài khoản đầy đủ không được giữ ở đâu khác. Khoá idempotency gắn với
 * ý định "liên kết đúng ngân hàng + số tài khoản này": nhập sai PIN rồi thử lại không gửi thêm OTP; đổi tài khoản là ý
 * định mới. Cờ chống bấm lặp nằm ở ref vì hai lần chạm liên tiếp xảy ra trước khi state kịp cập nhật.
 */
export function useLinkBankAccount() {
  const banks = useAsync(signal => getBanks(signal), []);
  const { requirePin } = usePinGuard();
  const [step, setStep] = useState<LinkStep>('account');
  const [bankCode, setBankCode] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [inquiry, setInquiry] = useState<BankAccountInquiry | null>(null);
  const [challenge, setChallenge] = useState<BankLinkChallenge | null>(null);
  const [otp, setOtp] = useState('');
  const [linked, setLinked] = useState<BankAccount | null>(null);
  const [busy, setBusy] = useState<'inquiry' | 'start' | 'confirm' | 'resend' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);
  const intent = useRef<{ fingerprint: string; key: string } | null>(null);

  const numberValid = BANK_ACCOUNT_NUMBER_PATTERN.test(accountNumber);

  const guard = async (kind: NonNullable<typeof busy>, action: () => Promise<void>) => {
    if (running.current) return;
    running.current = true;
    setBusy(kind);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(toUserMessage(e));
      if (e instanceof ApiError && TERMINAL_OTP_CODES.has(e.code)) {
        // Yêu cầu đã khóa hoặc hết lượt gửi lại: quay về bước đầu, giữ tài khoản đã chọn để bắt đầu lại nhanh.
        setChallenge(null);
        setOtp('');
        intent.current = null;
        setStep('account');
      }
    } finally {
      running.current = false;
      setBusy(null);
    }
  };

  /** Đổi ngân hàng hoặc số tài khoản thì kết quả tra cứu cũ không còn đúng. */
  const chooseBank = (code: string) => {
    setBankCode(code);
    setInquiry(null);
    setError(null);
  };
  const changeAccountNumber = (value: string) => {
    setAccountNumber(value.replace(/\D/g, ''));
    setInquiry(null);
    setError(null);
  };

  const lookUp = () =>
    guard('inquiry', async () => {
      if (!bankCode || !numberValid) return;
      setInquiry(await inquireBankAccount({ bankCode, accountNumber }));
    });

  const start = () =>
    guard('start', async () => {
      if (!bankCode || !inquiry?.nameMatched) return;
      const fingerprint = `${bankCode}|${accountNumber}`;
      if (intent.current?.fingerprint !== fingerprint) {
        intent.current = { fingerprint, key: generateIdempotencyKey() };
      }
      const { key } = intent.current;
      const pinToken = await requirePin('BANK_ACCOUNT', key);
      if (!pinToken) return;
      setChallenge(await startBankLink({ bankCode, accountNumber }, key, pinToken));
      setOtp('');
      setStep('otp');
    });

  const confirm = () =>
    guard('confirm', async () => {
      if (!challenge || otp.length !== BANK_LINK_OTP_LENGTH) return;
      setLinked(await confirmBankLink(challenge.linkRequestId, otp));
      intent.current = null;
      setStep('done');
    });

  const resend = () =>
    guard('resend', async () => {
      if (!challenge) return;
      setChallenge(await resendBankLinkOtp(challenge.linkRequestId));
      setOtp('');
    });

  /** Quay lại sửa tài khoản từ bước OTP; yêu cầu cũ tự hết hạn phía Payment. */
  const backToAccount = () => {
    setChallenge(null);
    setOtp('');
    setError(null);
    intent.current = null;
    setStep('account');
  };

  return {
    banks,
    step,
    bankCode,
    accountNumber,
    numberValid,
    inquiry,
    challenge,
    otp,
    linked,
    busy,
    error,
    chooseBank,
    changeAccountNumber,
    setOtp: (value: string) => {
      setOtp(value.replace(/\D/g, '').slice(0, BANK_LINK_OTP_LENGTH));
      setError(null);
    },
    lookUp,
    start,
    confirm,
    resend,
    backToAccount,
  };
}
