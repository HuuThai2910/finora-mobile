import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Checkbox } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { SIGNATURE_REJECTED_CODE } from '@/constants/contractSignature';
import { openSmartCaApp, smartCaOpenFailureMessage } from '@/lib/smartCaApp';
import { FontFamily, Spacing } from '@/theme';
import type { LoanContractDetail } from '@/types/contract';
import type { DeclineReasonCode } from '../constant';
import type { Countdown } from '../hook/useCountdown';
import { useContractConsent } from '../hook/useContractConsent';
import DeclineForm from './DeclineForm';
import DetailButton from './DetailButton';
import DetailCard from './DetailCard';
import DetailNote from './DetailNote';

type Props = {
  contract: LoanContractDetail;
  countdown: Countdown;
  /** Lần ký SmartCA trước bị từ chối (vòng hỏi kết quả báo về): nút ký đổi thành "Ký lại". */
  signatureRejected?: boolean;
  onDone: () => void;
  onStale: () => void;
  /** Chỉ cho rút/từ chối khi borrower chưa tới lượt ký hoặc đang có phiên SmartCA chưa hoàn tất. */
  declineOnly?: boolean;
  /** Đóng biểu mẫu từ chối khi màn cha chỉ mở biểu mẫu theo yêu cầu người dùng. */
  onCancelDecline?: () => void;
};

/**
 * Ký hoặc từ chối ngay dưới nút mở PDF. Component chỉ được mount sau khi màn
 * cha đã mở thành công đúng artifact hiện hành, nên checkbox không thể thay thế
 * điều kiện phải đọc tài liệu trước khi consent.
 */
