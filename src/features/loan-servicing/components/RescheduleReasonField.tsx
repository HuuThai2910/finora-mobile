import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, tabularNums } from '@/theme';
import { RESCHEDULE_REASON_MAX } from '../constants';
import { rescheduleFieldStyles as f } from './rescheduleFieldStyles';

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

/** Ô nhiều dòng tự cao theo nội dung tới mức này rồi cuộn bên trong. */
const MIN_HEIGHT = 96;
const MAX_HEIGHT = 168;

/**
 * Lý do đề nghị cơ cấu: người thẩm định đọc câu này để quyết định, nên gợi ý viết cả tình
 * hình lẫn phương án trả. Bộ đếm ký tự cạnh nhãn báo trước giới hạn 500 của Loan Service.
 */
export default function RescheduleReasonField({ value, onChange, error }: Props) {
  const [focused, setFocused] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const length = value.trim().length;

  return (
    <View style={f.section}>
      <View style={f.labelRow}>
        <Text style={f.label} maxFontSizeMultiplier={1.4}>
          Lý do đề nghị
          <Text style={f.required}> *</Text>
        </Text>
        <Text
          style={[f.aside, styles.counter, length > RESCHEDULE_REASON_MAX && styles.counterOver]}
          accessibilityLabel={`Đã nhập ${length} trên ${RESCHEDULE_REASON_MAX} ký tự`}
        >
          {`${length}/${RESCHEDULE_REASON_MAX}`}
        </Text>
      </View>

      <View style={[f.box, focused && f.boxFocused, !!error && f.boxInvalid]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline
          placeholder="Ví dụ: thu nhập tháng này giảm, tôi cần thêm 3 kỳ để trả đều hằng tháng."
          placeholderTextColor={Colors.authControl}
          onContentSizeChange={event => setContentHeight(event.nativeEvent.contentSize.height)}
          accessibilityLabel="Lý do đề nghị, bắt buộc"
          accessibilityHint={error}
          style={[
            f.input,
            styles.input,
            { height: Math.min(Math.max(contentHeight ?? MIN_HEIGHT, MIN_HEIGHT), MAX_HEIGHT) },
          ]}
        />
      </View>

      {error ? (
        <Text style={f.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : (
        <Text style={f.helper}>Nêu tình hình hiện tại và cách bạn sẽ trả nợ sau khi cơ cấu.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  counter: tabularNums,
  counterOver: { color: Colors.tagRedText },
  // Chữ thường cho dễ đọc khi viết dài. Không đặt lineHeight: giá trị cứng làm phần thấp
  // của "g", "y" bị cắt trên Android.
  input: { textAlignVertical: 'top', fontFamily: FontFamily.regular },
});
