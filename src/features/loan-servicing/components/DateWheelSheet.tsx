import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, PanResponder, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { DetailButton } from '@/features/applications';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';
import { formatLocalDate } from '@/utils/format';
import { SERVICING_MAX_WIDTH } from '../constants';
import { clampDay, daysInMonth, fromDateParts, toDateParts, type DateParts } from '../mappers/date';
import { isLocalDate } from '../mappers/servicing';
import WheelColumn, { type WheelItem } from './WheelColumn';

type Props = {
  visible: boolean;
  /** Tên bảng cho trình đọc màn hình; bảng không in tiêu đề. */
  title: string;
  /** Ngày đang có ở ô (`yyyy-MM-dd`); trống thì bảng mở ở `minDate`. */
  value: string;
  /** Ngày sớm nhất được chọn; cuộn tới ngày sớm hơn thì nút xác nhận khoá và có câu nhắc. */
  minDate: string;
  /** Số năm cho cột năm, tính từ năm của `minDate`. */
  years?: number;
  onConfirm: (value: string) => void;
  onClose: () => void;
};

const MONTHS: readonly WheelItem[] = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: `Tháng ${index + 1}`,
}));

const pad2 = (value: number) => String(value).padStart(2, '0');

/** Kéo tay nắm xuống quá chừng này (hoặc vuốt nhanh) thì đóng bảng; ngắn hơn thì bảng bật về. */
const DISMISS_DISTANCE = 80;
const DISMISS_VELOCITY = 0.8;
/** Animated chạy bằng native driver trên iOS/Android; web không có module này. */
const NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * Bảng chọn ngày trượt lên từ đáy màn: chỉ có tay nắm, ba cột bánh xe ngày | tháng | năm
 * (hàng giữa nằm giữa hai vạch là ngày đang chọn) và nút xác nhận. Kéo tay nắm xuống hoặc
 * chạm lớp phủ để đóng; đóng thì giữ nguyên ngày cũ, chỉ "Chọn ngày này" mới ghi vào ô.
 */
export default function DateWheelSheet({ visible, title, value, minDate, years = 10, onConfirm, onClose }: Props) {
  const insets = useSafeAreaInsets();
  // Ô trống, hoặc ngày trong ô đã sớm hơn mốc cho phép (vd. vừa dời ngày bắt đầu ra sau): mở ở mốc.
  const start = isLocalDate(value) && value >= minDate ? value : minDate;
  const [parts, setParts] = useState<DateParts>(() => toDateParts(start));
  const [sheetHeight, setSheetHeight] = useState(0);
  const dragY = useRef(new Animated.Value(0)).current;
  // PanResponder tạo một lần nên đọc onClose và chiều cao bảng mới nhất qua ref.
  const latest = useRef({ onClose, sheetHeight });
  latest.current = { onClose, sheetHeight };

  // Mỗi lần mở bảng bắt đầu từ ngày đang có ở ô (bỏ phần đã cuộn mà chưa xác nhận) và đặt
  // bảng về vị trí cũ nếu lần trước đóng bằng cách kéo xuống.
  useEffect(() => {
    if (!visible) return;
    setParts(toDateParts(start));
    dragY.setValue(0);
  }, [visible, start, dragY]);

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

  const firstYear = toDateParts(minDate).year;
  const yearItems: WheelItem[] = Array.from({ length: years + 1 }, (_, index) => ({
    value: firstYear + index,
    label: String(firstYear + index),
  }));
  const dayItems: WheelItem[] = Array.from({ length: daysInMonth(parts.year, parts.month) }, (_, index) => ({
    value: index + 1,
    label: pad2(index + 1),
  }));

  const picked = fromDateParts(parts);
  const tooEarly = picked < minDate;
  const update = (patch: Partial<DateParts>) => setParts(current => clampDay({ ...current, ...patch }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel="Đóng bảng chọn ngày" />
        <Animated.View
          accessibilityViewIsModal
          accessibilityLabel={title}
          onAccessibilityEscape={onClose}
          onLayout={event => setSheetHeight(event.nativeEvent.layout.height)}
          style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.lg, transform: [{ translateY: dragY }] }]}
        >
          {/* Vùng kéo cao 32pt quanh tay nắm; tách khỏi các cột để kéo bảng không lẫn với cuộn cột. */}
          <View style={styles.grip} {...drag.panHandlers}>
            <View style={styles.handle} />
          </View>

          <View style={styles.wheel}>
            <WheelColumn label="Ngày" items={dayItems} value={parts.day} onChange={day => update({ day })} />
            <WheelColumn label="Tháng" items={MONTHS} value={parts.month} onChange={month => update({ month })} />
            <WheelColumn label="Năm" items={yearItems} value={parts.year} onChange={year => update({ year })} />
          </View>

          {tooEarly ? (
            <Text style={styles.warn} accessibilityLiveRegion="polite">
              {`Chọn từ ngày ${formatLocalDate(minDate)} trở đi.`}
            </Text>
          ) : null}

          <View style={styles.action}>
            <DetailButton label="Chọn ngày" onPress={() => onConfirm(picked)} disabled={tooEarly} />
          </View>
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
  wheel: { flexDirection: 'row', gap: Spacing.md },
  warn: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontFamily: FontFamily.medium,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.tagRedText,
  },
  action: { marginTop: Spacing.lg },
});
