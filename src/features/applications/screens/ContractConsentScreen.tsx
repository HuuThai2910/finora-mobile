import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Button, Card, Checkbox, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing, Text_ } from '@/theme';
import type { DeclineReasonCode } from '../constant';
import { useContractConsent } from '../hook/useContractConsent';
import { useContractDetail, type ContractDetailView } from '../hook/useContractDetail';
import ContractCommitmentSummary from '../components/ContractCommitmentSummary';
import DeclineForm from '../components/DeclineForm';
import DisclosureSection from '../components/DisclosureSection';
import PricingChangeNotice from '../components/PricingChangeNotice';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ContractConsent'>;
type Route = RouteProp<ProfileStackParamList, 'ContractConsent'>;

/**
 * Bước xác nhận hợp đồng: tóm tắt đúng những gì người vay đang cam kết, rồi ký
 * hoặc từ chối. Tách khỏi màn đọc hợp đồng để hành động không bị chôn dưới
 * toàn văn tài liệu và lịch trả nợ.
 */
export default function ContractConsentScreen() {
  const navigation = useNavigation<Nav>();
  const { contractNumber } = useRoute<Route>().params;
  const detail = useContractDetail(contractNumber);

  if (detail.loading) {
    return (
      <Screen>
        <PHeader title="Xác nhận hợp đồng" back />
        <LoadingScreen cards={3} />
      </Screen>
    );
  }

  if (detail.loadError || !detail.view) {
    return (
      <Screen>
        <PHeader title="Xác nhận hợp đồng" back />
        <ErrorState
          message={detail.loadError ?? 'Không tải được hợp đồng vay.'}
          onRetry={detail.reload}
        />
      </Screen>
    );
  }

  if (!detail.view.canRespond) {
    return (
      <Screen>
        <PHeader title="Xác nhận hợp đồng" back />
        <InfoNote tone="warn">
          Hợp đồng này không còn ở trạng thái chờ bạn xác nhận. Hãy quay lại để xem tình trạng mới
          nhất.
        </InfoNote>
        <Button
          label="Quay lại hợp đồng"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </Screen>
    );
  }

  return (
    <ConsentBody
      view={detail.view}
      onDone={() => {
        detail.reload();
        navigation.goBack();
      }}
      onStale={detail.reload}
    />
  );
}

type BodyProps = {
  view: ContractDetailView;
  onDone: () => void;
  onStale: () => void;
};

/**
 * Tách thành component riêng để `useContractConsent` chỉ khởi tạo khi đã chắc
 * chắn có contract hợp lệ, tránh gọi hook sau các nhánh return ở trên.
 */
function ConsentBody({ view, onDone, onStale }: BodyProps) {
  const { contract, countdown, pricingApplication } = view;
  const consent = useContractConsent(contract);
  const [mode, setMode] = useState<'sign' | 'decline'>('sign');
  const [accepted, setAccepted] = useState(false);
  const [reason, setReason] = useState<DeclineReasonCode>('TERMS_NOT_ACCEPTED');
  const [reasonDetail, setReasonDetail] = useState('');

  const declineReady = reason !== 'OTHER' || reasonDetail.trim().length > 0;

  const onSign = async () => {
    if (!accepted) return;
    const ok = await consent.sign();
    if (ok) {
      Alert.alert(
        'Đã ký hợp đồng',
        'FINORA đã ghi nhận xác nhận của bạn và sẽ xử lý bước tiếp theo.',
        [{ text: 'Đã hiểu', onPress: onDone }],
      );
      return;
    }
    if (consent.error?.stale) onStale();
  };

  const onDecline = async () => {
    if (!declineReady) return;
    const ok = await consent.decline(reason, reasonDetail);
    if (ok) {
      Alert.alert('Đã từ chối hợp đồng', 'FINORA đã ghi nhận quyết định của bạn.', [
        { text: 'Đã hiểu', onPress: onDone },
      ]);
      return;
    }
    if (consent.error?.stale) onStale();
  };

  const footer =
    mode === 'sign' ? (
      <View style={styles.footer}>
        <Button
          label="Ký xác nhận hợp đồng"
          onPress={onSign}
          disabled={!accepted || consent.busy}
          loading={consent.signing}
        />
        <Button
          label="Tôi muốn từ chối"
          variant="outline"
          onPress={() => {
            consent.clearError();
            setMode('decline');
          }}
          disabled={consent.busy}
        />
      </View>
    ) : (
      <View style={styles.footer}>
        <Button
          label="Xác nhận từ chối"
          variant="danger"
          onPress={onDecline}
          disabled={!declineReady || consent.busy}
          loading={consent.declining}
        />
        <Button
          label="Quay lại bước ký"
          variant="outline"
          onPress={() => {
            consent.clearError();
            setMode('sign');
          }}
          disabled={consent.busy}
        />
      </View>
    );

  return (
    <Screen footer={footer}>
      <PHeader title="Xác nhận hợp đồng" back hint={contract.contractNumber} />

      {mode === 'sign' ? (
        <>
          {pricingApplication ? <PricingChangeNotice application={pricingApplication} /> : null}
          <ContractCommitmentSummary contract={contract} />

          <InfoNote tone={countdown.urgent ? 'warn' : 'info'} style={styles.deadline}>
            {`Hạn xác nhận ${countdown.label || 'sắp kết thúc'}. Quá hạn thì hợp đồng này không ký được nữa.`}
          </InfoNote>

          <Card style={styles.consentCard}>
            <Checkbox
              checked={accepted}
              onChange={setAccepted}
              label="Đồng ý toàn bộ nội dung hợp đồng"
            >
              <Text style={styles.consentText}>
                Tôi đã đọc lịch trả nợ, chi phí và toàn văn hợp đồng, và đồng ý ký đúng phiên bản
                đang hiển thị.
              </Text>
            </Checkbox>
          </Card>

          {consent.error ? <InfoNote tone="warn">{consent.error.message}</InfoNote> : null}

          <DisclosureSection
            title="Thông tin xác thực bản ký"
            hint="Phiên bản tài liệu và mã kiểm tra được gửi kèm chữ ký"
          >
            <Verification label="Phiên bản điều khoản" value={contract.termsVersion} />
            <Verification label="Phiên bản tài liệu" value={contract.documentVersion} />
            <Verification label="Mã kiểm tra SHA-256" value={contract.documentHash} monospace />
          </DisclosureSection>

          <Text style={styles.legal}>
            Đây là xác nhận điện tử dạng click-wrap trong hệ thống FINORA, chưa phải chữ ký số
            SmartCA.
          </Text>
        </>
      ) : (
        <DeclineForm
          reason={reason}
          onReasonChange={setReason}
          detail={reasonDetail}
          onDetailChange={setReasonDetail}
          error={consent.error?.message}
        />
      )}
    </Screen>
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
  backButton: { marginTop: Spacing.xl },
  footer: { gap: Spacing.lg },
  deadline: { marginTop: Spacing.xl },
  consentCard: { marginTop: Spacing.xl },
  consentText: { ...Text_.micro, color: Colors.ink2 },
  legal: { ...Text_.caption, color: Colors.ink3, marginTop: Spacing.xl },
  verification: { gap: Spacing.xxs, paddingVertical: Spacing.lg },
  verificationLabel: { ...Text_.caption, color: Colors.ink3 },
  verificationValue: { ...Text_.micro, color: Colors.ink },
  monospace: { fontFamily: 'monospace' },
});
