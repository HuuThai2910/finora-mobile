import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SchedulePeriod } from '@/types/loan';
import { DetailButton, DetailCard, DetailNote } from '@/features/applications';
import { Spacing } from '@/theme';
import { formatLocalDate } from '@/utils/format';
import { RESCHEDULE_DATE_SUGGESTIONS } from '../constants';
import { useRescheduleForm } from '../hooks/useRescheduleForm';
import { addDays, addMonths } from '../mappers/date';
import { isLocalDate, localDate, upcomingDueDates } from '../mappers/servicing';
import type { ReschedulePolicy, RescheduleRequest, ServicingLoanSummary } from '../types';
import RescheduleConsent from './RescheduleConsent';
import RescheduleDateField from './RescheduleDateField';
import RescheduleReasonField from './RescheduleReasonField';
import RescheduleTermStepper from './RescheduleTermStepper';
import RescheduleTypePicker from './RescheduleTypePicker';

type Props = {
  loanNumber: string;
  policy: ReschedulePolicy;
  loan: ServicingLoanSummary;
  periods: readonly SchedulePeriod[];
  pendingPaidDueDate?: string | null;
  onSubmitted: (request: RescheduleRequest) => void;
  onStale: () => void;
};

/**
 * Biểu mẫu đề nghị cơ cấu: chọn hình thức, điền thông tin, xác nhận điều khoản rồi gửi.
 * Gia hạn toàn khoản chỉ nhập số kỳ; Loan Service tự xác định kỳ chưa hoàn thành gần nhất.
 * Điều chỉnh một kỳ riêng lẻ mới cho người vay chọn kỳ và ngày trả mới.
 */
export default function RescheduleForm({ loanNumber, policy, loan, periods, pendingPaidDueDate, onSubmitted, onStale }: Props) {
  // Chốt "hôm nay" một lần cho cả biểu mẫu để kiểm tra và gợi ý không đổi giữa chừng qua nửa đêm.
  const [today] = useState(() => localDate());
  const options = upcomingDueDates(loan, periods, today, RESCHEDULE_DATE_SUGGESTIONS)
    .filter(option => option.date !== pendingPaidDueDate);
  const form = useRescheduleForm({
    loanNumber,
    termsVersion: policy.termsVersion,
    today,
    defaultFromDate: options[0]?.date ?? today,
    maximumExtraTerms: policy.maximumExtraTerms,
    maximumTotalTerms: policy.maximumTotalTerms,
    termExtensionAllowed: policy.termExtensionAllowed,
    onSubmitted,
    onStale,
  });
  const { values, set, errorOf } = form;
  const extension = values.type === 'TERM_EXTENSION';
  // Ngày đến hạn mới phải sau ngày bắt đầu, nên bảng chọn mở từ ngày hôm sau của kỳ đã chọn.
  const adjustedMin = addDays(isLocalDate(values.fromDate) && values.fromDate >= today ? values.fromDate : today, 1);

  return (
    <>
      <DetailCard title="Hình thức đề nghị" icon="refreshCw">
        <RescheduleTypePicker
          value={values.type}
          onChange={(type) => set("type", type)}
          termExtensionAllowed={policy.termExtensionAllowed}
        />
        {!policy.termExtensionAllowed && policy.termExtensionUnavailableReason ? (
          <DetailNote>{policy.termExtensionUnavailableReason}</DetailNote>
        ) : null}
      </DetailCard>

      <DetailCard title="Thông tin đề nghị" icon="calendar">
        {extension ? (
          <>
            <DetailNote>
              {`Hệ thống áp dụng từ kỳ chưa hoàn thành gần nhất${loan.nextDueDate ? ` (${formatLocalDate(loan.nextDueDate)})` : ''}. Bạn không cần chọn kỳ bắt đầu.`}
            </DetailNote>
            {pendingPaidDueDate ? (
              <DetailNote>
                {`Kỳ ${formatLocalDate(pendingPaidDueDate)} đã thanh toán trước và đang chờ ghi nhận; lịch gia hạn sẽ bắt đầu từ kỳ sau.`}
              </DetailNote>
            ) : null}
            <RescheduleTermStepper
              value={values.extraTerms}
              onChange={(value) => set("extraTerms", value)}
              maximum={policy.maximumExtraTerms}
              maximumTotalTerms={policy.maximumTotalTerms}
              error={errorOf("extraTerms")}
            />
            <DetailNote>
              {`Đáo hạn hiện tại: ${formatLocalDate(loan.maturityDate)} · Dự kiến sau gia hạn: ${formatLocalDate(addMonths(loan.maturityDate, values.extraTerms))}. Số chính thức do Fineract tính lại sau khi được duyệt.`}
            </DetailNote>
          </>
        ) : (
          <>
            <RescheduleDateField
              label="Kỳ muốn đổi ngày trả"
              value={values.fromDate}
              onChange={(value) => set("fromDate", value)}
              helper="Chỉ hiển thị các kỳ chưa hoàn thành."
              error={errorOf("fromDate")}
              minDate={today}
              sheetTitle="Chọn kỳ trả nợ cần điều chỉnh"
              options={options}
            />
            <RescheduleDateField
              label="Ngày trả mới của kỳ này"
              value={values.adjustedDate}
              onChange={(value) => set("adjustedDate", value)}
              helper="Chỉ dời kỳ đã chọn; các kỳ sau và ngày đáo hạn cuối không tự thay đổi."
              error={errorOf("adjustedDate")}
              minDate={adjustedMin}
              sheetTitle="Chọn ngày thanh toán mới"
            />
          </>
        )}
        <RescheduleReasonField
          value={values.reason}
          onChange={(value) => set("reason", value)}
          error={errorOf("reason")}
        />
      </DetailCard>

      <RescheduleConsent
        termsText={policy.termsText}
        checked={values.accepted}
        onChange={(checked) => set("accepted", checked)}
        error={errorOf("accepted")}
      />

      {form.error ? <DetailNote tone="warn">{form.error}</DetailNote> : null}

      <View style={styles.action}>
        <DetailButton
          label="Gửi đề nghị"
          icon="fileCheck"
          onPress={() => void form.submit()}
          loading={form.busy}
          // Chưa điền đủ (hoặc chưa đồng ý điều khoản) thì nút mờ, không bấm được.
          disabled={!form.valid}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  action: { marginTop: Spacing.xs },
});
