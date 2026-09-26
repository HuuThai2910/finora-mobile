import { useId, useState } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, MIN_TOUCH, Spacing, tabularNums } from '@/theme';

type Props = {
  amount: number;
  onChange: (value: number) => void;
  onFocusChange: (focused: boolean) => void;
};

/** Cỡ chữ số tiền ở màn 393pt; số dài (hàng tỷ) tự thu nhỏ cho vừa khung. */
const BASE_SIZE = FontSize.display;
/** Số tiền là con số chính của màn: phóng theo cỡ chữ hệ thống nhưng dừng ở mức này để còn vừa khung. */
const MAX_FONT_SCALE = 1.2;
/** Chỗ cho chữ "đ" và khoảng trống trước nó, tính theo tỉ lệ cỡ chữ. */
const UNIT_ALLOWANCE = 0.9;
/** Dôi thêm cho con trỏ nhập ở cuối số. */
const CARET_ROOM = 2;
/**
 * Bản sao để đo được vẽ ở nửa cỡ rồi nhân đôi: bản sao nằm trong khung nên bị
 * giới hạn bề rộng, đo ở cỡ gốc thì số rất dài bị cắt và đo thiếu.
 */
const MEASURE_RATIO = 0.5;
/** 15 chữ số (đã có dấu chấm): quá mức này số không còn chính xác trong kiểu number của JS. */
const MAX_LENGTH = 19;
/** Số dài phải thu nhỏ thì chừa khoảng này hai bên, để chữ "đ" không dính vào nút "+". */
const FIT_MARGIN = Spacing.md;

const formatDigits = (value: number): string => (value > 0 ? new Intl.NumberFormat('vi-VN').format(value) : '');
const digitsOf = (text: string): number => Number(text.replace(/\D/g, ''));

/**
 * Ô gõ trực tiếp số tiền ở giữa bộ tăng/giảm, hiện "50.000.000 đ" liền một cụm
 * căn giữa như mockup.
 *
 * Ô nhập không tự co theo nội dung (trên web là thẻ `<input>` rộng cố định), nên
 * đo bề rộng chữ bằng một bản sao ẩn rồi đặt đúng bề rộng đó cho ô, để chữ "đ"
 * nằm sát sau con số. Số quá dài so với khung thì thu nhỏ cả cụm theo tỉ lệ.
 */
export default function LoanAmountInput({ amount, onChange, onFocusChange }: Props) {
  const [areaWidth, setAreaWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const formatted = formatDigits(amount);

  // Bàn phím số của iOS không có phím Return; kèm thanh "Xong" như `Field` dùng chung.
  // `useId` có ký tự «» và :, lọc bỏ để `nativeID` chỉ còn ký tự an toàn.
  const accessoryId = `loan-amount-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const withAccessory = Platform.OS === 'ios';

  const needed = textWidth / MEASURE_RATIO + BASE_SIZE * UNIT_ALLOWANCE;
  const room = areaWidth - FIT_MARGIN;
  const scale = areaWidth > 0 && needed > room ? room / needed : 1;
  const sized = { fontSize: BASE_SIZE * scale, lineHeight: Math.round(BASE_SIZE * scale * 1.3) };

  return (
    <View style={styles.area} onLayout={event => setAreaWidth(event.nativeEvent.layout.width)}>
      {/* Bản sao ẩn ở nửa cỡ, chỉ để đo bề rộng chữ số. */}
      <Text
        style={[styles.digits, styles.measure]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        numberOfLines={1}
        onLayout={event => setTextWidth(event.nativeEvent.layout.width)}
        aria-hidden
      >
        {formatted || '0'}
      </Text>

      <View style={styles.row}>
        <TextInput
          value={formatted}
          onChangeText={text => onChange(digitsOf(text))}
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
          placeholder="0"
          placeholderTextColor={Colors.authControl}
          keyboardType="number-pad"
          inputAccessoryViewID={withAccessory ? accessoryId : undefined}
          accessibilityLabel="Số tiền muốn vay, đơn vị đồng"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          maxLength={MAX_LENGTH}
          style={[
            styles.digits,
            styles.input,
            sized,
            { width: Math.ceil((textWidth / MEASURE_RATIO) * scale) + CARET_ROOM },
          ]}
        />
        {/* Đơn vị đã nằm trong nhãn đọc của ô nhập. */}
        <Text style={[styles.digits, sized]} maxFontSizeMultiplier={MAX_FONT_SCALE} aria-hidden>
          đ
        </Text>
      </View>

      {withAccessory ? (
        <InputAccessoryView nativeID={accessoryId}>
          <View style={styles.accessory}>
            <Pressable
              onPress={Keyboard.dismiss}
              accessibilityRole="button"
              accessibilityLabel="Đóng bàn phím"
              style={({ pressed }) => [styles.accessoryButton, pressed && styles.pressed]}
            >
              <Text style={styles.accessoryText}>Xong</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  area: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  digits: {
    fontFamily: FontFamily.extrabold,
    fontSize: BASE_SIZE,
    color: Colors.authInk,
    ...tabularNums,
  },
  // Nằm ngoài dòng chảy bố cục và trong suốt: chỉ để đo, không chiếm chỗ.
  measure: { position: 'absolute', opacity: 0, left: 0, top: 0, fontSize: BASE_SIZE * MEASURE_RATIO },
  input: {
    minHeight: MIN_TOUCH,
    padding: 0,
    textAlign: 'center',
    // Khung ngoài đã đổi viền xanh khi đang gõ; bỏ viền focus mặc định của trình duyệt.
    outlineStyle: 'solid',
    outlineWidth: 0,
  },
  accessory: {
    alignItems: 'flex-end',
    backgroundColor: Colors.authFocusBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.authBorder,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xs,
  },
  accessoryButton: { minHeight: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  pressed: { opacity: 0.6 },
  accessoryText: { fontFamily: FontFamily.semibold, fontSize: FontSize.body, color: Colors.authPrimary },
});
