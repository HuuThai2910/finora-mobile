import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { UserProfile } from '@/types/auth';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, LineHeight, Spacing, lh } from '@/theme';
import { Icon, Tag } from '@/components/ui';
import { PROFILE_MASCOT } from '../constant';
import KycBadge from './KycBadge';

type Props = {
  profile: UserProfile;
  /** Bề rộng cột nội dung — mascot co lại trên máy hẹp để tên còn chỗ. */
  width: number;
  onOpenInfo: () => void;
  onStartEkyc: () => void;
};

/**
 * Mascot rộng ~26,5% cột (104pt trên máy 393pt): gần cỡ mockup mà tên bốn chữ
 * như "NGUYỄN HUỲNH NGỌC HẢI" vẫn vừa một dòng, không chạm tia sáng bên trái
 * mascot. Dưới 96pt thì mất chi tiết; tên dài hơn thì xuống dòng.
 */
const mascotWidth = (column: number) => Math.min(114, Math.max(96, Math.round(column * 0.265)));

/**
 * Đầu màn Hồ sơ, nằm thẳng trên nền sóng (không có thẻ): ảnh đại diện chữ, tên,
 * nhãn định danh, lối vào thông tin cá nhân và mascot bên phải.
 *
 * Không có nút đổi ảnh đại diện như mockup vì app chưa có chức năng đó.
 */
export default function ProfileHeader({ profile, width, onOpenInfo, onStartEkyc }: Props) {
  const name = profile.fullName?.trim();
  const verified = profile.kycStatus === 'KYC_VERIFIED';
  const mascot = mascotWidth(width);

  return (
    <View style={styles.row}>
      <View style={styles.identity}>
        <View style={styles.avatar} aria-hidden>
          <Text style={styles.initial} maxFontSizeMultiplier={1}>
            {profile.initial}
          </Text>
        </View>

        <View style={styles.text}>
          {/* Chưa quét eKYC thì hồ sơ chưa có tên: hiện email (giữ chữ thường)
              để người dùng biết đang ở tài khoản nào. */}
          <Text
            style={[styles.name, name ? styles.upper : null]}
            accessibilityRole="header"
            // Email không có chỗ ngắt tự nhiên nên xuống dòng sẽ cắt giữa chữ; giữ
            // một dòng và rút gọn ở giữa để vẫn thấy phần đầu và tên miền.
            numberOfLines={name ? undefined : 1}
            ellipsizeMode="middle"
          >
            {name || profile.email}
          </Text>

          <View style={styles.badges}>
            <KycBadge status={profile.kycStatus} onPress={verified ? undefined : onStartEkyc} />
            {/* Điểm tín dụng chưa có trong `GET /users/me`; ẩn hẳn thay vì hiện số rỗng. */}
            {profile.creditGrade && profile.creditScore !== null ? (
              <Tag tone="blue" small>{`Điểm ${profile.creditGrade}+ · ${profile.creditScore}`}</Tag>
            ) : null}
          </View>

          <Pressable
            onPress={onOpenInfo}
            // Dòng chữ chỉ cao 18pt; nới vùng chạm theo chiều dọc cho đủ 44pt.
            hitSlop={{ top: 13, bottom: 13 }}
            accessibilityRole="button"
            accessibilityLabel="Xem thông tin cá nhân"
            style={({ pressed }) => [styles.link, pressed && styles.pressed]}
          >
            <Text style={styles.linkText}>Xem thông tin cá nhân</Text>
            <Icon name="chevronRight" size={13} color={Colors.authMuted} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      <Image
        source={PROFILE_MASCOT.source}
        style={[styles.mascot, { width: mascot, height: mascot / PROFILE_MASCOT.aspectRatio }]}
        aria-hidden
      />
    </View>
  );
}

const AVATAR = 56;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  identity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: Colors.authPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontFamily: FontFamily.bold, fontSize: 22, lineHeight: 28, color: Colors.onDark },
  text: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.micro,
    // Chữ hoa có dấu chồng (Ễ, Ỳ, Ả...) cần dòng cao hơn để Android không cắt ngọn dấu.
    lineHeight: lh(FontSize.micro, LineHeight.heading),
    color: Colors.authInk,
  },
  upper: { textTransform: 'uppercase' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: 5 },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xxs,
    marginTop: Spacing.sm,
  },
  pressed: { opacity: 0.6 },
  linkText: { fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 18, color: Colors.authMuted },
  // Lấn vào lề phải như mockup (tai robot cách mép màn ~4pt) để nhường chỗ cho
  // tên; mép trái chừa một khe để chữ không dính vào tia sáng của mascot.
  mascot: { marginLeft: Spacing.sm, marginRight: -Spacing.lg },
});
