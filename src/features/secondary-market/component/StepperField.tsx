import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, Spacing, tabularNums } from '@/theme';

type Props = {
  label: string;
  /** Chuỗi đang hiện trong ô — giữ dạng chuỗi để người dùng gõ dở "97," không bị xoá. */
  text: string;
  onChangeText: (text: string) => void;
  onStep: (direction: 1 | -1) => void;
  keyboard: 'decimal-pad' | 'number-pad';
  hint?: string;
  error?: string | null;
  /** Đơn vị đứng ngay sau con số, như "%". */
  suffix?: string;
  /** Nút ⓘ cạnh nhãn: giải thích ô này nghĩa là gì. */
  onInfo?: () => void;
  /** Hàng nút chọn nhanh chia đều bề ngang dưới ô; nút trùng giá trị đang nhập được tô xanh. */
  quick?: ReadonlyArray<{ label: string; onPress: () => void; selected?: boolean }>;
};

/** Ô số căn giữa cùng đơn vị: rộng theo số ký tự để đơn vị đứng sát con số (input web mặc định rộng ~20 ký tự). */
const INPUT_FONT = 26;
/** Hàng chọn nhanh luôn chia 5 ô bằng nhau, dù có ít nút hơn. */
const QUICK_SLOTS = 5;
const inputWidth = (text: string) => Math.max(2, text.length) * INPUT_FONT * 0.62 + 6;

/**
 * Ô số có nút trừ/cộng hai bên — giá đi theo bước 0,1%, số Note đi theo bước 1, gõ tay vẫn được.
 * Lỗi hiện ngay dưới ô bằng chữ, không chỉ bằng viền đỏ.
 */
export default function StepperField({ label, text, onChangeText, onStep, keyboard, hint, error, suffix, onInfo, quick }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Text style={styles.label} maxFontSizeMultiplier={1.4}>{label}</Text>
        {onInfo ? (
          <Pressable onPress={onInfo} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Giải thích ${label.toLowerCase()}`}>
            <Icon name="info" size={18} color={Colors.authMuted} />
          </Pressable>
        ) : null}
      </View>
      <View style={[styles.row, error ? styles.rowError : null]}>
        <StepButton icon="minus" label={`Giảm ${label.toLowerCase()}`} onPress={() => onStep(-1)} />
        <View style={styles.value}>
          <TextInput
            value={text}
            onChangeText={onChangeText}
            keyboardType={keyboard}
            accessibilityLabel={label}
            style={[styles.input, suffix ? { width: inputWidth(text) } : styles.inputFill]}
            maxFontSizeMultiplier={1.3}
            selectTextOnFocus
          />
          {suffix ? <Text style={styles.suffix} maxFontSizeMultiplier={1.3}>{suffix}</Text> : null}
        </View>
        <StepButton icon="plus" label={`Tăng ${label.toLowerCase()}`} onPress={() => onStep(1)} />
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
      {quick?.length ? (
        <View style={styles.quick}>
          {quick.map(q => (
            <Pressable
              key={q.label}
              onPress={q.onPress}
              accessibilityRole="button"
              accessibilityLabel={q.label}
              accessibilityState={{ selected: !!q.selected }}
              style={({ pressed }) => [styles.chip, q.selected && styles.chipSelected, pressed && styles.pressed]}
            >
              <Text style={[styles.chipText, q.selected && styles.chipTextSelected]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                {q.label}
              </Text>
            </Pressable>
          ))}
          {/* Giữ đủ ô để 2–3 nút không bị kéo dài hết hàng. */}
          {Array.from({ length: Math.max(0, QUICK_SLOTS - quick.length) }, (_, i) => (
            <View key={`slot${i}`} style={styles.slot} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function StepButton({ icon, label, onPress }: { icon: 'minus' | 'plus'; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.step, pressed && styles.pressed]}
    >
      <Icon name={icon} size={20} color={Colors.authPrimary} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.sm },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 21, color: Colors.authInk },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    backgroundColor: Colors.card,
  },
  rowError: { borderColor: Colors.bookAsk },
  step: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: Radius.sm,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  // Con số và đơn vị là một cụm căn giữa khoảng trống giữa hai nút.
  value: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 4 },
  input: {
    minWidth: 0,
    paddingVertical: 4,
    paddingHorizontal: 0,
    textAlign: 'center',
    fontFamily: FontFamily.extrabold,
    fontSize: INPUT_FONT,
    color: Colors.authInk,
    ...tabularNums,
  },
  inputFill: { flex: 1 },
  suffix: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.authMuted },
  hint: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  error: { fontFamily: FontFamily.medium, fontSize: 12, lineHeight: 17, color: Colors.tagRedText },
  quick: { flexDirection: 'row', gap: Spacing.sm, marginTop: 2 },
  // Nút chia đều bề ngang, cao 40pt; cả hàng tối đa 5 nút nên vẫn đủ chỗ cho "100,0%" ở máy 360pt.
  chip: {
    flex: 1,
    minWidth: 0,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    backgroundColor: Colors.card,
  },
  slot: { flex: 1 },
  chipSelected: { borderColor: Colors.authPrimary, backgroundColor: Colors.tintBlue },
  chipText: { fontFamily: FontFamily.medium, fontSize: 14, lineHeight: 20, color: Colors.authInk, ...tabularNums },
  chipTextSelected: { fontFamily: FontFamily.semibold, color: Colors.authPrimary },
});