export default function InlineContractConsent({
  contract,
  countdown,
  signatureRejected = false,
  onDone,
  onStale,
  declineOnly = false,
  onCancelDecline,
}: Props) {
  const consent = useContractConsent(contract);
  const [mode, setMode] = useState<'sign' | 'decline'>(declineOnly ? 'decline' : 'sign');
  const [accepted, setAccepted] = useState(false);
  const [reason, setReason] = useState<DeclineReasonCode>('TERMS_NOT_ACCEPTED');
  const [reasonDetail, setReasonDetail] = useState('');
  const declineReady = reason !== 'OTHER' || reasonDetail.trim().length > 0;

  const pades = contract.signatureProfile === 'PADES_B_B';
  // Chữ ký vừa bị từ chối (lời gọi ký hoặc vòng hỏi kết quả): backend đã trả hợp đồng về chờ ký, nút đổi thành
  // "Ký lại" (lần ký mới, key mới).
  const resign = signatureRejected || consent.error?.code === SIGNATURE_REJECTED_CODE;

  const sign = async () => {
    if (!accepted) return;
    const outcome = await consent.sign();
    if (outcome.ok) {
      const smartCa = contract.availableSignatureMethod === 'VNPT_SMART_CA';
      const openResult = smartCa ? await openSmartCaApp() : null;
      const openFailure = openResult ? smartCaOpenFailureMessage(openResult) : null;
      Alert.alert(
        smartCa ? 'Đã gửi yêu cầu ký số' : 'Đã xác nhận hợp đồng',
        smartCa
          ? openFailure
            ?? 'FINORA đã chuyển sang VNPT SmartCA. Sau khi xác nhận, hãy quay lại FINORA để kiểm tra kết quả.'
          : pades
            ? 'FINORA đã nhúng chữ ký số của bạn vào tệp PDF hợp đồng.'
            : 'FINORA đã ghi nhận xác nhận click-wrap của bạn và tạo bản PDF xác nhận.',
        [{ text: 'Đã hiểu', onPress: onDone }],
      );
    } else if (outcome.error?.stale) {
      onStale();
    }
  };

  const decline = async () => {
    if (!declineReady) return;
    const outcome = await consent.decline(reason, reasonDetail);
    if (outcome.ok) {
      Alert.alert('Đã từ chối hợp đồng', 'FINORA đã ghi nhận quyết định của bạn.', [
        { text: 'Đã hiểu', onPress: onDone },
      ]);
    } else if (outcome.error?.stale) {
      onStale();
    }
  };

  if (mode === 'decline') {
    return (
      <DetailCard title="Từ chối hợp đồng" icon="x">
        <DeclineForm
          reason={reason}
          onReasonChange={setReason}
          detail={reasonDetail}
          onDetailChange={setReasonDetail}
          error={consent.error?.message}
        />
        {declineOnly ? (
          <DetailNote tone="warn">
            Hủy lúc này sẽ đóng hợp đồng dùng chung và trả các khoản tiền đang giữ về ví nhà đầu tư.
          </DetailNote>
        ) : null}
        <View style={styles.actions}>
          <DetailButton
            label="Xác nhận từ chối"
            variant="danger"
            onPress={decline}
            disabled={!declineReady || consent.busy}
            loading={consent.declining}
          />
          {!declineOnly || onCancelDecline ? (
            <DetailButton
              label={declineOnly ? 'Quay lại' : 'Quay lại xác nhận'}
              variant="outline"
              onPress={() => {
                consent.clearError();
                if (declineOnly) onCancelDecline?.();
                else setMode('sign');
              }}
              disabled={consent.busy}
            />
          ) : null}
        </View>
      </DetailCard>
    );
  }

  return (
    <DetailCard title="Bạn đã xem bản PDF hiện hành" icon="fileText">
      <Text style={styles.description}>
        Chỉ xác nhận khi bạn đồng ý với toàn bộ điều khoản và lịch trả nợ trong tài liệu vừa mở.
      </Text>

      <DetailNote tone={countdown.urgent ? 'warn' : 'info'}>
        {`Hạn xác nhận ${countdown.label || 'sắp kết thúc'}. Quá hạn thì hợp đồng này không ký được nữa.`}
      </DetailNote>

      <View style={styles.consentBox}>
        <Checkbox
          checked={accepted}
          onChange={setAccepted}
          label="Đồng ý toàn bộ nội dung hợp đồng"
        >
          <Text style={styles.consentText}>
            Tôi đã mở và đọc bản PDF, hiểu nghĩa vụ thanh toán và đồng ý xác nhận đúng phiên bản
            đang được FINORA cung cấp.
          </Text>
        </Checkbox>
      </View>

      {consent.error ? <DetailNote tone="warn">{consent.error.message}</DetailNote> : null}

      <View style={styles.actions}>
        <DetailButton
          label={resign
            ? 'Ký lại'
            : contract.availableSignatureMethod === 'VNPT_SMART_CA'
              ? 'Gửi yêu cầu VNPT SmartCA'
              : 'Ký xác nhận hợp đồng'}
          onPress={sign}
          disabled={!accepted || consent.busy}
          loading={consent.signing}
        />
        <DetailButton
          label="Từ chối hợp đồng"
          variant="outline"
          onPress={() => {
            consent.clearError();
            setMode('decline');
          }}
          disabled={consent.busy}
        />
      </View>

      <Text style={styles.legal}>
        {pades
          // Hợp đồng PAdES: kể cả với MOCK, backend nhúng một chữ ký số thật vào tệp, nên câu
          // "chỉ là click-wrap" không còn đúng.
          ? 'Chữ ký số của bạn được nhúng vào chính tệp PDF, sau chữ ký của các bên cho vay.'
          : contract.availableSignatureMethod === 'VNPT_SMART_CA'
            ? 'Hợp đồng chỉ được ghi nhận đã ký sau khi VNPT SmartCA trả kết quả thành công.'
            : 'Đây là xác nhận điện tử dạng click-wrap trong FINORA, chưa phải chữ ký số VNPT SmartCA.'}
      </Text>
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  description: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  consentBox: { padding: Spacing.lg, borderRadius: 12, backgroundColor: Colors.authNoteBg },
  consentText: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authLabel },
  actions: { gap: Spacing.md },
  legal: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
});
