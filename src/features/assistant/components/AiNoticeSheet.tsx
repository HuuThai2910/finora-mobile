import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';
import { AI_NOTICE_POINTS, CHAT_MAX_WIDTH } from '../constants';

type Props = {
  visible: boolean;
  /** Đã đọc: lưu cờ, mở ô nhập. */
  onAccept: () => void;
  /** Chưa muốn dùng: đóng màn trợ lý, không gửi gì. */
  onDecline: () => void;
};

/** Bảng không cao quá phần này của màn, phần dài (chữ phóng to) cuộn bên trong. */
const SHEET_MAX_HEIGHT_RATIO = 0.86;

/**
 * Thông báo lần đầu mở trợ lý: đang trò chuyện với AI, dữ liệu đã lược định danh đi tới nhà cung cấp
 * nào ở nước ngoài, không nhập CCCD/PIN/OTP (spec "Ai tham gia", `LAW-DATA-2025`). Chạm lớp phủ không
 * đóng bảng: người dùng phải chọn "Tôi đã hiểu" hoặc "Để sau" (Back của Android cũng là "Để sau").
 */
export default function AiNoticeSheet({ visible, onAccept, onDecline }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDecline} statusBarTranslucent>
      <View style={styles.root}>
        <View style={styles.scrim} />
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { maxHeight: height * SHEET_MAX_HEIGHT_RATIO, paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <ScrollView bounces={false} contentContainerStyle={styles.content}>
            <View style={styles.badge}>
              <Icon name="robot" size={26} color={Colors.authPrimary} />
            </View>
            <Text style={styles.title} accessibilityRole="header">
              Bạn đang trò chuyện với trợ lý AI
            </Text>
            {AI_NOTICE_POINTS.map(point => (
              <View key={point} style={styles.point}>
                <View style={styles.dot} />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttons}>
            <Pressable
              onPress={onAccept}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
            >
              <Text style={[styles.buttonText, styles.primaryText]}>Tôi đã hiểu</Text>
            </Pressable>
            <Pressable
              onPress={onDecline}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
            >
              <Text style={styles.buttonText}>Để sau</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: Colors.applyFormScrim },
  sheet: {
    width: '100%',
    maxWidth: CHAT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xl,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Colors.card,
    ...SoftShadow.raised,
  },
  content: { gap: Spacing.md, paddingBottom: Spacing.lg },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: FontFamily.bold, fontSize: 18, lineHeight: 26, color: Colors.authInk },
  point: { flexDirection: 'row', gap: Spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 8, backgroundColor: Colors.authPrimary },
  pointText: { flex: 1, fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 21, color: Colors.authLabel },
  buttons: { gap: Spacing.sm, paddingTop: Spacing.sm },
  button: {
    minHeight: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  primary: { backgroundColor: Colors.authPrimary, borderColor: Colors.authPrimary },
  secondary: { backgroundColor: Colors.card, borderColor: Colors.authBorder },
  pressed: { opacity: 0.75 },
  buttonText: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.authInk },
  primaryText: { color: Colors.onDark },
});
