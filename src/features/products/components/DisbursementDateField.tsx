import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, MIN_TOUCH, Radius, Spacing } from '@/theme';
import { Icon } from '@/components/ui';
import { loanFieldStyles } from './loanFieldStyles';

type Props = {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
};

const HELPER = 'Ngày này được dùng để tính lịch trả dự kiến ở bước tiếp theo.';

/**
 * Ngày giải ngân dự kiến. Giữ cách nhập của màn cũ: gõ tay theo dạng YYYY-MM-DD
 * (đúng dạng backend nhận ở bước 2), chưa có bộ chọn lịch nên biểu tượng lịch
 * chỉ để nhận diện và không chặn chạm vào ô. Lỗi thay chỗ dòng gợi ý.
 */
export default function DisbursementDateField({ value, error, onChange }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={loanFieldStyles.section}>
      <Text style={loanFieldStyles.label}>
        Ngày giải ngân dự kiến
        <Text style={loanFieldStyles.required}> *</Text>
      </Text>

      <View style={[styles.box, focused && styles.boxFocused, !!error && styles.boxInvalid]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.authControl}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="done"
          accessibilityLabel="Ngày giải ngân dự kiến, bắt buộc, dạng năm-tháng-ngày"
          accessibilityHint={HELPER}
          style={styles.input}
        />
        <View style={styles.icon}>
          <Icon name="calendar" size={IconSize.xs} color={Colors.authMuted} />
        </View>
      </View>

      {error ? (
        <Text style={loanFieldStyles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : (
        <Text style={loanFieldStyles.helper}>{HELPER}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.authBorder,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
  },
  boxFocused: { borderColor: Colors.authPrimary },
  boxInvalid: { borderColor: Colors.red },
  input: {
    minHeight: MIN_TOUCH + Spacing.xs,
    paddingLeft: Spacing.xl,
    // Chừa chỗ cho biểu tượng lịch để chữ dài không chui xuống dưới nó.
    paddingRight: Spacing.xl + IconSize.xs + Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: FontFamily.semibold,
    // ≥16 để Safari trên điện thoại không tự phóng to trang khi chạm vào ô.
    fontSize: FontSize.body,
    color: Colors.authInk,
    outlineStyle: 'solid',
    outlineWidth: 0,
  },
  // Không nhận chạm: bấm vào biểu tượng vẫn là bấm vào ô nhập bên dưới.
  icon: { position: 'absolute', right: Spacing.xl, pointerEvents: 'none' },
});
