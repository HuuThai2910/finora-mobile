import type { IconName } from "@/constants/icons";
import type { LoanContractDetail } from "@/types/contract";
import {
  formatAnnualRate,
  formatDate,
  formatDateTime,
  formatTime,
} from "@/utils/format";
import type { Countdown } from "../hook/useCountdown";
import type { KeyTerm } from "./applicationSummary";

/**
 * Một ô thông số ở thẻ đầu màn hợp đồng. `sub` là dòng thứ hai của mốc thời
 * gian: dòng trên ghi nhãn kèm giờ ("Ký lúc 23:13"), dòng dưới ghi ngày.
 */
export type ContractTerm = KeyTerm & { sub?: string };

/** Mốc thời gian quan trọng nhất của hợp đồng ở trạng thái hiện tại. */
export type ContractFact = ContractTerm & {
  /** Sắp hết hạn hoặc đã hết hạn: màn nhắc thêm bằng dòng cảnh báo riêng. */
  urgent: boolean;
};

/**
 * Mỗi trạng thái chỉ có một mốc đáng nói (hạn ký, lúc ký, ngày hiệu lực…); lấy
 * đúng trường thời gian backend ghi cho trạng thái đó, thiếu thì không bịa.
 */
export function contractFact(
  contract: LoanContractDetail,
  countdown: Countdown,
): ContractFact | null {
  // Nhãn và giờ phút chung một dòng ("Ký lúc 23:13"), ngày tháng năm dòng dưới:
  // ô thông số hẹp, để chữ tự bẻ sẽ cắt ngang con số ngày.
  const at = (
    label: string,
    value: string | null | undefined,
    icon: IconName,
  ): ContractFact | null =>
    value
      ? {
          label,
          value: formatTime(value),
          sub: formatDate(value),
          icon,
          urgent: false,
        }
      : null;

  switch (contract.status) {
    case "PENDING_SIGNATURE":
      return countdown.expired
        ? {
            label: "Hạn xác nhận",
            value: "Đã hết hạn",
            icon: "clock",
            urgent: true,
          }
        : {
            label: "Hạn xác nhận",
            value:
              countdown.label || `đến ${formatDateTime(contract.expiresAt)}`,
            icon: "clock",
            urgent: countdown.urgent,
          };
    case "SIGNING":
      return {
        label: "Ký số",
        value: "Chờ SmartCA",
        icon: "clock",
        urgent: false,
      };
    case "SIGNED":
      return at("Ký lúc", contract.signedAt, "calendarCheck");
    case "EFFECTIVE":
      return at("Hiệu lực từ", contract.effectiveAt, "shieldCheck");
    case "DECLINED":
      return at("Từ chối lúc", contract.declinedAt, "x");
    case "EXPIRED":
      return {
        label: "Hạn xác nhận",
        value: "Đã hết hạn",
        icon: "clock",
        urgent: true,
      };
    case "COMPLETED":
      return {
        label: "Tình trạng",
        value: "Đã tất toán",
        icon: "check",
        urgent: false,
      };
  }
}

/**
 * Ba ô dưới số tiền vay (mockup 26/09/2026): thời hạn, lãi suất áp dụng trong
 * hợp đồng, và mốc thời gian của trạng thái hiện tại nếu có.
 */
export function contractKeyTerms(
  contract: LoanContractDetail,
  fact: ContractFact | null,
): ContractTerm[] {
  const terms: ContractTerm[] = [
    {
      icon: "calendar",
      label: "Thời hạn",
      value: `${contract.termMonths} tháng`,
    },
    {
      icon: "percent",
      label: "Lãi suất",
      value: formatAnnualRate(contract.annualInterestRate),
    },
  ];
  if (fact)
    terms.push({
      icon: fact.icon,
      label: fact.label,
      value: fact.value,
      sub: fact.sub,
    });
  return terms;
}
