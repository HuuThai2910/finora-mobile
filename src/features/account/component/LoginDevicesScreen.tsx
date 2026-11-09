import { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HOME_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { FontFamily, LineHeight, Radius, SoftShadow, Spacing, lh } from '@/theme';
import { WaveBackdrop } from '@/components/phone';
import { EmptyState, ErrorState, Skeleton } from '@/components/feedback';
import { Button, InfoNote, Tag } from '@/components/ui';
import type { LoginDevice } from '@/types/auth';
import { formatDate, formatRecentTime } from '@/utils/format';
import { PROFILE_MAX_WIDTH } from '../constant';
import { useLoginDevices } from '../hook/useLoginDevices';
import AccountInfoHeader from './AccountInfoHeader';
import AccountInfoRow from './AccountInfoRow';
import AccountInfoTile from './AccountInfoTile';

/**
 * "Thiết bị đăng nhập" (LOGIN-DEVICE-001): các máy đã đăng nhập vào tài khoản, gần nhất trước, máy đang dùng có nhãn
 * "Thiết bị này". Máy khác còn phiên đăng nhập thì đăng xuất được từ đây (hỏi xác nhận trước). Cùng khung nền sóng,
 * đầu màn và kiểu dòng với "Thông tin tài khoản".
 */
export default function LoginDevicesScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, PROFILE_MAX_WIDTH);
  const devices = useLoginDevices();
  const [viewportHeight, setViewportHeight] = useState(0);

  const list = devices.data;
  const refreshing = devices.loading && list !== null;

  const confirmSignOut = (device: LoginDevice) =>
    Alert.alert(
      'Đăng xuất thiết bị này?',
      `${device.deviceName} sẽ phải đăng nhập lại mới dùng được tài khoản của bạn.`,
      [
        { text: 'Giữ lại', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: () => void devices.signOut(device.id) },
      ],
    );

  let body: React.ReactNode;
  if (devices.error) {
    body = <ErrorState message={devices.error} onRetry={devices.reload} />;
  } else if (!list) {
    body = <DevicesSkeleton />;
  } else if (list.length === 0) {
    body = (
      <EmptyState
        icon="shield"
        title="Chưa có thiết bị nào"
        hint="Thiết bị sẽ hiện ở đây từ lần đăng nhập tiếp theo."
      />
    );
  } else {
    body = (
      <View style={styles.sections}>
        {devices.actionError ? <InfoNote tone="warn">{devices.actionError}</InfoNote> : null}
        {list.map(device => (
          <DeviceCard
            key={device.id}
            device={device}
            signingOut={devices.signingOutId === device.id}
            onSignOut={device.canSignOut ? () => confirmSignOut(device) : undefined}
          />
        ))}
        <InfoNote>
          Không nhận ra một thiết bị? Hãy đăng xuất thiết bị đó và đổi mật khẩu ngay.
        </InfoNote>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={devices.reload}
          tintColor={Colors.authPrimary}
          colors={[Colors.authPrimary]}
        />
      }
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={HOME_WAVES} width={width} />
        <View style={[styles.content, { paddingTop: insets.top + Spacing.xs }]}>
          <AccountInfoHeader title="Thiết bị đăng nhập" />
          <View style={styles.body}>{body}</View>
        </View>
      </View>
    </ScrollView>
  );
}

type DeviceCardProps = {
  device: LoginDevice;
  signingOut: boolean;
  onSignOut?: () => void;
};

/** Một thiết bị: tên, hệ điều hành, nhãn "Thiết bị này", lần đăng nhập cuối, IP đã che, lần đầu đăng nhập. */
function DeviceCard({ device, signingOut, onSignOut }: DeviceCardProps) {
  const subtitle = [device.osName, device.clientType === 'WEB' ? 'Trình duyệt' : 'Ứng dụng FINORA']
    .filter(Boolean)
    .join(' · ');
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AccountInfoTile icon={device.clientType === 'WEB' ? 'monitor' : 'phone'} />
        <View style={styles.titleBlock}>
          <Text style={styles.name} maxFontSizeMultiplier={1.4}>
            {device.deviceName}
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={1.4}>
            {subtitle}
          </Text>
        </View>
        {device.current ? (
          <Tag tone="green" small>
            Thiết bị này
          </Tag>
        ) : null}
      </View>
      <AccountInfoRow icon="clock" label="Đăng nhập gần nhất" value={formatRecentTime(device.lastLoginAt)} />
      <AccountInfoRow icon="mapPin" label="Địa chỉ IP" value={device.ipAddress} />
      <AccountInfoRow
        icon="calendar"
        label="Lần đầu đăng nhập"
        value={`${formatDate(device.firstLoginAt)} · ${device.loginCount} lần`}
      />
      {onSignOut ? (
        <View style={styles.action}>
          <Button label="Đăng xuất thiết bị" variant="danger" onPress={onSignOut} loading={signingOut} />
        </View>
      ) : null}
    </View>
  );
}

/** Khung giả lúc tải lần đầu: hai thẻ cùng nhịp với thẻ thật. */
function DevicesSkeleton() {
  return (
    <View style={styles.sections} accessibilityLiveRegion="polite" accessibilityLabel="Đang tải thiết bị đăng nhập">
      {[0, 1].map(key => (
        <View key={key} style={styles.card}>
          <View style={styles.header}>
            <Skeleton height={36} width={36} />
            <View style={styles.titleBlock}>
              <Skeleton height={15} width="55%" />
              <Skeleton height={12} width="35%" style={styles.skeletonGap} />
            </View>
          </View>
          {[0, 1, 2].map(row => (
            <Skeleton key={row} height={14} width="80%" style={styles.skeletonRow} />
          ))}
        </View>
      ))}
    </View>
  );
}

const NAME_SIZE = 16;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.homeWaveTop },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.page },
  body: { marginTop: Spacing.lg },
  sections: { gap: Spacing.xl },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    ...SoftShadow.card,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, paddingBottom: 10 },
  titleBlock: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: NAME_SIZE,
    lineHeight: lh(NAME_SIZE, LineHeight.heading),
    color: Colors.authInk,
  },
  subtitle: { marginTop: 2, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  action: { marginTop: Spacing.md, marginBottom: 4 },
  skeletonGap: { marginTop: 6 },
  skeletonRow: { marginTop: 14 },
});
