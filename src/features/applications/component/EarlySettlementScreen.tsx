import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, SectionLabel, SegmentGroup } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatDong, formatVND } from '@/utils/format';
import { toUserMessage } from '@/lib/api';
import { RESTRUCTURE_NOTE, RESTRUCTURE_OPTIONS } from '../constant';
import { useSettlementQuote } from '../hook/useApplications';
import { requestRestructure } from '../api';

/** Màn 18 — tất toán sớm hoặc tái cơ cấu (luồng C2.6). */
export default function EarlySettlementScreen() {
  const nav = useNavigation();
  const { data, loading, error, reload } = useSettlementQuote();
  const [term, setTerm] = useState<number>(18);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const onSettle = () => {
    if (!data) return;
    Alert.alert(
      'Xác nhận tất toán sớm',
      `Tổng phải trả ${formatDong(data.total)}. Thao tác này không hoàn tác được.`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Tất toán',
          style: 'destructive',
          onPress: () => nav.goBack(),
        },
      ],
    );
  };

  const onRestructure = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      await requestRestructure();
      Alert.alert('Đã gửi yêu cầu', RESTRUCTURE_NOTE, [
        { text: 'Xong', onPress: () => nav.goBack() },
      ]);
    } catch (e) {
      setActionError(toUserMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Screen><LoadingScreen cards={2} /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!data) return null;

  return (
    <Screen>
      <PHeader title="Tất toán / Tái cơ cấu" back hint={data.loanId} />

      <SectionLabel>Tất toán sớm hôm nay</SectionLabel>

      <PItem label="Gốc còn lại" value={formatDong(data.outstandingPrincipal)} />
      <PItem label="Lãi đến hôm nay" value={formatDong(data.interestToDate)} />
      <PItem label="Phí trả trước hạn (1%)" value={formatDong(data.earlyRepaymentFee)} />
      <PItem
        label={<Text style={styles.totalLabel}>Tổng tất toán</Text>}
        value={<Text style={styles.totalValue}>{formatDong(data.total)}</Text>}
        last
      />

      <Button
        label={`Tất toán ngay — tiết kiệm ${formatVND(data.interestSaved)} lãi`}
        variant="emerald"
        onPress={onSettle}
        style={styles.settle}
      />

      <SectionLabel>Hoặc tái cơ cấu</SectionLabel>

      <SegmentGroup
        label="Chọn kỳ hạn mới"
        options={RESTRUCTURE_OPTIONS.map(t => ({ value: t, label: `${t} tháng` }))}
        value={term}
        onChange={setTerm}
        style={styles.terms}
      />

      {actionError ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {actionError}
        </Text>
      ) : null}

      <Button
        label="Gửi yêu cầu tái cơ cấu"
        variant="outline"
        onPress={onRestructure}
        loading={submitting}
      />

      <Text style={styles.note}>{RESTRUCTURE_NOTE}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  totalLabel: { ...Text_.bodyBold, color: Colors.ink },
  totalValue: { ...Text_.title, color: Colors.brand },
  settle: { marginTop: Spacing.xl, marginBottom: Spacing.section },
  terms: { marginBottom: Spacing.xl },
  error: { ...Text_.micro, color: Colors.red, marginBottom: Spacing.lg },
  note: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
});
