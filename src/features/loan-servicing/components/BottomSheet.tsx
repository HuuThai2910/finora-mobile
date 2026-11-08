import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, PanResponder, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';
import { SERVICING_MAX_WIDTH } from '../constants';

type Props = {
  visible: boolean;
  /** Tên bảng cho trình đọc màn hình; bảng không in tiêu đề. */
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

/** Kéo tay nắm xuống quá chừng này (hoặc vuốt nhanh) thì đóng bảng; ngắn hơn thì bảng bật về. */
const DISMISS_DISTANCE = 80;
const DISMISS_VELOCITY = 0.8;
/** Animated chạy bằng native driver trên iOS/Android; web không có module này. */
const NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * Khung bảng trượt lên từ đáy màn của các màn khoản vay: chỉ có tay nắm xám, không tiêu đề, không
 * nút X. Kéo tay nắm xuống hoặc chạm lớp phủ để đóng.
 */
export default function BottomSheet({ visible, title, onClose, children }: Props) {
  const insets = useSafeAreaInsets();
  const [sheetHeight, setSheetHeight] = useState(0);
  const dragY = useRef(new Animated.Value(0)).current;
  // PanResponder tạo một lần nên đọc onClose và chiều cao bảng mới nhất qua ref.
  const latest = useRef({ onClose, sheetHeight });
  latest.current = { onClose, sheetHeight };

  // Mở lại sau khi lần trước đóng bằng cách kéo xuống: đặt bảng về vị trí cũ.
  useEffect(() => {
    if (visible) dragY.setValue(0);
  }, [visible, dragY]);

  const drag = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 4,
      // Đang kéo bảng thì không nhường cử chỉ: trên web, kéo chuột làm trình duyệt bôi chọn chữ
      // và phát `selectionchange`, mặc định cử chỉ sẽ bị huỷ giữa chừng.
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, gesture) => dragY.setValue(Math.max(0, gesture.dy)),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY) {
          Animated.timing(dragY, {
            toValue: latest.current.sheetHeight || 600,
            duration: 180,
            useNativeDriver: NATIVE_DRIVER,
          }).start(() => latest.current.onClose());
        } else {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: NATIVE_DRIVER }).start();
        }
      },
      onPanResponderTerminate: () => Animated.spring(dragY, { toValue: 0, useNativeDriver: NATIVE_DRIVER }).start(),
    }),
  ).current;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel={`Đóng ${title.toLowerCase()}`} />
        <Animated.View
          accessibilityViewIsModal
          accessibilityLabel={title}
          onAccessibilityEscape={onClose}
          onLayout={event => setSheetHeight(event.nativeEvent.layout.height)}
          style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.lg, transform: [{ translateY: dragY }] }]}
        >
          {/* Vùng kéo cao 32pt quanh tay nắm; tách khỏi nội dung để kéo bảng không lẫn với cuộn/bấm. */}
          <View style={styles.grip} {...drag.panHandlers}>
            <View style={styles.handle} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: Colors.applyFormScrim },
  // Trên web/máy tính bảng, bảng giữ bề rộng cột nội dung thay vì giãn hết cửa sổ.
  sheet: {
    width: '100%',
    maxWidth: SERVICING_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Spacing.xxl,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Colors.card,
    ...SoftShadow.raised,
  },
  grip: { height: 32, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 36, height: 4, borderRadius: Radius.pill, backgroundColor: Colors.authBorder },
});
