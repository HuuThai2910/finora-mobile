import { useId } from 'react';
import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, Spacing, tabularNums } from '@/theme';
import { RESCHEDULE_EXTRA_TERMS_MAX, RESCHEDULE_EXTRA_TERMS_MIN } from '../constants';
import { rescheduleFieldStyles as f } from './rescheduleFieldStyles';

type Props = {
  value: number;
  onChange: (value: number) => void;
  error?: string;
};

const clamp = (value: number) => Math.min(Math.max(value, RESCHEDULE_EXTRA_TERMS_MIN), RESCHEDULE_EXTRA_TERMS_MAX);

/** Ô số rộng theo số chữ số để chữ "kỳ" đứng sát con số (ô nhập web mặc định rộng ~20 ký tự). */
const INPUT_FONT = 24;
const inputWidth = (text: string) => Math.max(2, text.length) * INPUT_FONT * 0.62 + 6;

/**
 * Số kỳ muốn gia hạn: nút trừ/cộng hai bên như ô số Note ở sổ lệnh, gõ tay vẫn được. Nút
 * giữ con số trong khoảng 1–120 của Loan Service; gõ tay ra ngoài khoảng thì báo bằng chữ.
 */
export default function RescheduleTermStepper({ value, onChange, error }: Props) {
  // Bàn phím số của iOS không có phím Return; thanh phụ "Xong" để đóng, id riêng cho từng ô.
  const accessoryId = `reschedule-terms-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const withAccessory = Platform.OS === 'ios';

  const text = value > 0 ? String(value) : '';
  const change = (typed: string) => {
    const digits = typed.replace(/\D/g, '').slice(0, 3);
    onChange(digits ? Number(digits) : 0);
  };

  return (
    <View style={f.section}>
      <Text style={f.label} maxFontSizeMultiplier={1.4}>
        Số kỳ muốn gia hạn
        <Text style={f.required}> *</Text>
      </Text>

      <View style={[styles.row, !!error && f.boxInvalid]}>
        <StepButton icon="minus" label="Giảm một kỳ" onPress={() => onChange(clamp(value - 1))} />
        <View style={styles.value}>
          <TextInput
            value={text}
            onChangeText={change}
            keyboardType="number-pad"
            selectTextOnFocus
            inputAccessoryViewID={withAccessory ? accessoryId : undefined}
            accessibilityLabel="Số kỳ muốn gia hạn"
            style={[styles.input, { width: inputWidth(text) }]}
            maxFontSizeMultiplier={1.3}
          />
          <Text style={styles.suffix} maxFontSizeMultiplier={1.3}>
            kỳ
          </Text>
        </View>
        <StepButton icon="plus" label="Tăng một kỳ" onPress={() => onChange(clamp(value + 1))} />
      </View>

      {error ? (
        <Text style={f.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : (
        <Text style={f.helper}>Từ 1 đến 120 kỳ. Lịch mới chỉ áp dụng sau khi đề nghị được duyệt.</Text>
      )}

      {withAccessory ? (
        <InputAccessoryView nativeID={accessoryId}>
          <View style={f.accessory}>
            <Pressable
              onPress={Keyboard.dismiss}
              hitSlop={Spacing.md}
              accessibilityRole="button"
              accessibilityLabel="Đóng bàn phím"
              style={({ pressed }) => [f.accessoryButton, pressed && f.pressed]}
            >
              <Text style={f.accessoryText}>Xong</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
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
      style={({ pressed }) => [styles.step, pressed && f.pressed]}
    >
      <Icon name={icon} size={20} color={Colors.authPrimary} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  step: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: Radius.sm,
    backgroundColor: Colors.tintBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Con số và đơn vị là một cụm căn giữa khoảng trống giữa hai nút.
  value: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 6 },
  input: {
    paddingVertical: 4,
    paddingHorizontal: 0,
    textAlign: 'center',
    fontFamily: FontFamily.extrabold,
    fontSize: INPUT_FONT,
    color: Colors.authInk,
    outlineStyle: 'solid',
    outlineWidth: 0,
    ...tabularNums,
  },
  suffix: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.authMuted },
});
