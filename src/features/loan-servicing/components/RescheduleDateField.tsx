import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, tabularNums } from '@/theme';
import { formatLocalDate } from '@/utils/format';
import { isLocalDate, type DueDateOption } from '../mappers/servicing';
import DateWheelSheet from './DateWheelSheet';
import { rescheduleFieldStyles as f } from './rescheduleFieldStyles';

type Props = {
  label: string;
  /** Ngày dạng `yyyy-MM-dd` gửi lên Loan Service; trống khi chưa chọn. */
  value: string;
  onChange: (value: string) => void;
  helper: string;
  error?: string;
  /** Ngày sớm nhất được chọn trong bảng chọn ngày. */
  minDate: string;
  /** Tiêu đề bảng chọn ngày trượt lên từ đáy màn. */
  sheetTitle: string;
  /** Ngày đến hạn gợi ý: chạm để chọn ngay, ngày đang chọn thì sáng lên. */
  options?: readonly DueDateOption[];
};

/**
 * Ô ngày của biểu mẫu cơ cấu: chạm để mở bảng chọn ngày kiểu bánh xe ở đáy màn (không gõ
 * tay), ô hiện ngày đã chọn theo dạng ngày/tháng/năm như mọi ngày khác trên app. Hàng ngày
 * gợi ý dưới ô (cùng chỗ hàng số tiền chọn nhanh ở màn nạp tiền) chọn được một ngày đến hạn
 * mà khỏi mở bảng.
 */
export default function RescheduleDateField({
  label,
  value,
  onChange,
  helper,
  error,
  minDate,
  sheetTitle,
  options,
}: Props) {
  const [open, setOpen] = useState(false);
  const shown = isLocalDate(value) ? formatLocalDate(value) : null;

  return (
    <View style={f.section}>
      <Text style={f.label} maxFontSizeMultiplier={1.4}>
        {label}
        <Text style={f.required}> *</Text>
      </Text>

      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}, bắt buộc. ${shown ?? 'Chưa chọn ngày'}`}
        accessibilityHint={error ?? 'Mở bảng chọn ngày'}
        style={({ pressed }) => [f.box, styles.box, open && f.boxFocused, !!error && f.boxInvalid, pressed && f.pressed]}
      >
        <Text style={[styles.value, !shown && styles.placeholder]} maxFontSizeMultiplier={1.4}>
          {shown ?? 'Chọn ngày'}
        </Text>
        <Icon name="calendar" size={20} color={open ? Colors.authPrimary : Colors.authMuted} />
      </Pressable>

      {error ? (
        <Text style={f.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : (
        <Text style={f.helper}>{helper}</Text>
      )}

      {options && options.length > 0 ? (
        <View style={styles.chips}>
          {options.map(option => {
            const selected = option.date === value;
            return (
              <Pressable
                key={option.date}
                onPress={() => onChange(option.date)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.caption}, ngày ${formatLocalDate(option.date)}`}
                style={({ pressed }) => [f.chip, selected && f.chipSelected, pressed && f.pressed]}
              >
                <Text style={styles.chipCaption} numberOfLines={1} maxFontSizeMultiplier={1.3}>
                  {option.caption}
                </Text>
                <Text
                  style={[styles.chipDate, selected && styles.chipDateSelected]}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.3}
                >
                  {formatLocalDate(option.date)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <DateWheelSheet
        visible={open}
        title={sheetTitle}
        value={value}
        minDate={minDate}
        onConfirm={picked => {
          onChange(picked);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  value: { flexShrink: 1, fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 22, color: Colors.authInk, ...tabularNums },
  // Chữ mời chọn mang nghĩa nên dùng `authMuted` (đạt 4,5:1), không nhạt như chữ gợi ý trong ô gõ.
  placeholder: { fontFamily: FontFamily.regular, color: Colors.authMuted },
  chips: { flexDirection: 'row', gap: Spacing.sm },
  chipCaption: { fontFamily: FontFamily.regular, fontSize: 11.5, lineHeight: 16, color: Colors.authMuted },
  chipDate: { fontFamily: FontFamily.semibold, fontSize: 13.5, lineHeight: 19, color: Colors.authInk, ...tabularNums },
  chipDateSelected: { color: Colors.authPrimary },
});
