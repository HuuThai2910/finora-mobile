import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Button, Card, Icon, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { ProfileStackParamList } from '@/navigation/types';
import { IconSize, MIN_TOUCH, Spacing, Text_ } from '@/theme';
import { formatDong, formatLocalDate } from '@/utils/format';
import ServicingSummaryCard from '../components/ServicingSummaryCard';
import { useServicingLoan } from '../hooks/useLoanServicing';

type Route = RouteProp<ProfileStackParamList, 'LoanServicingDetail'>;
type Nav = NativeStackNavigationProp<ProfileStackParamList, 'LoanServicingDetail'>;

export default function LoanServicingDetailScreen() {
  const { loanNumber } = useRoute<Route>().params;
  const nav = useNavigation<Nav>();
  const state = useServicingLoan(loanNumber);
  const focusedOnce = useRef(false);

  useFocusEffect(useCallback(() => {
    // useAsync đã tải ở lần mount; chỉ refetch khi quay lại từ màn thanh toán/cơ cấu.
    if (focusedOnce.current) state.reload();
    else focusedOnce.current = true;
  }, [state.reload]));

  if (state.loading && !state.data) return <Screen><PHeader title="Quản lý khoản vay" back /><LoadingScreen cards={4} /></Screen>;
  if (state.error || !state.data) return <Screen><PHeader title="Quản lý khoản vay" back /><ErrorState message={state.error ?? 'Không tải được khoản vay.'} onRetry={state.reload} /></Screen>;

  const loan = state.data.loan;
  const actionable = loan.status === 'ACTIVE' || loan.status === 'DEFAULTED';
  const canPrepay = loan.status === 'ACTIVE' && loan.principalOutstanding > 0;

  return (
    <Screen onRefresh={state.reload} refreshing={state.loading}>
      <PHeader title="Quản lý khoản vay" back hint={loan.contractNumber} />
      <ServicingSummaryCard loan={loan} />

      <Text style={styles.sectionTitle}>Thanh toán</Text>
      <View style={styles.actions}>
        <Button
          label={loan.overdueAmount > 0 ? 'Khắc phục quá hạn' : 'Thanh toán kỳ tới'}
          icon="wallet"
          onPress={() => nav.navigate('LoanPayment', { loanNumber })}
          disabled={!actionable || loan.totalOutstanding <= 0 || loan.stale}
        />
        <Button label="Trả trước một phần gốc" variant="outline" onPress={() => nav.navigate('PartialPrepayment', { loanNumber })} disabled={!canPrepay || loan.stale} />
        <Button label="Tất toán toàn bộ trước hạn" variant="outline" onPress={() => nav.navigate('EarlySettlement', { loanNumber })} disabled={!canPrepay || loan.stale} />
      </View>

      <Text style={styles.sectionTitle}>Điều chỉnh và theo dõi</Text>
      <Card style={styles.menu}>
        <MenuRow title="Lịch trả nợ từ Fineract" subtitle={`${state.data.schedule.periods.length} kỳ · cập nhật ${formatLocalDate(state.data.schedule.dataAsOf)}`} onPress={() => nav.navigate('ServicingSchedule', { loanNumber })} />
        <View style={styles.divider} />
        <MenuRow title="Đề nghị cơ cấu hoặc gia hạn" subtitle="Gửi yêu cầu để quản trị viên thẩm định" onPress={() => nav.navigate('RescheduleLoan', { loanNumber })} disabled={!actionable} />
      </Card>

      {!actionable ? <InfoNote>Khoản vay ở trạng thái này chỉ còn quyền xem và đối chiếu dữ liệu.</InfoNote> : null}
      <Text style={styles.source}>Nguồn: {loan.source} · Dư nợ gốc {formatDong(loan.principalOutstanding)}</Text>
    </Screen>
  );
}

function MenuRow({ title, subtitle, onPress, disabled = false }: { title: string; subtitle: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={`${title}. ${subtitle}`}
      style={({ pressed }) => [styles.menuRow, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <View style={styles.menuText}><Text style={styles.menuTitle}>{title}</Text><Text style={styles.menuSubtitle}>{subtitle}</Text></View>
      <Icon name="chevronRight" size={IconSize.xs} color={Colors.chevronMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { ...Text_.sectionLabel, color: Colors.authInk, marginTop: Spacing.xxl, marginBottom: Spacing.lg },
  actions: { gap: Spacing.lg },
  menu: { gap: Spacing.md },
  menuRow: { minHeight: MIN_TOUCH, flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, paddingVertical: Spacing.md },
  menuText: { flex: 1, gap: Spacing.xxs },
  menuTitle: { ...Text_.microBold, color: Colors.authInk },
  menuSubtitle: { ...Text_.caption, color: Colors.authMuted },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.45 },
  divider: { height: 1, backgroundColor: Colors.rowDivider },
  source: { ...Text_.caption, color: Colors.authMuted, textAlign: 'center', marginTop: Spacing.xl },
});
