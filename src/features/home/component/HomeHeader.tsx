import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH } from '@/theme';
import { BrandLogo, Icon } from '@/components/ui';
import { APP_NAME } from '@/features/auth';

type Props = {
  /** Số thông báo chưa đọc; 0 thì không vẽ chấm đỏ. */
  unread: number;
  onOpenNotifications: () => void;
};

/** Đầu trang chủ: logo và tên app bên trái, chuông thông báo bên phải. */
export default function HomeHeader({ unread, onOpenNotifications }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.brand} accessible accessibilityRole="header" accessibilityLabel={APP_NAME}>
        <BrandLogo size={36} />
        <Text style={styles.name} maxFontSizeMultiplier={1.2}>
          {APP_NAME}
        </Text>
      </View>

      <Pressable
        onPress={onOpenNotifications}
        accessibilityRole="button"
        accessibilityLabel={unread > 0 ? `Thông báo, ${unread} tin mới` : 'Thông báo'}
        style={({ pressed }) => [styles.bell, pressed && styles.pressed]}
      >
        <Icon name="bell" size={24} color={Colors.bellMuted} strokeWidth={1.8} />
        {unread > 0 ? (
          <View style={styles.badge}>
            {/* Chấm đỏ chỉ rộng hai chữ số; nhiều hơn thì ghi 9+ thay vì phình ra che chuông. */}
            <Text style={styles.badgeText} maxFontSizeMultiplier={1}>
              {unread > 9 ? '9+' : unread}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MIN_TOUCH,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  name: {
    fontFamily: FontFamily.extrabold,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.authInk,
  },
  // Mép phải của chuông thẳng với mép phải các thẻ bên dưới; vùng chạm vẫn đủ 44pt.
  bell: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginRight: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    lineHeight: 12,
    color: Colors.onDark,
  },
});
