import { Alert, RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';
import type { IconName } from '@/constants/icons';
import { ErrorState } from '@/components/feedback';
import { Switch } from '@/components/ui';
import { usePushToggle } from '@/features/push-notifications';
import { useAuth } from '@/providers/AuthProvider';
import type { ProfileStackParamList, TabParamList } from '@/navigation/types';
import {
  COMING_SOON,
  EKYC_ROW_SUBTITLE,
  LOGOUT_CONFIRM_BODY,
  LOGOUT_CONFIRM_TITLE,
  PROFILE_MAX_WIDTH,
  SECURITY_SETTINGS,
  canStartEkyc,
  type UpcomingSetting,
} from '../constant';
import { useMyProfile } from '../hook/useAccount';
import { usePinSetting } from '../hook/usePinSetting';
import ProfileBackdrop from './ProfileBackdrop';
import ProfileHeader from './ProfileHeader';
import ProfileShortcuts, { type ProfileShortcut } from './ProfileShortcuts';
import ProfileSkeleton from './ProfileSkeleton';
import SettingsCard from './SettingsCard';
import SettingsRow from './SettingsRow';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'Profile'>,
  BottomTabNavigationProp<TabParamList>
>;

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
  const { session, signOut } = useAuth();
  const profile = useMyProfile();
  const pin = usePinSetting();
  const push = usePushToggle();

  const openInfo = () => nav.navigate('AccountInfo');
  // Luôn vào qua màn điều khoản; đã đồng ý bản hiện hành thì màn đó tự chuyển sang chụp thẻ.
  const startEkyc = () => nav.navigate('EkycConsent');

  const onLogout = () =>
    Alert.alert(LOGOUT_CONFIRM_TITLE, LOGOUT_CONFIRM_BODY, [
      { text: 'Ở lại', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: signOut },
    ]);

  // Lối tắt theo vai trò: nhà đầu tư không có hồ sơ vay hay khoản vay để trả nợ.
  const investorShortcuts: readonly ProfileShortcut[] = [
    {
      icon: 'chart',
      title: 'Danh mục',
      subtitle: 'Khoản đầu tư và tiền đã nhận',
      onPress: () => nav.navigate('Ví', { screen: 'Portfolio' }),
      hint: 'Mở danh mục đầu tư ở tab Ví',
    },
    {
      icon: 'file',
      title: 'Hợp đồng',
      subtitle: 'Hợp đồng góp vốn đã ký',
      onPress: () => nav.navigate('MyContracts'),
    },
    {
      icon: 'layers',
      title: 'Chợ chuyển nhượng',
      subtitle: 'Mua bán phần vốn đang nắm giữ',
      onPress: () => nav.navigate('Ví', { screen: 'SecondaryMarket' }),
      hint: 'Mở chợ chuyển nhượng phần vốn ở tab Ví',
    },
  ];
  const borrowerShortcuts: readonly ProfileShortcut[] = [
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
      title: 'Khoản vay',
      subtitle: 'Trả nợ và cơ cấu',
      onPress: () => nav.navigate('LoanServicingList'),
      hint: 'Mở danh sách khoản vay đã giải ngân',
    },
  ];
  const shortcuts = session?.profile.role === 'INVESTOR' ? investorShortcuts : borrowerShortcuts;

  const p = profile.data;
  const verified = p?.kycStatus === 'KYC_VERIFIED';

  // Lần tải đầu đã có khung giả; vòng xoay kéo-làm-mới chỉ hiện khi tải lại.
  const refreshing = profile.loading && p !== null;
  const reload = () => {
    profile.reload();
    pin.reload();
  };

  let body: React.ReactNode;
  if (profile.error) {
    body = <ErrorState message={profile.error} onRetry={profile.reload} />;
  } else if (!p) {
    body = <ProfileSkeleton />;
  } else {
    body = (
      <>
        <ProfileHeader profile={p} width={width} onStartEkyc={startEkyc} />

        <View style={styles.shortcuts}>
          <ProfileShortcuts items={shortcuts} />
        </View>

        <View style={styles.groups}>
          <SettingsCard icon="user" title="Tài khoản">
            {/* Chỉ còn hiện khi còn việc phải làm; đã định danh thì nhãn ở đầu trang đã đủ.
                Đang chờ duyệt thì dòng hiện mờ, không bấm được: chưa có việc gì để làm. */}
            {!verified ? (
              <SettingsRow
                icon="scan"
                title="Xác thực eKYC"
                subtitle={EKYC_ROW_SUBTITLE[p.kycStatus]}
                onPress={canStartEkyc(p.kycStatus) ? startEkyc : undefined}
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

          <UpcomingGroup icon="shieldCheck" title="Bảo mật & Liên kết" items={SECURITY_SETTINGS}>
            <SettingsRow
              icon="lock"
              title={pin.title}
              subtitle={pin.subtitle}
              onPress={() => void pin.open()}
              accessibilityHint="Mở bảng nhập mã PIN giao dịch"
            />
            <SettingsRow
              icon="bank"
              title="Ngân hàng liên kết"
              subtitle="Tài khoản nhận tiền rút về"
              onPress={() => nav.navigate('BankAccounts')}
              accessibilityHint="Mở danh sách tài khoản ngân hàng đã liên kết"
              divider
            />
            <SettingsRow
              icon="shield"
              title="Thiết bị đăng nhập"
              subtitle="Các máy đang dùng tài khoản của bạn"
              onPress={() => nav.navigate('LoginDevices')}
              accessibilityHint="Mở danh sách thiết bị đã đăng nhập"
              divider
            />
          </UpcomingGroup>
          <SettingsCard icon="bell" title="Thông báo & Cài đặt">
            {/* Bật/tắt ngay tại dòng, không mở màn cài đặt riêng. */}
            <SettingsRow
              icon="bell"
              title="Thông báo đẩy"
              subtitle={push.subtitle}
              right={
                <Switch
                  value={push.value}
                  onValueChange={push.onChange}
                  disabled={push.disabled}
                  label="Nhận thông báo đẩy"
                />
              }
            />
            <SettingsRow
              icon="fileText"
              title="Điều khoản"
              subtitle="Điều khoản sử dụng FINORA"
              onPress={() => nav.navigate('Terms')}
              accessibilityHint="Mở điều khoản sử dụng"
              divider
            />
          </SettingsCard>

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
        <RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={Colors.authPrimary} />
      }
    >
      <View style={{ width }}>
        <ProfileBackdrop width={width} />
        <View style={[styles.content, { paddingTop: insets.top + Spacing.lg }]}>{body}</View>
      </View>
    </ScrollView>
  );
}

type UpcomingGroupProps = {
  icon: IconName;
  title: string;
  items: readonly UpcomingSetting[];
  /** Dòng đã có chức năng thật, đứng trước các mục "Sắp có" (như mã PIN giao dịch). */
  children?: React.ReactNode;
};

/** Nhóm cài đặt có các mục chưa có chức năng thật (xem `SECURITY_SETTINGS`). */
function UpcomingGroup({ icon, title, items, children }: UpcomingGroupProps) {
  return (
    <SettingsCard icon={icon} title={title}>
      {children}
      {items.map((item, index) => (
        <SettingsRow
          key={item.title}
          icon={item.icon}
          title={item.title}
          subtitle={COMING_SOON}
          divider={index > 0 || !!children}
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
