import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Checkbox } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';
import type { LoanContractDetail } from '@/types/contract';
import type { DeclineReasonCode } from '../constant';
import type { Countdown } from '../hook/useCountdown';
import { useContractConsent } from '../hook/useContractConsent';
import DeclineForm from './DeclineForm';
import DetailButton from './DetailButton';
import DetailCard from './DetailCard';
import DetailNote from './DetailNote';
import DisclosureSection from './DisclosureSection';

type Props = {
  contract: LoanContractDetail;
  countdown: Countdown;
  onDone: () => void;
  onStale: () => void;
};

/**
 * Ký hoặc từ chối ngay dưới nút mở PDF. Component chỉ được mount sau khi màn
 * cha đã mở thành công đúng artifact hiện hành, nên checkbox không thể thay thế
 * điều kiện phải đọc tài liệu trước khi consent.
 */
export default function InlineContractConsent({ contract, countdown, onDone, onStale }: Props) {
  const consent = useContractConsent(contract);
  const [mode, setMode] = useState<'sign' | 'decline'>('sign');
  const [accepted, setAccepted] = useState(false);
  const [reason, setReason] = useState<DeclineReasonCode>('TERMS_NOT_ACCEPTED');
  const [reasonDetail, setReasonDetail] = useState('');
  const declineReady = reason !== 'OTHER' || reasonDetail.trim().length > 0;

  const sign = async () => {
    if (!accepted) return;
    const succeeded = await consent.sign();
    if (succeeded) {
      const smartCa = contract.availableSignatureMethod === 'VNPT_SMART_CA';
      Alert.alert(
        smartCa ? 'Đã gửi yêu cầu ký số' : 'Đã xác nhận hợp đồng',
        smartCa
          ? 'Hãy mở ứng dụng VNPT SmartCA để xác nhận. Sau đó quay lại FINORA kiểm tra kết quả.'
          : 'FINORA đã ghi nhận xác nhận click-wrap của bạn và tạo bản PDF xác nhận.',
        [{ text: 'Đã hiểu', onPress: onDone }],
      );
    } else if (consent.error?.stale) {
      onStale();
    }
  };

  const decline = async () => {
    if (!declineReady) return;
    const succeeded = await consent.decline(reason, reasonDetail);
    if (succeeded) {
      Alert.alert('Đã từ chối hợp đồng', 'FINORA đã ghi nhận quyết định của bạn.', [
        { text: 'Đã hiểu', onPress: onDone },
      ]);
    } else if (consent.error?.stale) {
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
        <View style={styles.actions}>
          <DetailButton
            label="Xác nhận từ chối"
            variant="danger"
            onPress={decline}
            disabled={!declineReady || consent.busy}
            loading={consent.declining}
          />
          <DetailButton
            label="Quay lại xác nhận"
            variant="outline"
            onPress={() => {
              consent.clearError();
              setMode('sign');
            }}
            disabled={consent.busy}
          />
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
          label={contract.availableSignatureMethod === 'VNPT_SMART_CA'
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

      <DisclosureSection
        title="Thông tin đối chiếu kỹ thuật"
        hint="Chỉ cần mở khi muốn kiểm tra phiên bản và SHA-256"
      >
        <Verification label="Phiên bản điều khoản" value={contract.termsVersion} />
        <Verification
          label="Phiên bản PDF"
          value={contract.pdfDocument?.documentVersion ?? contract.documentVersion}
        />
        <Verification
          label="Mã kiểm tra SHA-256"
          value={contract.pdfDocument?.contentHash ?? contract.documentHash}
          monospace
        />
      </DisclosureSection>

      <Text style={styles.legal}>
        {contract.availableSignatureMethod === 'VNPT_SMART_CA'
          ? 'Hợp đồng chỉ được ghi nhận đã ký sau khi VNPT SmartCA trả kết quả thành công.'
          : 'Đây là xác nhận điện tử dạng click-wrap trong FINORA, chưa phải chữ ký số VNPT SmartCA.'}
      </Text>
    </DetailCard>
  );
}

function Verification({
  label,
  value,
  monospace = false,
}: {
  label: string;
  value: string;
  monospace?: boolean;
}) {
  return (
    <View style={styles.verification}>
      <Text style={styles.verificationLabel}>{label}</Text>
      <Text selectable style={[styles.verificationValue, monospace && styles.monospace]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  description: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  consentBox: { padding: Spacing.lg, borderRadius: 12, backgroundColor: Colors.authNoteBg },
  consentText: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authLabel },
  actions: { gap: Spacing.md },
  legal: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  verification: { gap: Spacing.xxs, paddingVertical: Spacing.lg },
  verificationLabel: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  verificationValue: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authInk, flexShrink: 1 },
  monospace: { fontFamily: 'monospace' },
});
