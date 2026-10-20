import { useRef, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DetailButton, DetailCard, DetailNote } from '@/features/applications';
import { WaveBackdrop } from '@/components/phone';
import { HOME_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { generateIdempotencyKey, toUserMessage } from '@/lib/api';
import { FontFamily, Radius, Spacing } from '@/theme';
import type { InvestorRescheduleConsent, InvestorRescheduleConsentStatus } from '@/types/invest';
import { formatDong } from '@/utils/format';
import { decideRescheduleConsent } from '../api';
import { PORTFOLIO_MAX_WIDTH, PORTFOLIO_PADDING } from '../constant';
import { useRescheduleConsents } from '../hook/useInvestment';
import InvestHeader from './InvestHeader';
import InvestStatusCard from './InvestStatusCard';

const STATUS: Record<InvestorRescheduleConsentStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Chờ bạn quyết định', color: Colors.tagAmberText, bg: Colors.amberBg },
  APPROVED: { label: 'Đã đồng ý', color: Colors.tagGreenText, bg: Colors.greenBg },
  REJECTED: { label: 'Đã từ chối', color: Colors.tagRedText, bg: Colors.redBg },
  CANCELLED: { label: 'Đã kết thúc', color: Colors.tagGrayText, bg: Colors.grayBg },
};

const date = (value: string | null): string => {
  if (!value) return '—';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const requestTitle = (item: InvestorRescheduleConsent): string => item.requestType === 'TERM_EXTENSION'
  ? `Gia hạn thêm ${item.extraTerms ?? 0} kỳ trả nợ`
  : `Đổi ngày trả kỳ ${date(item.rescheduleFromDate)} sang ${date(item.adjustedDueDate)}`;

function ConsentCard({ item, busy, onDecide }: {
  item: InvestorRescheduleConsent;
  busy: boolean;
  onDecide: (item: InvestorRescheduleConsent, approve: boolean) => void;
}) {
  const look = STATUS[item.status] ?? STATUS.CANCELLED;
  return (
    <DetailCard title={`Khoản vay ${item.loanNumber}`} icon="file">
      <View style={[styles.status, { backgroundColor: look.bg }]}>
        <Text style={[styles.statusText, { color: look.color }]}>{look.label}</Text>
      </View>
      <Text style={styles.proposal}>{requestTitle(item)}</Text>
      <View style={styles.rows}>
        <View style={styles.row}><Text style={styles.label}>Phần vốn của bạn</Text><Text style={styles.value}>{formatDong(item.outstandingPrincipal)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Kỳ bắt đầu điều chỉnh</Text><Text style={styles.value}>{date(item.rescheduleFromDate)}</Text></View>
        {item.requestType === 'TERM_EXTENSION' ? (
          <View style={styles.row}><Text style={styles.label}>Ngày đáo hạn hiện tại</Text><Text style={styles.value}>{date(item.originalMaturityDate)}</Text></View>
        ) : null}
      </View>
      <DetailNote>
        Lịch mới chỉ được áp dụng khi toàn bộ nhà đầu tư đang nắm Note đồng ý và Fineract xử lý thành công.
        Trong thời gian chờ, lịch trả hiện tại vẫn có hiệu lực.
      </DetailNote>
      {item.status === 'PENDING' ? (
        <View style={styles.actions}>
          <DetailButton label="Đồng ý lịch mới" onPress={() => onDecide(item, true)} loading={busy} />
          <DetailButton label="Từ chối" variant="danger" onPress={() => onDecide(item, false)} disabled={busy} />
        </View>
      ) : null}
    </DetailCard>
  );
}

/** Màn biểu quyết cơ cấu trên bộ giao diện đầu tư mới; không dùng lại màn/list kiểu cũ. */
export default function RescheduleConsentsScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, PORTFOLIO_MAX_WIDTH);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const keys = useRef<Record<string, string>>({});
  const state = useRescheduleConsents();

  const decide = async (item: InvestorRescheduleConsent, approve: boolean) => {
    const action = approve ? 'đồng ý' : 'từ chối';
    Alert.alert(
      approve ? 'Đồng ý cơ cấu lịch trả?' : 'Từ chối đề nghị cơ cấu?',
      approve
        ? 'Sau khi toàn bộ nhà đầu tư đồng ý, hệ thống sẽ áp dụng lịch trả mới. Quyết định này không thể hoàn tác.'
        : 'Một nhà đầu tư từ chối sẽ kết thúc đề nghị; lịch trả hiện tại tiếp tục có hiệu lực.',
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: approve ? 'Đồng ý' : 'Từ chối',
          style: approve ? 'default' : 'destructive',
          onPress: () => {
            const keyName = `${item.requestId}:${action}`;
            keys.current[keyName] ??= generateIdempotencyKey();
            setBusyId(item.requestId);
            setActionError(null);
            void decideRescheduleConsent(item.requestId, approve, keys.current[keyName])
              .then(() => {
                delete keys.current[keyName];
                state.reload();
              })
              .catch((error: unknown) => setActionError(toUserMessage(error)))
              .finally(() => setBusyId(null));
          },
        },
      ],
    );
  };

  const body = () => {
    if (state.loading && !state.data) return <InvestStatusCard icon="clock" title="Đang tải đề nghị" hint="Vui lòng chờ trong giây lát." />;
    if (state.error) return <InvestStatusCard icon="alert" danger title={state.error} hint="Kiểm tra kết nối rồi thử lại." action={{ label: 'Thử lại', onPress: state.reload }} />;
    if (!state.data?.length) return <InvestStatusCard icon="file" title="Không có đề nghị cần xử lý" hint="Khi người vay xin cơ cấu khoản vay bạn đang nắm Note, đề nghị sẽ xuất hiện tại đây." />;
    return state.data.map(item => (
      <ConsentCard key={item.requestId} item={item} busy={busyId === item.requestId} onDecide={(value, approve) => void decide(value, approve)} />
    ));
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      onLayout={event => setViewportHeight(event.nativeEvent.layout.height)}
      refreshControl={<RefreshControl refreshing={state.loading && !!state.data} onRefresh={state.reload} tintColor={Colors.authPrimary} colors={[Colors.authPrimary]} />}
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={HOME_WAVES} width={width} />
        <View style={styles.content}>
          <InvestHeader title="Đồng ý cơ cấu khoản vay" topInset={insets.top} />
          {actionError ? <DetailNote tone="warn">{actionError}</DetailNote> : null}
          {body()}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.homeWaveTop },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { gap: Spacing.lg, paddingHorizontal: PORTFOLIO_PADDING, paddingBottom: 72 },
  status: { alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.pill },
  statusText: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17 },
  proposal: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 23, color: Colors.authInk },
  rows: { gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.sm, backgroundColor: Colors.tintBlue },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.lg },
  label: { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  value: { flexShrink: 1, maxWidth: '55%', textAlign: 'right', fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 19, color: Colors.authInk },
  actions: { gap: Spacing.md },
});
