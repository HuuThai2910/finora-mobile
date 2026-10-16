import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { Button, InfoNote } from '@/components/ui';
import type { EkycResultResponse } from '@/types/ekyc';
import { CARD_TYPE_LABEL, resultMessage, warningLabels } from '../constants/messages';
import { isEditableKey, reviewData, toDraftRows } from '../mappers/draftFields';
import { useDraftEdits } from '../hooks/useDraftEdits';
import { useEkycConfirm } from '../hooks/useEkycConfirm';
import DraftFieldRow from './DraftFieldRow';

const REVIEW_NOTE = 'Hồ sơ sẽ được nhân viên FINORA duyệt thêm sau khi bạn xác nhận.';
const WAITING_NOTE = 'Trong lúc chờ, bạn vẫn dùng được ứng dụng nhưng chưa vay hoặc đầu tư được.';

type Props = {
  /** Kết quả liveness đạt (`LIVENESS_PASSED`) hoặc vùng xám (`LIVENESS_REVIEW`). */
  outcome: EkycResultResponse;
  /** Kết quả bước quét thẻ (`DRAFT_READY`) — nguồn dự phòng của bản nháp. */
  scan: EkycResultResponse | null;
  onRescan: () => void;
};

/**
 * Soát bản nháp trước khi lưu. Hồ sơ CHƯA được ghi gì cho tới khi bấm xác nhận.
 *
 * Mỗi trường mang nhãn nguồn; chỉ trường "AI đọc" có ô sửa. Hồ sơ cần duyệt thêm (nguồn yếu,
 * ảnh thư viện, khuôn mặt vùng xám) thì nói rõ trước khi xác nhận để người dùng không bất ngờ.
 */
export default function DraftReview({ outcome, scan, onRescan }: Props) {
  const data = reviewData(outcome, scan);
  const rows = data.draft ? toDraftRows(data.draft, data.cardType) : [];
  const edits = useDraftEdits(rows);
  const confirm = useEkycConfirm();
  const warnings = warningLabels(data.warnings);
  const livenessReview = outcome.resultCode === 'LIVENESS_REVIEW';

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

      <Text style={styles.liveness}>
        {livenessReview ? 'Kiểm tra khuôn mặt: cần duyệt thêm' : 'Kiểm tra khuôn mặt: đạt'}
      </Text>

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
        loading={confirm.submitting}
        disabled={confirm.submitting || edits.hasErrors || rows.length === 0}
        onPress={() => void confirm.submit(edits.changedEdits())}
        style={styles.action}
      />
      <Button
        label="Sai thông tin — Chụp lại"
        variant="outline"
        disabled={confirm.submitting}
        onPress={onRescan}
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
  secondary: { marginTop: Spacing.md },
});
