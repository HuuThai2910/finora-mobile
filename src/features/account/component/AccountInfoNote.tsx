import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { KycStatus } from '@/types/auth';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, LineHeight, Radius, Spacing, lh } from '@/theme';
import { Icon } from '@/components/ui';

type Props = {
  status: KycStatus;
  /** Có khi nhãn định danh bấm được: còn phải định danh, hoặc đang chờ duyệt (mở màn chờ duyệt). */
  onStartEkyc?: () => void;
};

type NoteCopy = { text: string; action?: string; hint?: string };

const START_HINT = 'Bắt đầu định danh điện tử: đọc điều khoản, chụp hai mặt CCCD, kiểm tra thông tin';

/**
 * Lời ghi chú đổi theo trạng thái định danh: chỉ khi đã định danh mới được nói
 * thông tin "lấy từ hồ sơ eKYC"; chưa định danh thì nói thẳng là chưa có và mời
 * đi định danh. Chờ duyệt / bị từ chối đến từ `ekycStatus` của hồ sơ (duyệt tay
 * trên web admin) — chỉ nêu đúng trạng thái, không hứa thời hạn duyệt. Đang chờ duyệt
 * thì có lối mở màn chờ duyệt để rút lại hồ sơ.
 */
const NOTE: Record<KycStatus, NoteCopy> = {
  KYC_VERIFIED: {
    text:
      'Thông tin cá nhân được lấy từ hồ sơ định danh (eKYC). Nếu có sai sót, vui lòng thực hiện ' +
      'định danh lại hoặc liên hệ hỗ trợ.',
  },
  NOT_STARTED: {
    text: 'Bạn chưa định danh (eKYC). Thông tin cá nhân sẽ được lấy từ căn cước công dân sau khi bạn định danh.',
    action: 'Định danh ngay',
  },
  PENDING_REVIEW: {
    text: 'Hồ sơ định danh (eKYC) của bạn đang chờ duyệt.',
    action: 'Xem hoặc rút lại hồ sơ',
    hint: 'Mở màn hồ sơ đang chờ duyệt, nơi bạn có thể rút lại hồ sơ để gửi lại',
  },
  REJECTED: {
    text: 'Hồ sơ định danh (eKYC) chưa được duyệt. Vui lòng định danh lại hoặc liên hệ hỗ trợ.',
    action: 'Định danh lại',
  },
};

const TEXT_SIZE = FontSize.micro;

/** Hộp ghi chú nền xanh nhạt cuối màn: nguồn gốc của thông tin cá nhân. */
export default function AccountInfoNote({ status, onStartEkyc }: Props) {
  const copy = NOTE[status];

  return (
    <View style={styles.box}>
      <Icon name="info" size={22} color={Colors.authPrimary} strokeWidth={1.9} />
      <View style={styles.body}>
        <Text style={styles.text}>{copy.text}</Text>
        {copy.action && onStartEkyc ? (
          <Pressable
            onPress={onStartEkyc}
            // Dòng chữ chỉ cao ~20pt; nới vùng chạm theo chiều dọc cho đủ 44pt.
            hitSlop={{ top: 12, bottom: 12 }}
            accessibilityRole="button"
            accessibilityLabel={copy.action}
            accessibilityHint={copy.hint ?? START_HINT}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>{copy.action}</Text>
            <Icon name="chevronRight" size={14} color={Colors.authPrimary} strokeWidth={2.4} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    backgroundColor: Colors.authNoteBg,
  },
  body: { flex: 1, minWidth: 0 },
  // `authMuted` trên nền `authNoteBg` vẫn đạt ~4,8:1 (AA cho chữ thường).
  text: {
    fontFamily: FontFamily.regular,
    fontSize: TEXT_SIZE,
    lineHeight: lh(TEXT_SIZE, LineHeight.heading),
    color: Colors.authMuted,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xxs,
    marginTop: Spacing.sm,
  },
  pressed: { opacity: 0.6 },
  actionText: {
    fontFamily: FontFamily.semibold,
    fontSize: TEXT_SIZE,
    lineHeight: lh(TEXT_SIZE, LineHeight.heading),
    color: Colors.authPrimary,
  },
});
