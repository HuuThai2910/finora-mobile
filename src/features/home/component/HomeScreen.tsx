import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/colors';
import { IconSize, MIN_TOUCH, Spacing, Text_ } from '@/theme';
import { BalanceCard, PHeader, PItem, Screen } from '@/components/phone';
import { Icon, SectionLabel, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatDong, formatSigned } from '@/utils/format';
import { useAuth } from '@/providers/AuthProvider';
import { useBalance } from '@/features/wallet';
import { APPLICATION_STATUS, useMyApplications } from '@/features/applications';
import type { HomeStackParamList, TabParamList } from '@/navigation/types';
import { useHomeSummary, useUnreadCount } from '../hook/useHome';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Home'>,
  BottomTabNavigationProp<TabParamList>
>;

/** Màn 7 — trang chủ, màn gốc của tab Trang chủ. */
export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const { session } = useAuth();
  const balance = useBalance();
  const summary = useHomeSummary();
  const applications = useMyApplications();
  const unread = useUnreadCount();

  // Chào bằng tên gọi (chữ cuối của họ tên trên CCCD); chưa quét eKYC thì
  // chưa có tên — chào trống chứ không thay bằng email.
  const givenName = session?.profile.fullName?.trim().split(/\s+/).slice(-1)[0] ?? '';
  const latestApplication = applications.data?.[0];

  const loading = balance.loading || summary.loading || applications.loading;
  const error = balance.error ?? summary.error ?? applications.error;
  const reload = () => {
    balance.reload();
    summary.reload();
    applications.reload();
    unread.reload();
  };

  return (
    <Screen onRefresh={reload} refreshing={loading && !!summary.data}>
      <PHeader
        title={givenName ? `Xin chào, ${givenName} 👋` : 'Xin chào 👋'}
        right={
          <Pressable
            onPress={() => nav.navigate('Notifications')}
            accessibilityRole="button"
            accessibilityLabel={
              unread.data ? `Thông báo, ${unread.data} tin mới` : 'Thông báo'
            }
            hitSlop={Spacing.lg}
            style={styles.bell}
          >
            <Icon name="bell" size={IconSize.sm} color={Colors.ink2} />
            {unread.data ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread.data}</Text>
              </View>
            ) : null}
          </Pressable>
        }
      />

      {loading && !summary.data ? (
        <LoadingScreen cards={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <BalanceCard
            label="SỐ DƯ VÍ"
            value={balance.data ? formatDong(balance.data.available) : '—'}
            actions={[
              { icon: 'wallet', label: 'Nạp', onPress: () => nav.navigate('Ví', { screen: 'TopUp' }) },
              { icon: 'download', label: 'Rút', onPress: () => nav.navigate('Ví', { screen: 'Withdraw' }) },
              { icon: 'file', label: 'Vay', onPress: () => nav.navigate('Sàn', { screen: 'Products' }) },
              {
                icon: 'coins',
                label: 'Hồ sơ',
                onPress: () => nav.navigate('Hồ sơ', { screen: 'MyApplications' }),
              },
            ]}
          />

          {latestApplication ? (
            <>
              <SectionLabel style={styles.section}>Hồ sơ vay gần nhất</SectionLabel>

              <PItem
                label={latestApplication.applicationNumber}
                sub={formatDong(latestApplication.requestedAmount)}
                value={(
                  <Tag tone={APPLICATION_STATUS[latestApplication.status].tone} small>
                    {APPLICATION_STATUS[latestApplication.status].label}
                  </Tag>
                )}
                onPress={() => nav.navigate('Hồ sơ', {
                  screen: 'ApplicationDetail',
                  params: { applicationNumber: latestApplication.applicationNumber },
                })}
                last
              />
            </>
          ) : null}

          {summary.data ? (
            <>
              <SectionLabel style={styles.section}>Giao dịch gần đây</SectionLabel>

              {summary.data.recent.map(tx => (
                <PItem
                  key={tx.id}
                  label={tx.label}
                  value={formatSigned(tx.amount, tx.direction)}
                  valueTone={tx.direction === 'in' ? 'up' : undefined}
                />
              ))}

              <PItem
                icon="chain"
                label={<Text style={styles.chain}>{summary.data.chainRef.label}</Text>}
                value={<Tag tone="violet" small>{summary.data.chainRef.tx}</Tag>}
                last
              />
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bell: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 6,
    right: 4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { ...Text_.captionBold, color: Colors.onDark, fontSize: 11 },
  section: { marginTop: Spacing.xxl },
  chain: { ...Text_.body, color: Colors.violet },
});
