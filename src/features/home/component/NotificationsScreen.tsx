import { StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Tag } from '@/components/ui';
import { EmptyState, ErrorState, LoadingScreen } from '@/components/feedback';
import { NOTIFICATION_ICON, NOTIFICATION_LABEL } from '../constant';
import { useNotifications } from '../hook/useHome';

/** Màn 9 — trung tâm thông báo. */
export default function NotificationsScreen() {
  const { data, loading, error, reload } = useNotifications();
  const unread = data?.filter(n => n.unread).length ?? 0;

  return (
    <Screen onRefresh={reload} refreshing={loading && !!data}>
      <PHeader
        title="Thông báo"
        back
        right={unread > 0 ? <Tag tone="red" small>{`${unread} mới`}</Tag> : undefined}
      />

      {loading && !data ? (
        <LoadingScreen cards={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState icon="bell" title="Chưa có thông báo" hint="Tin mới sẽ hiện ở đây." />
      ) : (
        data.map((n, i) => (
          <PItem
            key={n.id}
            icon={NOTIFICATION_ICON[n.kind]}
            label={
              <Text style={[styles.message, n.unread && styles.unread]}>
                {n.message}
                {n.highlight ? <Text style={styles.highlight}> {n.highlight}</Text> : null}
              </Text>
            }
            sub={NOTIFICATION_LABEL[n.kind]}
            last={i === data.length - 1}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: { ...Text_.body, color: Colors.ink2 },
  unread: { color: Colors.ink },
  highlight: { ...Text_.bodyBold, color: Colors.emerald },
});
