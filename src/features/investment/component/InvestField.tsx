import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing, tabularNums } from '@/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Đơn vị nằm trong ô, bên phải số: "%/năm", "tháng", "đ". */
  suffix?: string;
  keyboardType?: KeyboardTypeOptions;
  helper?: string;
  error?: string;
};

/**
 * Ô nhập số của form Auto-Invest: viền nhạt, đơn vị ngay trong ô, lỗi hiện bằng chữ dưới ô (không chỉ
 * bằng viền đỏ). Cùng dáng ô nhập của màn đặt lệnh trên chợ Notes.
 */
export default function InvestField({ label, value, onChangeText, suffix, keyboardType, helper, error }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.label} maxFontSizeMultiplier={1.4}>{label}</Text>
      <View style={[styles.box, error ? styles.boxError : null]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          accessibilityLabel={label}
          style={styles.input}
          maxFontSizeMultiplier={1.3}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.sm },
  label: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authLabel },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    backgroundColor: Colors.card,
  },
  boxError: { borderColor: Colors.red },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    fontFamily: FontFamily.semibold,
    fontSize: 17,
    color: Colors.authInk,
    ...tabularNums,
  },
  suffix: { marginLeft: Spacing.md, fontFamily: FontFamily.medium, fontSize: 14, color: Colors.authMuted },
  helper: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  error: { fontFamily: FontFamily.medium, fontSize: 12, lineHeight: 17, color: Colors.tagRedText },
});
