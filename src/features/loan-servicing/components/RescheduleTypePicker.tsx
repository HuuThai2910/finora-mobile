import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';
import { RESCHEDULE_TYPE_LABEL } from '../mappers/servicing';
import type { RescheduleType } from '../types';

const OPTIONS: readonly { value: RescheduleType; hint: string }[] = [
  { value: 'TERM_EXTENSION', hint: 'Thêm kỳ trả để kéo dài thời hạn khoản vay.' },
  { value: 'INSTALLMENT_ADJUSTMENT', hint: 'Dời ngày đến hạn của kỳ bạn chọn sang ngày khác.' },
];

const RADIO = 20;

type Props = { value: RescheduleType; onChange: (value: RescheduleType) => void };

/**
 * Hai hình thức cơ cấu Loan Service nhận, xếp thành hai dòng chọn một như nhóm nút radio.
 * Dòng đang chọn có viền xanh, nền xanh nhạt và chấm tròn đặc (không chỉ đổi màu chữ),
 * cùng kiểu ô chọn nhanh ở màn nạp tiền.
 */
export default function RescheduleTypePicker({ value, onChange }: Props) {
  return (
    <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel="Hình thức đề nghị">
      {OPTIONS.map(option => {
        const selected = option.value === value;
        const label = RESCHEDULE_TYPE_LABEL[option.value];
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            aria-checked={selected}
            accessibilityLabel={`${label}. ${option.hint}`}
            style={({ pressed }) => [styles.option, selected && styles.selected, pressed && !selected && styles.pressed]}
          >
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <View style={styles.dot} /> : null}
            </View>
            <View style={styles.text}>
              <Text style={[styles.label, selected && styles.labelSelected]} maxFontSizeMultiplier={1.4}>
                {label}
              </Text>
              <Text style={styles.hint} maxFontSizeMultiplier={1.4}>
                {option.hint}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    backgroundColor: Colors.card,
  },
  selected: { borderColor: Colors.authPrimary, backgroundColor: Colors.tintBlue },
  pressed: { opacity: 0.7 },
  // Viền `authMuted` để ô tròn đạt tương phản 3:1 trên nền trắng và nền xanh nhạt.
  radio: {
    width: RADIO,
    height: RADIO,
    marginTop: 1,
    borderRadius: RADIO / 2,
    borderWidth: 1.5,
    borderColor: Colors.authMuted,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.authPrimary },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.authPrimary },
  text: { flex: 1, minWidth: 0, gap: 2 },
  label: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.authInk },
  labelSelected: { color: Colors.authPrimary },
  hint: { fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 18, color: Colors.authMuted },
});
