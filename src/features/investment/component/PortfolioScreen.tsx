import { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '@/components/feedback';
import { WaveBackdrop } from '@/components/phone';
import { Icon } from '@/components/ui';
import { HOME_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import type { WalletStackParamList } from '@/navigation/types';
import { FontFamily, Radius, Spacing } from '@/theme';
import { formatDong } from '@/utils/format';
import { PENDING_NOTE, PORTFOLIO_MAX_WIDTH, PORTFOLIO_PADDING } from '../constant';
import { cancelInvestmentCommitment } from '../api';
import { useInvestmentCommitments, useInvestmentContracts, usePortfolio } from '../hook/useInvestment';
import InvestHeader from './InvestHeader';
import InvestStatusCard from './InvestStatusCard';
import PortfolioHeroCard from './PortfolioHeroCard';
import PortfolioShortcuts, { type PortfolioShortcut } from './PortfolioShortcuts';
import PositionCard from './PositionCard';
import PendingCommitmentCard from './PendingCommitmentCard';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'Portfolio'>;

/**
 * Màn 20 — danh mục đầu tư (vẽ lại theo bộ mockup trang chủ 26/09/2026): nền sóng trang chủ, thẻ
 * tổng quan có robot cầm đồng xu, ba lối tắt, rồi từng khoản vay đang nắm Note. Ba lối tắt luôn
 * hiện, kể cả khi danh mục lỗi hoặc trống, vì đó là đường đi tiếp của nhà đầu tư.
 */
export default function PortfolioScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, PORTFOLIO_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn để lớp sóng đáy sát đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);
  const { data, loading, error, reload } = usePortfolio();
  const commitments = useInvestmentCommitments();
  const contracts = useInvestmentContracts();
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const cancelCommitment = (commitment: NonNullable<typeof commitments.data>[number]) => {
    Alert.alert(
      'Rút vốn đang chờ?',
      `FINORA sẽ hủy phần vốn ${formatDong(commitment.amount)} và trả tiền đang giữ về số dư khả dụng.`,
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Xác nhận rút vốn',
          style: 'destructive',
          onPress: () => {
            setCancellingId(commitment.commitmentId);
            void cancelInvestmentCommitment(commitment)
              .then(() => {
                Alert.alert('Đã rút vốn đang chờ', 'Tiền giữ sẽ trở lại số dư khả dụng.');
                commitments.reload();
                reload();
              })
              .catch(() => Alert.alert('Chưa rút được vốn', 'Trạng thái khoản vay có thể vừa thay đổi. Hãy tải lại và thử lại.'))
              .finally(() => setCancellingId(null));
          },
        },
      ],
    );
  };

  const shortcuts: readonly PortfolioShortcut[] = [
    { icon: 'file', label: 'Hợp đồng của tôi', onPress: () => nav.navigate('InvestorContracts') },
    { icon: 'zap', label: 'Tự động đầu tư', onPress: () => nav.navigate('AutoInvest') },
    { icon: 'layers', label: 'Chợ chuyển nhượng', onPress: () => nav.navigate('SecondaryMarket') },
  ];

  const renderBody = () => {
    if (loading && !data) {
      return (
        <>
          <Skeleton height={196} radius={16} />
          <Skeleton height={96} radius={Radius.md} />
          <Skeleton height={210} radius={Radius.md} />
        </>
      );
    }
    if (error || !data) {
      return (
        <>
          <PortfolioShortcuts items={shortcuts} />
          <InvestStatusCard
            icon="alert"
            danger
            title={error ?? 'Chưa tải được danh mục.'}
            hint="Kiểm tra kết nối mạng rồi thử lại."
            action={{ label: 'Thử lại', onPress: reload }}
          />
        </>
      );
    }
    return (
      <>
        <PortfolioHeroCard summary={data} width={width - PORTFOLIO_PADDING * 2} />
        <PortfolioShortcuts items={shortcuts} />

        {data.pendingAmount > 0 ? (
          <View style={styles.note}>
            <Icon name="clock" size={20} color={Colors.authPrimary} />
            <Text style={styles.noteText}>
              <Text style={styles.noteStrong}>{formatDong(data.pendingAmount)}</Text> {PENDING_NOTE}
            </Text>
          </View>
        ) : null}

        {(commitments.data?.length ?? 0) > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
              Đang chờ hoàn tất đầu tư
            </Text>
            {commitments.data?.map(commitment => (
              <PendingCommitmentCard
                key={commitment.commitmentId}
                commitment={commitment}
                contract={contracts.data?.find(contract => contract.loanApplicationId === commitment.loanId) ?? null}
                cancelling={cancellingId === commitment.commitmentId}
                onCancel={() => cancelCommitment(commitment)}
                onViewContract={contractNumber => nav.navigate('InvestContract', { contractNumber })}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
            Các khoản đã đầu tư
          </Text>
          {data.positions.length === 0 ? (
            <InvestStatusCard
              icon="chart"
              title="Chưa có Note nào"
              hint="Góp vốn vào một khoản vay trên Sàn, hoặc mua lại Note của nhà đầu tư khác trên chợ Notes."
              action={{ label: 'Mở chợ Notes', onPress: () => nav.navigate('SecondaryMarket') }}
            />
          ) : (
            data.positions.map(position => (
              <PositionCard
                key={position.loanId}
                position={position}
                contract={contracts.data?.find(contract => contract.loanApplicationId === position.loanId) ?? null}
                onViewContract={contractNumber => nav.navigate('InvestContract', { contractNumber })}
                onSell={() => nav.navigate('OrderBook', { listingId: position.listingId })}
              />
            ))
          )}
        </View>
      </>
    );
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
      refreshControl={
        <RefreshControl
          // Lần tải đầu đã có khung giả; vòng xoay chỉ dành cho kéo làm mới.
          refreshing={(loading && !!data) || (commitments.loading && !!commitments.data) || (contracts.loading && !!contracts.data)}
          onRefresh={() => { reload(); commitments.reload(); contracts.reload(); }}
          tintColor={Colors.authPrimary}
          colors={[Colors.authPrimary]}
        />
      }
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={HOME_WAVES} width={width} />
        <View style={styles.content}>
          <InvestHeader title="Danh mục đầu tư" topInset={insets.top} />
          {renderBody()}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Nền trùng hàng trên cùng của ảnh sóng: kéo làm mới lộ ra phía trên vẫn liền màu.
  root: { flex: 1, backgroundColor: Colors.homeWaveTop },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { gap: Spacing.xl, paddingHorizontal: PORTFOLIO_PADDING, paddingBottom: 72 },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.walletHistoryNote,
  },
  noteText: { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  noteStrong: { fontFamily: FontFamily.bold, color: Colors.authInk },
  section: { gap: Spacing.lg },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: 17, lineHeight: 24, color: Colors.authInk },
});
