import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HOME_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';
import { WaveBackdrop } from '@/components/phone';
import { useAuth } from '@/providers/AuthProvider';
import { useBalance } from '@/features/wallet';
import { useMyApplications } from '@/features/applications';
import type { HomeStackParamList, TabParamList } from '@/navigation/types';
import { PROMO_SLIDES, type PromoTarget } from '../constant';
import { useHomeSummary, useUnreadCount } from '../hook/useHome';
import Greeting from './Greeting';
import HomeHeader from './HomeHeader';
import LatestApplicationSection from './LatestApplicationSection';
import PromoCarousel from './PromoCarousel';
import RecentActivitySection from './RecentActivitySection';
import WalletCard, { type WalletAction } from './WalletCard';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Home'>,
  BottomTabNavigationProp<TabParamList>
>;

/** Trên web và máy tính bảng, giữ cột nội dung cỡ điện thoại thay vì giãn theo cửa sổ. */
const MAX_WIDTH = 480;

/** Lề hai bên của mockup (hẹp hơn lề 20 của các màn cũ, thẻ gần mép hơn). */
const CONTENT_PADDING = 16;

/**
 * Màn 7 — trang chủ, màn gốc của tab Trang chủ (vẽ lại theo mockup 26/09/2026).
 * Màn chỉ điều phối dữ liệu và điều hướng; mỗi thẻ tự lo trạng thái tải, lỗi,
 * rỗng của mình, nên một dịch vụ lỗi không làm trắng cả trang chủ.
 */
export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, MAX_WIDTH);
  const { session } = useAuth();
  const balance = useBalance();
  const summary = useHomeSummary();
  const applications = useMyApplications();
  const unread = useUnreadCount();

  // Nội dung cao ít nhất bằng khung cuộn, để trên máy màn cao lớp sóng đáy vẫn sát đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);

  const reload = () => {
    balance.reload();
    summary.reload();
    applications.reload();
    unread.reload();
  };

  // Vòng xoay kéo-làm-mới chỉ hiện khi tải lại dữ liệu đã có; lần tải đầu mỗi
  // thẻ đã có khung giả của riêng nó.
  const refreshing =
    (balance.loading && balance.data !== null) ||
    (summary.loading && summary.data !== null) ||
    (applications.refreshing && !applications.loading);

  const openProducts = () => nav.navigate('Sàn', { screen: 'Products' });

  const openPromo = (target: PromoTarget) => {
    switch (target) {
      case 'products':
        return openProducts();
      case 'topUp':
        return nav.navigate('Ví', { screen: 'TopUp' });
      case 'payInstallment':
        return nav.navigate('Ví', { screen: 'PayInstallment' });
    }
  };

  const actions: readonly WalletAction[] = [
    { icon: 'wallet', label: 'Nạp', onPress: () => nav.navigate('Ví', { screen: 'TopUp' }) },
    { icon: 'download', label: 'Rút', onPress: () => nav.navigate('Ví', { screen: 'Withdraw' }) },
    { icon: 'file', label: 'Vay', onPress: openProducts },
    {
      icon: 'coins',
      label: 'Hồ sơ',
      onPress: () => nav.navigate('Hồ sơ', { screen: 'MyApplications' }),
    },
  ];

  const latest = applications.data?.[0];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={reload}
          // iOS đọc `tintColor`, Android đọc `colors`.
          tintColor={Colors.authPrimary}
          colors={[Colors.authPrimary]}
        />
      }
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={HOME_WAVES} width={width} />

        <View style={[styles.content, { paddingTop: insets.top + Spacing.xs }]}>
          <HomeHeader
            unread={unread.data ?? 0}
            onOpenNotifications={() => nav.navigate('Notifications')}
          />

          <View style={styles.hero}>
            <Greeting fullName={session?.profile.fullName} />
            <PromoCarousel slides={PROMO_SLIDES} onOpen={openPromo} />
          </View>

          <WalletCard
            available={balance.data?.available ?? null}
            loading={balance.loading}
            error={balance.error}
            onRetry={balance.reload}
            onOpenWallet={() => nav.navigate('Ví', { screen: 'WalletHistory' })}
            actions={actions}
            width={width - CONTENT_PADDING * 2}
          />

          <View style={styles.section}>
            <LatestApplicationSection
              application={latest}
              contract={
                latest ? applications.contractsByApplication.get(latest.applicationNumber) : undefined
              }
              loading={applications.loading}
              error={applications.error}
              onRetry={applications.reload}
              onOpen={applicationNumber =>
                nav.navigate('Hồ sơ', { screen: 'ApplicationDetail', params: { applicationNumber } })
              }
              onSeeAll={() => nav.navigate('Hồ sơ', { screen: 'MyApplications' })}
              onBrowseProducts={openProducts}
            />
          </View>

          <View style={styles.section}>
            <RecentActivitySection
              summary={summary.data}
              loading={summary.loading}
              error={summary.error}
              onRetry={summary.reload}
              onSeeAll={() => nav.navigate('Ví', { screen: 'WalletHistory' })}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Nền trùng hàng trên cùng của ảnh sóng: kéo làm mới lộ ra phía trên vẫn liền màu.
  root: { flex: 1, backgroundColor: Colors.homeWaveTop },
  scroll: { flexGrow: 1, alignItems: 'center' },
  // Đáy chừa một dải để lớp sóng đáy lộ ra dưới thẻ cuối như mockup.
  content: { paddingHorizontal: CONTENT_PADDING, paddingBottom: 72 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, marginBottom: 26 },
  section: { marginTop: 18 },
});
