import { Alert, RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';
import type { IconName } from '@/constants/icons';
import { ErrorState } from '@/components/feedback';
import { useAuth } from '@/providers/AuthProvider';
import type { ProfileStackParamList } from '@/navigation/types';
import {
  COMING_SOON,
  LOGOUT_CONFIRM_BODY,
  LOGOUT_CONFIRM_TITLE,
  NOTIFICATION_SETTINGS,
  PROFILE_MAX_WIDTH,
  SECURITY_SETTINGS,
  type UpcomingSetting,
} from '../constant';
import { useMyProfile } from '../hook/useAccount';
import { useScheduleShortcut } from '../hook/useScheduleShortcut';
import ProfileBackdrop from './ProfileBackdrop';
import ProfileHeader from './ProfileHeader';
import ProfileShortcuts, { type ProfileShortcut } from './ProfileShortcuts';
import ProfileSkeleton from './ProfileSkeleton';
import SettingsCard from './SettingsCard';
import SettingsRow from './SettingsRow';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

/**
 * Màn 26 — hồ sơ cá nhân, màn gốc của tab Hồ sơ (vẽ lại theo mockup 26/09/2026).
 *
 * Màn chỉ điều phối dữ liệu và điều hướng. Mỗi dòng hoặc dẫn tới một màn có
 * thật, hoặc hiện mờ "Sắp có": mockup điền sẵn số liệu mẫu (ngân hàng liên kết,
 * Face ID, số thiết bị...) nhưng app chưa có các chức năng đó nên không hiển thị
 * số liệu giả, cũng không vẽ thành nút bấm.
 */
export default function AccountScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, PROFILE_MAX_WIDTH);
  const { signOut } = useAuth();
  const profile = useMyProfile();
  const schedule = useScheduleShortcut();

  const openInfo = () => nav.navigate('AccountInfo');
  const startEkyc = () => nav.navigate('EkycCapture', { side: 'front' });
  const openSchedule = () =>
    schedule.kind === 'contract'
      ? nav.navigate('RepaymentSchedule', { source: 'contract', number: schedule.contractNumber })
      : nav.navigate('MyContracts');

  const onLogout = () =>
    Alert.alert(LOGOUT_CONFIRM_TITLE, LOGOUT_CONFIRM_BODY, [
      { text: 'Ở lại', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: signOut },
    ]);

  const shortcuts: readonly ProfileShortcut[] = [
    {
      icon: 'fileText',
      title: 'Hồ sơ vay',
      subtitle: 'Xem chi tiết các khoản vay',
      onPress: () => nav.navigate('MyApplications'),
    },
    {
      icon: 'file',
      title: 'Hợp đồng',
      subtitle: 'Xem và tải về hợp đồng',
      onPress: () => nav.navigate('MyContracts'),
    },
    {
      icon: 'calendar',
      title: 'Lịch trả nợ',
      subtitle: 'Theo dõi lịch trả nợ',
      onPress: openSchedule,
      hint:
        schedule.kind === 'contract'
          ? `Mở lịch trả nợ của hợp đồng ${schedule.contractNumber}`
          : 'Mở danh sách hợp đồng để chọn khoản vay',
    },
  ];

  const p = profile.data;
  const verified = p?.kycStatus === 'KYC_VERIFIED';

  // Lần tải đầu đã có khung giả; vòng xoay kéo-làm-mới chỉ hiện khi tải lại.
  const refreshing = profile.loading && p !== null;

  let body: React.ReactNode;
  if (profile.error) {
    body = <ErrorState message={profile.error} onRetry={profile.reload} />;
  } else if (!p) {
    body = <ProfileSkeleton />;
  } else {
    body = (
      <>
        <ProfileHeader profile={p} width={width} onOpenInfo={openInfo} onStartEkyc={startEkyc} />

        <View style={styles.shortcuts}>
          <ProfileShortcuts items={shortcuts} />
        </View>

        <View style={styles.groups}>
          <SettingsCard icon="user" title="Tài khoản">
            {/* Chỉ còn hiện khi còn việc phải làm; đã định danh thì nhãn ở đầu trang đã đủ. */}
            {!verified ? (
              <SettingsRow
                icon="scan"
                title="Xác thực eKYC"
                subtitle="Chụp mặt trước và mặt sau CCCD"
                onPress={startEkyc}
              />
            ) : null}
            <SettingsRow
              icon="id"
              title="Thông tin tài khoản"
              subtitle="Xem thông tin cá nhân"
              onPress={openInfo}
              divider={!verified}
            />
          </SettingsCard>

          <UpcomingGroup icon="shieldCheck" title="Bảo mật & Liên kết" items={SECURITY_SETTINGS} />
          <UpcomingGroup icon="bell" title="Thông báo & Cài đặt" items={NOTIFICATION_SETTINGS} />

          <SettingsCard>
            <SettingsRow icon="logout" title="Đăng xuất" onPress={onLogout} danger />
          </SettingsCard>
        </View>
      </>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={profile.reload} tintColor={Colors.authPrimary} />
      }
    >
      <View style={{ width }}>
        <ProfileBackdrop width={width} />
        <View style={[styles.content, { paddingTop: insets.top + Spacing.lg }]}>{body}</View>
      </View>
    </ScrollView>
  );
}

type UpcomingGroupProps = { icon: IconName; title: string; items: readonly UpcomingSetting[] };

/** Nhóm cài đặt mà mọi mục đều chưa có chức năng thật (xem `SECURITY_SETTINGS`). */
function UpcomingGroup({ icon, title, items }: UpcomingGroupProps) {
  return (
    <SettingsCard icon={icon} title={title}>
      {items.map((item, index) => (
        <SettingsRow
          key={item.title}
          icon={item.icon}
          title={item.title}
          subtitle={COMING_SOON}
          divider={index > 0}
        />
      ))}
    </SettingsCard>
  );
}

const styles = StyleSheet.create({
  // Cùng màu phần nền trơn của ảnh sóng: vùng lộ ra khi kéo quá đà và hai bên
  // cột nội dung trên web đều liền màu với ảnh.
  root: { flex: 1, backgroundColor: Colors.productsBackdrop },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.section },
  shortcuts: { marginTop: Spacing.xl },
  groups: { marginTop: Spacing.lg, gap: Spacing.lg },
});
