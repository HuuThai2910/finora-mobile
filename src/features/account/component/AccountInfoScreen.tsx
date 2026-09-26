import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Gender } from '@/types/auth';
import type { IconName } from '@/constants/icons';
import { HOME_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';
import { WaveBackdrop } from '@/components/phone';
import { ErrorState } from '@/components/feedback';
import type { ProfileStackParamList } from '@/navigation/types';
import { formatLocalDate } from '@/utils/format';
import { GENDER_LABEL, PROFILE_MAX_WIDTH, ROLE_LABEL } from '../constant';
import { useMyProfile } from '../hook/useAccount';
import AccountInfoCard from './AccountInfoCard';
import AccountInfoHeader from './AccountInfoHeader';
import AccountInfoNote from './AccountInfoNote';
import AccountInfoRow from './AccountInfoRow';
import AccountInfoSkeleton from './AccountInfoSkeleton';
import KycBadge from './KycBadge';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'AccountInfo'>;

/** Giới tính "khác" hoặc chưa khai thì dùng hình người trung tính thay vì đoán ♂/♀. */
const GENDER_ICON: Record<Gender, IconName> = { MALE: 'mars', FEMALE: 'venus', OTHER: 'user' };

/**
 * Email không có dấu cách nên khi phải xuống dòng sẽ bị cắt giữa chữ
 * ("…@gmail.c" / "om"). Chèn điểm ngắt vô hình (U+200B) sau "@" để xuống dòng
 * ngay sau "@"; vừa một dòng thì không đổi gì. Trình đọc màn hình nhận email gốc.
 */
const wrappableEmail = (email: string) => email.replace('@', '@\u200B');

/**
 * Thông tin tài khoản — toàn bộ dữ liệu `GET /users/me` của người đang đăng nhập
 * (vẽ lại theo mockup 26/09/2026).
 *
 * Chỉ đọc: họ tên, ngày sinh, CCCD... đến từ eKYC nên không sửa tay được ở đây;
 * muốn thay đổi phải qua luồng định danh lại. Hiển thị đúng như backend trả cho
 * chính chủ (CCCD, số điện thoại không che), như màn cũ.
 */
export default function AccountInfoScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, PROFILE_MAX_WIDTH);
  const profile = useMyProfile();

  // Nội dung cao ít nhất bằng khung cuộn, để trên máy màn cao lớp sóng đáy vẫn sát đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);

  const p = profile.data;
  // Lần tải đầu đã có khung giả; vòng xoay kéo-làm-mới chỉ hiện khi tải lại.
  const refreshing = profile.loading && p !== null;

  let body: React.ReactNode;
  if (profile.error) {
    body = <ErrorState message={profile.error} onRetry={profile.reload} />;
  } else if (!p) {
    body = <AccountInfoSkeleton />;
  } else {
    const verified = p.kycStatus === 'KYC_VERIFIED';
    // Cùng quy tắc với màn Hồ sơ: chưa định danh thì nhãn trạng thái (và lời mời
    // trong ghi chú) mở thẳng luồng chụp CCCD.
    const startEkyc = verified ? undefined : () => nav.navigate('EkycCapture', { side: 'front' });

    body = (
      <View style={styles.sections}>
        <AccountInfoCard icon="user" title="Tài khoản">
          <AccountInfoRow
            icon="mail"
            label="Email"
            value={wrappableEmail(p.email)}
            spokenValue={p.email}
          />
          <AccountInfoRow icon="phone" label="Số điện thoại" value={p.phone} />
          <AccountInfoRow icon="briefcase" label="Vai trò" value={ROLE_LABEL[p.role]} />
          <AccountInfoRow
            // Khiên có dấu tích chỉ dùng khi đã định danh, để ô icon không nói ngược nhãn trạng thái.
            icon={verified ? 'shieldCheck' : 'shield'}
            label="Trạng thái định danh"
            value={<KycBadge status={p.kycStatus} onPress={startEkyc} />}
          />
        </AccountInfoCard>

        <AccountInfoCard icon="fileText" title="Thông tin cá nhân">
          {/* Giữ nguyên cách viết đã lưu (OCR CCCD trả chữ hoa), như màn cũ. */}
          <AccountInfoRow icon="user" label="Họ và tên" value={p.fullName} />
          <AccountInfoRow
            icon="calendar"
            label="Ngày sinh"
            value={p.dateOfBirth ? formatLocalDate(p.dateOfBirth) : null}
          />
          <AccountInfoRow
            icon={p.gender ? GENDER_ICON[p.gender] : 'user'}
            label="Giới tính"
            value={p.gender ? GENDER_LABEL[p.gender] : null}
          />
          <AccountInfoRow icon="id" label="Số CCCD" value={p.idNumber} />
          <AccountInfoRow icon="mapPin" label="Quê quán" value={p.placeOfOrigin} />
          <AccountInfoRow icon="home" label="Địa chỉ thường trú" value={p.address} />
        </AccountInfoCard>

        <AccountInfoNote status={p.kycStatus} onStartEkyc={startEkyc} />
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
          onRefresh={profile.reload}
          // iOS đọc `tintColor`, Android đọc `colors`.
          tintColor={Colors.authPrimary}
          colors={[Colors.authPrimary]}
        />
      }
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={HOME_WAVES} width={width} />

        <View style={[styles.content, { paddingTop: insets.top + Spacing.xs }]}>
          <AccountInfoHeader />
          <View style={styles.body}>{body}</View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Nền trùng hàng trên cùng của ảnh sóng: kéo làm mới lộ ra phía trên vẫn liền màu.
  root: { flex: 1, backgroundColor: Colors.homeWaveTop },
  scroll: { flexGrow: 1, alignItems: 'center' },
  // Cùng lề với màn Hồ sơ để thẻ không nhảy ngang khi chuyển qua lại; đáy chừa
  // một dải cho lớp sóng đáy lộ ra dưới ghi chú.
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.page },
  body: { marginTop: Spacing.lg },
  sections: { gap: Spacing.xl },
});
