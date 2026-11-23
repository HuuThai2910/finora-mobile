import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { Button, InfoNote } from '@/components/ui';
import type { EkycResultResponse } from '@/types/ekyc';
import { REPORT_TO_STAFF_AT } from '../constants/capture';
import { CARD_TYPE_LABEL, REPORT_TO_STAFF_COPY, resultMessage, warningLabels } from '../constants/messages';
import { isEditableKey, reviewData, toDraftRows } from '../mappers/draftFields';
import { useDraftEdits } from '../hooks/useDraftEdits';
import { useEkycConfirm } from '../hooks/useEkycConfirm';
import { useEkycSession } from '../hooks/useEkycSession';
import DraftFieldRow from './DraftFieldRow';

const REVIEW_NOTE = 'Hồ sơ sẽ được nhân viên FINORA duyệt thêm sau khi bạn xác nhận.';
const WAITING_NOTE = 'Trong lúc chờ, bạn vẫn dùng được ứng dụng nhưng chưa vay hoặc đầu tư được.';

type Props = {
  /** Kết quả liveness đạt (`LIVENESS_PASSED`), vùng xám (`LIVENESS_REVIEW`), hoặc kết quả đọc thẻ khi không có liveness. */
  outcome: EkycResultResponse;
  /** Kết quả bước quét thẻ (`DRAFT_READY`) — nguồn dự phòng của bản nháp. */
  scan: EkycResultResponse | null;
  /** Báo sai khi chưa tới lần gửi nhân viên: đếm một lần rồi chụp lại từ đầu. */
  onRescan: () => void;
};

/**
 * Soát bản nháp trước khi lưu. Hồ sơ CHƯA được ghi gì cho tới khi bấm xác nhận.
 *
 * Mỗi trường mang nhãn nguồn; chỉ trường "AI đọc" có ô sửa. Hồ sơ cần duyệt thêm (nguồn yếu, khuôn mặt vùng xám) thì
 * nói rõ trước khi xác nhận để người dùng không bất ngờ. Từ lần soát thứ `REPORT_TO_STAFF_AT`, nút báo sai gửi hồ sơ cho
 * nhân viên đối chiếu với ảnh thẻ thay vì bắt chụp lại (không hỏi lại, không gửi chỗ sửa).
 */
export default function DraftReview({ outcome, scan, onRescan }: Props) {
  const data = reviewData(outcome, scan);
  const rows = data.draft ? toDraftRows(data.draft, data.cardType) : [];
  const edits = useDraftEdits(rows);
  const confirm = useEkycConfirm();
  const session = useEkycSession();
  /** Lần gửi đang chạy là báo sai — chỉ nút đó hiện vòng quay. */
  const [reporting, setReporting] = useState(false);
  const warnings = warningLabels(data.warnings);
  const livenessReview = outcome.resultCode === 'LIVENESS_REVIEW';
  /** Server đã tắt bước kiểm tra khuôn mặt: soát ngay sau khi đọc thẻ, không có dòng kết quả khuôn mặt. */
  const cardOnly = outcome.resultCode === 'DRAFT_READY';
  const sendToStaff = session.incorrectReports >= REPORT_TO_STAFF_AT - 1;

  return (
    <View>
      <Text style={styles.lead}>
        Đối chiếu với thẻ của bạn. Thông tin <Text style={styles.leadBold}>chưa được lưu</Text> — xác nhận đúng
        thì hệ thống mới ghi vào hồ sơ.
      </Text>
      {data.cardType ? (
        <Text style={styles.cardType}>{`Loại thẻ: ${CARD_TYPE_LABEL[data.cardType] ?? data.cardType}`}</Text>
      ) : null}

      {rows.length === 0 ? (
        <InfoNote tone="warn">Không có thông tin nào đọc được từ thẻ. Hãy chụp lại CCCD.</InfoNote>
      ) : (
        rows.map((row, index) => (
          <DraftFieldRow
            key={row.key}
            row={row}
            value={edits.valueOf(row)}
            edited={edits.isEdited(row)}
            error={edits.errorOf(row)}
            onChange={value => {
              if (isEditableKey(row.key)) edits.setValue(row.key, value);
            }}
            last={index === rows.length - 1}
          />
        ))
      )}

      {cardOnly ? null : (
        <Text style={styles.liveness}>
          {livenessReview ? 'Kiểm tra khuôn mặt: cần duyệt thêm' : 'Kiểm tra khuôn mặt: đạt'}
        </Text>
      )}

      {warnings.length > 0 ? (
        <InfoNote tone="warn" style={styles.note}>
          {warnings.join('\n')}
        </InfoNote>
      ) : null}

      {data.reviewRequired || livenessReview ? (
        <InfoNote tone="info" style={styles.note}>
          {`${livenessReview ? resultMessage('LIVENESS_REVIEW', outcome.message) : REVIEW_NOTE} ${WAITING_NOTE}`}
        </InfoNote>
      ) : null}

      {confirm.error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {confirm.error}
        </Text>
      ) : null}

      <Button
        label="Thông tin chính xác — Xác nhận"
        variant="emerald"
        loading={confirm.submitting && !reporting}
        disabled={confirm.submitting || edits.hasErrors || rows.length === 0}
        onPress={() => {
          setReporting(false);
          void confirm.submit(edits.changedEdits());
        }}
        style={styles.action}
      />
      {sendToStaff ? <Text style={styles.staffNote}>{REPORT_TO_STAFF_COPY.note(REPORT_TO_STAFF_AT - 1)}</Text> : null}
      <Button
        label={sendToStaff ? REPORT_TO_STAFF_COPY.button : 'Sai thông tin — Chụp lại'}
        variant="outline"
        icon={sendToStaff ? 'users' : undefined}
        loading={confirm.submitting && reporting}
        disabled={confirm.submitting}
        onPress={
          sendToStaff
            ? () => {
                setReporting(true);
                void confirm.submit({}, { reportIncorrect: true });
              }
            : onRescan
        }
        style={styles.secondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  lead: { ...Text_.micro, color: Colors.ink2, marginBottom: Spacing.sm },
  leadBold: { fontFamily: Text_.microBold.fontFamily, color: Colors.ink },
  cardType: { ...Text_.microBold, color: Colors.ink2, marginBottom: Spacing.sm },
  liveness: { ...Text_.microBold, color: Colors.ink2, marginTop: Spacing.lg },
  note: { marginTop: Spacing.lg },
  error: { ...Text_.micro, color: Colors.red, marginTop: Spacing.lg },
  action: { marginTop: Spacing.xl },
  staffNote: { ...Text_.micro, color: Colors.ink2, textAlign: 'center', marginTop: Spacing.lg },
  secondary: { marginTop: Spacing.md },
});
