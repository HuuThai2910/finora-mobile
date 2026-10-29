import { StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { FormStepProgress, PHeader, Screen } from '@/components/phone';
import { Button } from '@/components/ui';
import type { ProfileStackParamList } from '@/navigation/types';
import type { EkycResultResponse } from '@/types/ekyc';
import DraftReview from '../components/DraftReview';
import OutcomeView from '../components/OutcomeView';
import { EKYC_STEP_LABEL, EKYC_STEP_TOTAL } from '../constants/capture';
import { resultMessage } from '../constants/messages';
import { useEkycFlow } from '../hooks/useEkycFlow';
import { useEkycSession } from '../hooks/useEkycSession';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'EkycResult'>;

const TITLE = 'Định danh điện tử';

/** Lỗi tạm thời: thử lại đúng bước vừa rồi là đủ, không phải chụp lại thẻ. */
const RETRYABLE = new Set<string>(['RATE_LIMITED', 'AI_UNAVAILABLE', 'STORAGE_UNAVAILABLE']);

/**
 * Màn kết quả của luồng eKYC, chọn nội dung theo `resultCode` đang giữ trong phiên:
 * - liveness đạt / vùng xám → soát bản nháp và xác nhận;
 * - `VERIFIED` → thành công; `REVIEW_PENDING` → đang chờ duyệt;
 * - còn lại (thẻ hết hạn, CMND, dưới 18 tuổi, số đã dùng, bản nháp hết hạn...) → lý do + lối
 *   làm lại phù hợp.
 */
export default function EkycResultScreen() {
  const nav = useNavigation<Nav>();
  const session = useEkycSession();
  const flow = useEkycFlow();
  const outcome = session.outcome;

  // Không có kết quả nghĩa là màn bị mở ngoài luồng — không bịa dữ liệu.
  if (!outcome) {
    return (
      <Screen light>
        <PHeader title={TITLE} back />
        <OutcomeView tone="error" title="Chưa có kết quả" message="Hãy thực hiện lại quy trình định danh.">
          <Button label="Bắt đầu định danh" icon="scan" onPress={flow.restartFromConsent} />
        </OutcomeView>
      </Screen>
    );
  }

  if (outcome.resultCode === 'LIVENESS_PASSED' || outcome.resultCode === 'LIVENESS_REVIEW') {
    return (
      <Screen light>
        <PHeader title="Kiểm tra thông tin" back />
        <FormStepProgress current={4} total={EKYC_STEP_TOTAL} label={EKYC_STEP_LABEL.review} />
        <DraftReview outcome={outcome} scan={session.draftResult} onRescan={flow.restartCapture} />
      </Screen>
    );
  }

  if (outcome.resultCode === 'VERIFIED') {
    return (
      <Screen light>
        <OutcomeView
          tone="success"
          title="Định danh thành công"
          message="Thông tin đã được lưu vào hồ sơ của bạn. Bạn đã có thể vay và đầu tư trên FINORA."
        >
          <Button label="Hoàn tất" onPress={flow.finish} />
        </OutcomeView>
      </Screen>
    );
  }

  if (outcome.resultCode === 'REVIEW_PENDING') {
    return (
      <Screen light>
        <OutcomeView tone="pending" title="Hồ sơ đang được duyệt" message={resultMessage(outcome.resultCode, outcome.message)}>
          <Text style={styles.extra}>
            Trong lúc chờ, bạn vẫn dùng được ứng dụng nhưng chưa vay hoặc đầu tư được.
          </Text>
          <Button label="Về trang hồ sơ" onPress={flow.finish} />
        </OutcomeView>
      </Screen>
    );
  }

  return (
    <Screen light>
      <PHeader title={TITLE} back />
      <RejectedOutcome outcome={outcome} onRetry={() => nav.goBack()} />
    </Screen>
  );
}

function RejectedOutcome({ outcome, onRetry }: { outcome: EkycResultResponse; onRetry: () => void }) {
  const flow = useEkycFlow();
  const message = resultMessage(outcome.resultCode, outcome.message);

  let primary: { label: string; onPress: () => void };
  if (outcome.resultCode === 'CONSENT_REQUIRED') {
    primary = { label: 'Đọc lại điều khoản', onPress: flow.restartFromConsent };
  } else if (RETRYABLE.has(outcome.resultCode)) {
    primary = { label: 'Thử lại', onPress: onRetry };
  } else {
    primary = { label: 'Chụp lại từ đầu', onPress: flow.restartCapture };
  }

  return (
    <OutcomeView tone="error" title="Chưa xác minh được" message={message}>
      <Button label={primary.label} icon="scan" onPress={primary.onPress} />
      <Button label="Về trang hồ sơ" variant="outline" onPress={flow.finish} style={styles.secondary} />
    </OutcomeView>
  );
}

const styles = StyleSheet.create({
  extra: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginBottom: Spacing.xl },
  secondary: { marginTop: Spacing.md },
});
