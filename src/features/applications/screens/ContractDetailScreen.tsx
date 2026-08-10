import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import RepaymentScheduleList from '@/components/loan/RepaymentScheduleList';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, Card, Checkbox, Field, InfoNote, SectionLabel, SegmentGroup, Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { generateIdempotencyKey } from '@/lib/api';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing, Text_ } from '@/theme';
import type { LoanContractStatus } from '@/types/contract';
import { formatDate, formatDateTime, formatDong } from '@/utils/format';
import { useDeclineContractMutation, useGetContractHistoryQuery, useGetContractQuery, useSignContractMutation } from '../api/applicationApi';
import ContractDocumentSection from '../components/ContractDocumentSection';
import { CONTRACT_STATUS } from '../constant';

type DeclineReason = 'TERMS_NOT_ACCEPTED' | 'BORROWER_CHANGED_MIND' | 'OTHER';

const DECLINE_REASONS = [
  { value: 'TERMS_NOT_ACCEPTED' as const, label: 'Không đồng ý điều khoản' },
  { value: 'BORROWER_CHANGED_MIND' as const, label: 'Thay đổi nhu cầu' },
  { value: 'OTHER' as const, label: 'Lý do khác' },
];

const STATUS_LABEL: Record<LoanContractStatus, string> = Object.fromEntries(
  Object.entries(CONTRACT_STATUS).map(([status, meta]) => [status, meta.label]),
) as Record<LoanContractStatus, string>;

function errorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return 'Không thể thực hiện yêu cầu. Vui lòng tải lại hợp đồng mới nhất và thử lại.';
}

