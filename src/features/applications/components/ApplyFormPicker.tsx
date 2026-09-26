import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, MIN_TOUCH, Radius, SoftShadow, Spacing, lh } from '@/theme';
import { Icon } from '@/components/ui';
import { APPLY_FORM_SHEET_MAX_WIDTH } from '../constant';

export type ApplyFormOption = { value: string; label: string };

type Props = {
  visible: boolean;
  /** Tên trường đang chọn, vừa là tiêu đề bảng vừa là nhãn nhóm cho trình đọc màn hình. */
  title: string;
  options: readonly ApplyFormOption[];
  selected: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
};

const RADIO_SIZE = 22;
/** Bảng không cao quá phần này của màn, để luôn thấy lớp phủ phía trên mà chạm đóng. */
const SHEET_MAX_HEIGHT_RATIO = 0.75;

/**
 * Bảng chọn trượt từ đáy cho các trường liệt kê (mục đích vay, học vấn, nhà ở).
 * Mỗi lựa chọn là một nút radio; chọn xong thì đóng ngay vì mỗi trường chỉ có
 * một giá trị. Đóng bằng chạm lớp phủ, nút X hoặc phím Back của Android.
 *
 * Danh sách là enum ngắn của backend (≤ 11 mục) nên dùng ScrollView, không cần
 * ảo hoá như FlatList.
 */
export default function ApplyFormPicker({ visible, title, options, selected, onSelect, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Đóng danh sách"
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            { maxHeight: height * SHEET_MAX_HEIGHT_RATIO, paddingBottom: insets.bottom + Spacing.lg },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.head}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Đóng"
              style={({ pressed }) => [styles.close, pressed && styles.pressed]}
            >
              <Icon name="x" size={IconSize.xs} color={Colors.authMuted} />
            </Pressable>
          </View>

          <ScrollView accessibilityRole="radiogroup" accessibilityLabel={title} bounces={false}>
            {options.map((option, index) => {
              const active = option.value === selected;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  accessibilityRole="radio"
                  // `selected` cho trình đọc màn hình của iOS/Android; `aria-checked` là
                  // trạng thái chuẩn của radio và là cách duy nhất react-native-web hiểu.
                  accessibilityState={{ selected: active }}
                  aria-checked={active}
                  accessibilityLabel={option.label}
                  style={({ pressed }) => [
                    styles.option,
                    index > 0 && styles.optionDivided,
                    active && styles.optionActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: Colors.applyFormScrim },
  // Trên web/máy tính bảng, bảng giữ bề rộng cột nội dung của các bước thay vì giãn hết cửa sổ.
  sheet: {
    width: '100%',
    maxWidth: APPLY_FORM_SHEET_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Colors.card,
    ...SoftShadow.raised,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.authBorder,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.sm },
  title: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.title,
    lineHeight: lh(FontSize.title, 1.4),
    color: Colors.authInk,
  },
  close: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginRight: -Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    minHeight: MIN_TOUCH + Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  optionDivided: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  optionActive: { backgroundColor: Colors.authFocusBg },
  radio: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    borderRadius: RADIO_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.authMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.authPrimary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.authPrimary },
  optionText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body, 1.4),
    color: Colors.authInk,
  },
  optionTextActive: { fontFamily: FontFamily.semibold },
});
