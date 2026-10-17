import { Linking, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { Screen, PHeader } from '@/components/phone';
import { Card, InfoNote, SectionLabel } from '@/components/ui';
import { ErrorState, SkeletonCard } from '@/components/feedback';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { registerForPush } from '../lib/pushRegistration';
import { usePushRegistrationState } from '../lib/registrationStore';
import PreferenceToggleRow from '../components/PreferenceToggleRow';
import PushStatusCard from '../components/PushStatusCard';

/**
 * Cài đặt thông báo (tab Hồ sơ): trạng thái thông báo đẩy của thiết bị và công tắc push theo nhóm.
 * Màn chỉ điều phối; đăng ký thiết bị nằm ở `lib/pushRegistration`, dữ liệu tùy chọn ở `useNotificationPreferences`.
 */
export default function NotificationSettingsScreen() {
  const registration = usePushRegistrationState();
  const preferences = useNotificationPreferences();

  let body: React.ReactNode;
  if (preferences.phase === 'loading') {
    body = <SkeletonCard rows={5} />;
  } else if (preferences.phase === 'error') {
    body = <ErrorState message={preferences.error ?? undefined} onRetry={preferences.reload} />;
  } else {
    body = (
      <>
        {preferences.readOnly ? (
          <InfoNote tone="warn">
            Thông báo đang chạy dữ liệu giả: công tắc chỉ để xem, chưa lưu lên máy chủ.
          </InfoNote>
        ) : null}
        {preferences.saveError ? <InfoNote tone="warn">{preferences.saveError}</InfoNote> : null}
        <Card flush>
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
        </Card>
        <Text style={styles.footnote}>
          Thông báo trong ứng dụng luôn được lưu ở mục Thông báo, kể cả khi bạn tắt thông báo đẩy của một nhóm.
        </Text>
      </>
    );
  }

  return (
    <Screen onRefresh={preferences.reload} refreshing={preferences.refreshing}>
      <PHeader title="Cài đặt thông báo" back />
      <View style={styles.stack}>
        <PushStatusCard
          state={registration}
          onEnable={() => void registerForPush('always')}
          onOpenSystemSettings={() => void Linking.openSettings()}
        />
        <InfoNote>
          Thông báo đẩy trên màn hình khóa chỉ báo có cập nhật mới, không hiện số tiền hay mã khoản vay. Mở FINORA để
          xem đầy đủ.
        </InfoNote>
        <View>
          <SectionLabel>NHẬN THÔNG BÁO ĐẨY THEO NHÓM</SectionLabel>
          <View style={styles.stack}>{body}</View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.lg },
  footnote: { ...Text_.micro, color: Colors.ink3 },
});