/** Đọc đúng document/version/hash rồi ký hoặc từ chối Contract đang chờ borrower xác nhận. */
export default function ContractDetailScreen() {
  const { contractNumber } = useRoute<RouteProp<ProfileStackParamList, 'ContractDetail'>>().params;
  const contractQuery = useGetContractQuery(contractNumber);
  const historyQuery = useGetContractHistoryQuery({ contractNumber, page: 0, size: 20 });
  const [signContract, signState] = useSignContractMutation();
  const [declineContract, declineState] = useDeclineContractMutation();
  const [accepted, setAccepted] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState<DeclineReason>('TERMS_NOT_ACCEPTED');
  const [reasonDetail, setReasonDetail] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const signKey = useRef(generateIdempotencyKey());
  const declineKey = useRef(generateIdempotencyKey());

  const reload = () => {
    contractQuery.refetch();
    historyQuery.refetch();
  };

  if (contractQuery.isLoading) return <Screen><LoadingScreen cards={4} /></Screen>;
  if (contractQuery.error || !contractQuery.data) {
    return <Screen><ErrorState message={errorMessage(contractQuery.error)} onRetry={reload} /></Screen>;
  }

  const contract = contractQuery.data;
  const status = CONTRACT_STATUS[contract.status];
  const schedulePeriods = contract.schedulePeriods ?? [];
  const isExpired = new Date(contract.expiresAt).getTime() <= Date.now();
  const canRespond = contract.status === 'PENDING_SIGNATURE' && !isExpired;

  const onSign = async () => {
    if (!accepted || !canRespond) return;
    setActionError(null);
    try {
      await signContract({
        contractNumber,
        version: contract.version,
        documentHash: contract.documentHash,
        idempotencyKey: signKey.current,
      }).unwrap();
      signKey.current = generateIdempotencyKey();
      setAccepted(false);
      Alert.alert('Đã ký hợp đồng', 'Hệ thống đã ghi nhận sự đồng ý của bạn.');
    } catch (error) {
      // Giữ key cũ khi kết quả chưa rõ để retry không tạo hai lần ký.
      setActionError(errorMessage(error));
    }
  };

  const onDecline = async () => {
    if (!canRespond || (declineReason === 'OTHER' && !reasonDetail.trim())) return;
    setActionError(null);
    try {
      await declineContract({
        contractNumber,
        version: contract.version,
        reasonCode: declineReason,
        reasonDetail: reasonDetail.trim() || undefined,
        idempotencyKey: declineKey.current,
      }).unwrap();
      declineKey.current = generateIdempotencyKey();
      setShowDecline(false);
      Alert.alert('Đã từ chối hợp đồng', 'Hệ thống đã ghi nhận quyết định của bạn.');
    } catch (error) {
      // Version mới nhất luôn do backend quyết định; client không tự tăng để gửi lại.
      setActionError(errorMessage(error));
    }
  };

  return (
    <Screen onRefresh={reload} refreshing={contractQuery.isFetching || historyQuery.isFetching}>
      <PHeader title="Chi tiết hợp đồng" back right={<Tag tone={status.tone} small>{status.label}</Tag>} />

      <Card style={styles.hero}>
        <Text style={styles.contractNumber}>{contract.contractNumber}</Text>
        <Text style={styles.amount}>{formatDong(contract.principalAmount)}</Text>
        <Text style={styles.meta}>{contract.termMonths} tháng · {contract.annualInterestRate}%/năm</Text>
        <Text style={styles.application}>Hồ sơ {contract.applicationNumber}</Text>
      </Card>

      <SectionLabel style={styles.section}>ĐIỀU KHOẢN ĐÃ CHỐT</SectionLabel>
      <Card flush>
        <PItem label="Tổng tiền lãi" value={formatDong(contract.totalInterest)} />
        <PItem label="Tổng phí" value={formatDong(contract.totalFees)} />
        <PItem label="Tổng phải trả" value={formatDong(contract.totalRepayment)} />
        <PItem label="Ngày giải ngân dự kiến" value={formatDate(contract.expectedDisbursementDate)} />
        <PItem label="Hạn xác nhận" value={formatDateTime(contract.expiresAt)} last />
      </Card>

      <RepaymentScheduleList
        periods={schedulePeriods}
        title={schedulePeriods.length > 0 ? `Lịch trả đầy đủ ${schedulePeriods.length} kỳ` : 'Lịch trả từng kỳ'}
      />

      <ContractDocumentSection contract={contract} />

      {isExpired && contract.status === 'PENDING_SIGNATURE' ? (
        <InfoNote tone="warn">Hợp đồng đã quá hạn xác nhận. Vui lòng chờ hệ thống cập nhật trạng thái.</InfoNote>
      ) : null}

      {canRespond ? (
        <Card style={styles.consentCard}>
          <Text style={styles.consentTitle}>Xác nhận của người vay</Text>
          <Checkbox checked={accepted} onChange={setAccepted} label="Đồng ý nội dung hợp đồng">
            <Text style={styles.acceptText}>Tôi đã đọc lịch trả, điều khoản và đồng ý ký đúng phiên bản đang hiển thị.</Text>
          </Checkbox>
          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
          <Button label="Ký xác nhận" onPress={onSign} disabled={!accepted || declineState.isLoading} loading={signState.isLoading} />
          <Button label="Từ chối hợp đồng" variant="danger" onPress={() => setShowDecline((value) => !value)} disabled={signState.isLoading || declineState.isLoading} />
          {showDecline ? (
            <View style={styles.declineForm}>
              <SegmentGroup options={DECLINE_REASONS} value={declineReason} onChange={setDeclineReason} label="Lý do từ chối hợp đồng" wrap />
              {declineReason === 'OTHER' ? (
                <Field label="Chi tiết lý do" value={reasonDetail} onChangeText={setReasonDetail} multiline required />
              ) : null}
              <Button label="Xác nhận từ chối" variant="danger" onPress={onDecline} disabled={declineReason === 'OTHER' && !reasonDetail.trim()} loading={declineState.isLoading} />
            </View>
          ) : null}
        </Card>
      ) : null}

      <SectionLabel style={styles.section}>LỊCH SỬ HỢP ĐỒNG</SectionLabel>
      <Card flush>
        {(historyQuery.data?.data ?? []).map((item, index, rows) => (
          <PItem
            key={item.id}
            label={STATUS_LABEL[item.toStatus]}
            sub={`${item.actorType === 'SYSTEM' ? 'Hệ thống' : item.actorType === 'ADMIN' ? 'Quản trị viên' : 'Người vay'} · ${formatDateTime(item.occurredAt)}`}
            last={index === rows.length - 1}
          />
        ))}
        {(historyQuery.data?.data.length ?? 0) === 0 ? <Text style={styles.emptyHistory}>Chưa có lịch sử hợp đồng.</Text> : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.sm },
  contractNumber: { ...Text_.microBold, color: Colors.brand },
  amount: { ...Text_.figure, color: Colors.ink },
  meta: { ...Text_.micro, color: Colors.ink2 },
  application: { ...Text_.caption, color: Colors.ink3 },
  section: { marginTop: Spacing.section },
  consentCard: { gap: Spacing.lg, marginTop: Spacing.xl },
  consentTitle: { ...Text_.heading, color: Colors.ink },
  acceptText: { ...Text_.micro, color: Colors.ink2 },
  declineForm: { gap: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.line },
  error: { ...Text_.micro, color: Colors.red },
  emptyHistory: { ...Text_.body, color: Colors.ink3, padding: Spacing.xl, textAlign: 'center' },
});
