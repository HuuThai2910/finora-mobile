import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing, Text_ } from '@/theme';
import { PItem, Screen } from '@/components/phone';
import { Button, SectionLabel, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { useAuth } from '@/providers/AuthProvider';
import type { IconName } from '@/constants/icons';
import type { ProfileStackParamList } from '@/navigation/types';
import { KYC_LABEL, KYC_TONE, LOGOUT_CONFIRM_BODY, LOGOUT_CONFIRM_TITLE } from '../constant';
import { useMyProfile, useSettingsMenu } from '../hook/useAccount';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

/**
 * Màn 26 — hồ sơ cá nhân, màn gốc của tab Hồ sơ.
 *
 * Các dòng menu chỉ có nhãn (không chữ phụ) và gom theo nhóm để màn không thành
 * bức tường chữ; trạng thái eKYC hiển thị một lần duy nhất ở phần đầu, dòng
 * "Xác thực eKYC" chỉ xuất hiện khi còn việc phải làm.
 */
export default function AccountScreen() {
  const nav = useNavigation<Nav>();
  const { signOut } = useAuth();
  const profile = useMyProfile();
  const menu = useSettingsMenu();

  const loading = profile.loading || menu.loading;
  const error = profile.error ?? menu.error;
  const reload = () => {
    profile.reload();
    menu.reload();
  };

  const onLogout = () =>
    Alert.alert(LOGOUT_CONFIRM_TITLE, LOGOUT_CONFIRM_BODY, [
      { text: 'Ở lại', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: signOut },
    ]);

  if (loading) return <Screen><LoadingScreen cards={3} /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!profile.data) return null;

  const p = profile.data;
  const verified = p.kycStatus === 'KYC_VERIFIED';

  return (
    <Screen onRefresh={reload} refreshing={false}>
      <View style={styles.head}>
        <LinearGradient
          colors={[Colors.navy, Colors.brand]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.initial}>{p.initial}</Text>
        </LinearGradient>

        <View style={styles.identity}>
          {/* Chưa quét eKYC thì chưa có tên — hiện email để biết đang ở tài
              khoản nào, tag bên dưới đã nói trạng thái định danh. */}
          <Text style={styles.name} accessibilityRole="header" numberOfLines={1}>
            {p.fullName ?? p.email}
          </Text>
          <View style={styles.tags}>
            <Tag tone={KYC_TONE[p.kycStatus]} small>
              {KYC_LABEL[p.kycStatus]}
            </Tag>
            {/* Điểm tín dụng chưa có trong `GET /users/me`; ẩn hẳn thay vì hiển thị số rỗng */}
            {p.creditGrade && p.creditScore !== null ? (
              <Tag tone="blue" small>{`Điểm ${p.creditGrade}+ · ${p.creditScore}`}</Tag>
            ) : null}
          </View>
        </View>
      </View>

      <SectionLabel>Tài khoản</SectionLabel>
      {!verified ? (
        <PItem
          label="Xác thực eKYC"
          icon="scan"
          onPress={() => nav.navigate('EkycCapture', { side: 'front' })}
        />
      ) : null}
      <PItem
        label="Thông tin tài khoản"
        icon="id"
        onPress={() => nav.navigate('AccountInfo')}
        last
      />

      <SectionLabel style={styles.section}>Khoản vay</SectionLabel>
      <PItem
        label="Hồ sơ vay của tôi"
        icon="coins"
        onPress={() => nav.navigate('MyApplications')}
      />
      <PItem
        label="Hợp đồng vay của tôi"
        icon="file"
        onPress={() => nav.navigate('MyContracts')}
      />
      <PItem
        label="Lịch trả nợ"
        icon="clock"
        value={<Tag tone="gray" small>Sắp triển khai</Tag>}
        last
      />

      <SectionLabel style={styles.section}>Cài đặt</SectionLabel>
      {menu.data?.map((m, i) => (
        <PItem
          key={m.label}
          label={m.label}
          icon={m.icon as IconName}
          value={m.value}
          onPress={() => {}}
          last={i === (menu.data?.length ?? 0) - 1}
        />
      ))}

      <Button label="Đăng xuất" variant="danger" onPress={onLogout} style={styles.logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontFamily: FontFamily.extrabold, fontSize: FontSize.heading, color: Colors.onDark },
  identity: { flexShrink: 1, gap: Spacing.sm },
  name: { ...Text_.title, color: Colors.ink },
  tags: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  section: { marginTop: Spacing.section },
  logout: { marginTop: Spacing.section },
});
