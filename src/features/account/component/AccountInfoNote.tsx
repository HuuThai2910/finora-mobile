import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { KycStatus } from '@/types/auth';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, LineHeight, Radius, Spacing, lh } from '@/theme';
import { Icon } from '@/components/ui';

type Props = {
  status: KycStatus;
  /** Có khi người dùng còn phải định danh — cùng điều kiện với nhãn định danh bấm được. */
  onStartEkyc?: () => void;
};

type NoteCopy = { text: string; action?: string };

/**
 * Lời ghi chú đổi theo trạng thái định danh: chỉ khi đã định danh mới được nói
 * thông tin "lấy từ hồ sơ eKYC"; chưa định danh thì nói thẳng là chưa có và mời
 * đi định danh. Hai trạng thái chờ duyệt / bị từ chối backend chưa trả (xem
 * `KycStatus`) nên chỉ nêu đúng trạng thái, không hứa thêm quy trình duyệt.
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
  PENDING_REVIEW: { text: 'Hồ sơ định danh (eKYC) của bạn đang chờ duyệt.' },
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
            accessibilityHint="Mở màn chụp căn cước công dân để định danh"
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
