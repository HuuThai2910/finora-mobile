import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SchedulePeriod } from '@/types/loan';
import { DetailButton, DetailCard, DetailNote } from '@/features/applications';
import { Spacing } from '@/theme';
import { RESCHEDULE_DATE_SUGGESTIONS } from '../constants';
import { useRescheduleForm } from '../hooks/useRescheduleForm';
import { addDays } from '../mappers/date';
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
  onSubmitted: (request: RescheduleRequest) => void;
  onStale: () => void;
};

/**
 * Biểu mẫu đề nghị cơ cấu: chọn hình thức, điền thông tin, xác nhận điều khoản rồi gửi.
 * Ngày bắt đầu điền sẵn ngày đến hạn kỳ tới, vì Fineract chỉ nhận ngày trùng ngày đến hạn
 * của một kỳ chưa trả; người vay vẫn chọn kỳ khác hoặc gõ tay được.
 */
export default function RescheduleForm({ loanNumber, policy, loan, periods, onSubmitted, onStale }: Props) {
  // Chốt "hôm nay" một lần cho cả biểu mẫu để kiểm tra và gợi ý không đổi giữa chừng qua nửa đêm.
  const [today] = useState(() => localDate());
  const options = upcomingDueDates(loan, periods, today, RESCHEDULE_DATE_SUGGESTIONS);
  const form = useRescheduleForm({
    loanNumber,
    termsVersion: policy.termsVersion,
    today,
    defaultFromDate: options[0]?.date ?? today,
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
        <RescheduleTypePicker value={values.type} onChange={type => set('type', type)} />
      </DetailCard>

      <DetailCard title="Thông tin đề nghị" icon="calendar">
        <RescheduleDateField
          label="Áp dụng từ kỳ"
          value={values.fromDate}
          onChange={value => set('fromDate', value)}
          helper="Chọn một kỳ chưa trả. Kỳ khác thì chạm ô để chọn đúng ngày đến hạn của kỳ đó."
          error={errorOf('fromDate')}
          minDate={today}
          sheetTitle="Ngày đến hạn của kỳ áp dụng"
          options={options}
        />
        {extension ? (
          <RescheduleTermStepper
            value={values.extraTerms}
            onChange={value => set('extraTerms', value)}
            error={errorOf('extraTerms')}
          />
        ) : (
          <RescheduleDateField
            label="Ngày đến hạn mới"
            value={values.adjustedDate}
            onChange={value => set('adjustedDate', value)}
            helper="Ngày bạn sẽ trả kỳ đã chọn, phải sau ngày đến hạn cũ."
            error={errorOf('adjustedDate')}
            minDate={adjustedMin}
            sheetTitle="Ngày đến hạn mới"
          />
        )}
        <RescheduleReasonField value={values.reason} onChange={value => set('reason', value)} error={errorOf('reason')} />
      </DetailCard>

      <RescheduleConsent
        termsText={policy.termsText}
        checked={values.accepted}
        onChange={checked => set('accepted', checked)}
        error={errorOf('accepted')}
      />

      {form.error ? <DetailNote tone="warn">{form.error}</DetailNote> : null}

      <View style={styles.action}>
        <DetailButton label="Gửi đề nghị" icon="fileCheck" onPress={() => void form.submit()} loading={form.busy} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  action: { marginTop: Spacing.xs },
});
