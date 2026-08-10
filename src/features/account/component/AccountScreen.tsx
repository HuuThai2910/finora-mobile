import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing, Text_ } from '@/theme';
import { PItem, Screen } from '@/components/phone';
import { Button, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { useAuth } from '@/providers/AuthProvider';
import type { IconName } from '@/constants/icons';
import type { ProfileStackParamList } from '@/navigation/types';
import { KYC_LABEL, KYC_TONE, LOGOUT_CONFIRM_BODY, LOGOUT_CONFIRM_TITLE } from '../constant';
import { useMyProfile, useSettingsMenu } from '../hook/useAccount';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

/** Màn 26 — hồ sơ cá nhân, màn gốc của tab Hồ sơ. */
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
          <Text style={styles.name} accessibilityRole="header">
            {p.fullName}
          </Text>
          <View style={styles.tags}>
            <Tag tone={KYC_TONE[p.kycStatus]} small>
              {KYC_LABEL[p.kycStatus]}
            </Tag>
            <Tag tone="blue" small>{`Điểm ${p.creditGrade}+ · ${p.creditScore}`}</Tag>
          </View>
        </View>
      </View>

      <PItem
        label="Hồ sơ vay của tôi"
        icon="coins"
        onPress={() => nav.navigate('MyApplications')}
      />
      <PItem
        label="Hợp đồng vay của tôi"
        sub="Đọc, ký hoặc từ chối hợp đồng đang chờ xác nhận"
        icon="file"
        onPress={() => nav.navigate('MyContracts')}
      />
      <PItem
        label="Lịch trả nợ sau giải ngân"
        sub="Chưa có dữ liệu vận hành từ hệ thống"
        icon="clock"
        value={<Tag tone="gray" small>Sắp triển khai</Tag>}
      />

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
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontFamily: FontFamily.extrabold, fontSize: FontSize.display, color: Colors.onDark },
  identity: { flexShrink: 1, gap: Spacing.md },
  name: { ...Text_.heading, color: Colors.ink },
  tags: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  logout: { marginTop: Spacing.section },
});
