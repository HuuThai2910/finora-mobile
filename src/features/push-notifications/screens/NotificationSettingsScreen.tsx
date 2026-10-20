import { useState } from 'react';
import { Linking, RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HOME_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';
import { WaveBackdrop } from '@/components/phone';
import { ErrorState } from '@/components/feedback';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { registerForPush } from '../lib/pushRegistration';
import { usePushRegistrationState } from '../lib/registrationStore';
import NotificationNote from '../components/NotificationNote';
import NotificationSettingsHeader from '../components/NotificationSettingsHeader';
import NotificationSettingsSkeleton from '../components/NotificationSettingsSkeleton';
import PreferenceToggleRow from '../components/PreferenceToggleRow';
import PushStatusCard from '../components/PushStatusCard';
import SettingsGroupCard from '../components/SettingsGroupCard';

/** Cùng bề ngang cột nội dung với các màn của tab Hồ sơ (`PROFILE_MAX_WIDTH` của feature `account`). */
const SETTINGS_MAX_WIDTH = 480;

/**
 * Cài đặt thông báo (tab Hồ sơ): trạng thái thông báo đẩy của thiết bị và công tắc push theo nhóm. Vẽ theo giao diện
 * màn "Thông tin tài khoản" của Hải (nền sóng, đầu màn không thẻ, thẻ cài đặt trắng, hộp ghi chú nền nhạt).
 *
 * Màn chỉ điều phối; đăng ký thiết bị nằm ở `lib/pushRegistration`, dữ liệu tùy chọn ở `useNotificationPreferences`.
 * Thẻ trạng thái thiết bị luôn hiện vì đọc từ trạng thái trên máy; chỉ phần nhóm thông báo chờ máy chủ.
 */
export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, SETTINGS_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn, để trên máy màn cao lớp sóng đáy vẫn sát đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);
  const registration = usePushRegistrationState();
  const preferences = useNotificationPreferences();

  let groups: React.ReactNode;
  if (preferences.phase === 'loading') {
    groups = <NotificationSettingsSkeleton />;
  } else if (preferences.phase === 'error') {
    groups = <ErrorState message={preferences.error ?? undefined} onRetry={preferences.reload} />;
  } else {
    groups = (
      <>
        {preferences.readOnly ? (
          <NotificationNote tone="warn">
            Thông báo đang chạy dữ liệu giả: công tắc chỉ để xem, chưa lưu lên máy chủ.
          </NotificationNote>
        ) : null}
        {preferences.saveError ? <NotificationNote tone="warn">{preferences.saveError}</NotificationNote> : null}
        <SettingsGroupCard icon="layers" title="Nhận thông báo đẩy theo nhóm">
          {preferences.items.map((item, index) => (
            <PreferenceToggleRow
              key={item.category}
              category={item.category}
              pushEnabled={item.pushEnabled}
              disabled={preferences.readOnly || preferences.saving.has(item.category)}
              divider={index > 0}
              onChange={value => preferences.toggle(item.category, value)}
            />
          ))}
        </SettingsGroupCard>
        <NotificationNote>
          Thông báo trong ứng dụng luôn được lưu ở mục Thông báo, kể cả khi bạn tắt thông báo đẩy của một nhóm.
        </NotificationNote>
      </>
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
          refreshing={preferences.refreshing}
          onRefresh={preferences.reload}
          // iOS đọc `tintColor`, Android đọc `colors`.
          tintColor={Colors.authPrimary}
          colors={[Colors.authPrimary]}
        />
      }
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={HOME_WAVES} width={width} />

        <View style={[styles.content, { paddingTop: insets.top + Spacing.xs }]}>
          <NotificationSettingsHeader />
          <View style={styles.sections}>
            <PushStatusCard
              state={registration}
              onEnable={() => void registerForPush('always')}
              onOpenSystemSettings={() => void Linking.openSettings()}
            />
            <NotificationNote>
              Thông báo đẩy trên màn hình khóa chỉ báo có cập nhật mới, không hiện số tiền hay mã khoản vay. Mở FINORA
              để xem đầy đủ.
            </NotificationNote>
            {groups}
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
  // Cùng lề với màn Hồ sơ để thẻ không nhảy ngang khi chuyển qua lại; đáy chừa một dải cho lớp sóng đáy.
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.page },
  sections: { marginTop: Spacing.lg, gap: Spacing.xl },
});
