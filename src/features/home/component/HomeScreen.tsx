import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/colors';
import { IconSize, MIN_TOUCH, Spacing, Text_ } from '@/theme';
import { BalanceCard, PHeader, PItem, Screen } from '@/components/phone';
import { Icon, ProgressBar, SectionLabel, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatDong, formatSigned } from '@/utils/format';
import { useAuth } from '@/providers/AuthProvider';
import { useBalance } from '@/features/wallet';
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
  const unread = useUnreadCount();

  const firstName = session?.profile.fullName.split(' ').slice(-1)[0] ?? 'bạn';

  const loading = balance.loading || summary.loading;
  const error = balance.error ?? summary.error;
  const reload = () => {
    balance.reload();
    summary.reload();
    unread.reload();
  };

  return (
    <Screen onRefresh={reload} refreshing={loading && !!summary.data}>
      <PHeader
        title={`Xin chào, ${firstName} 👋`}
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
                label: 'Trả nợ',
                onPress: () => nav.navigate('Ví', { screen: 'PayInstallment' }),
              },
            ]}
          />

          {summary.data ? (
            <>
              <SectionLabel style={styles.section}>{`Khoản vay ${summary.data.loan.id}`}</SectionLabel>

              <PItem
                label={`Kỳ ${summary.data.loan.nextPeriod} · ${summary.data.loan.nextDueDate}`}
                value={formatDong(summary.data.loan.nextAmount)}
                last
              />

              <ProgressBar
                percent={
                  (summary.data.loan.paidPeriods / summary.data.loan.totalPeriods) * 100
                }
                label="Tiến độ trả nợ"
                style={styles.bar}
              />

              <PItem
                label={
                  <Text style={styles.muted}>
                    {`Đã trả ${summary.data.loan.paidPeriods}/${summary.data.loan.totalPeriods} kỳ`}
                  </Text>
                }
                value={<Text style={styles.grade}>{summary.data.loan.gradeLabel}</Text>}
                last
              />

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
  bar: { marginVertical: Spacing.lg },
  muted: { ...Text_.micro, color: Colors.ink3 },
  grade: { ...Text_.microBold, color: Colors.emerald },
  chain: { ...Text_.body, color: Colors.violet },
});
