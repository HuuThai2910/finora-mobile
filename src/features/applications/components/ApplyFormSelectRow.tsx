import { useState } from 'react';
import { Text } from 'react-native';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { IconSize } from '@/theme';
import { Icon } from '@/components/ui';
import ApplyFormFieldShell, { applyFormValueStyles } from './ApplyFormFieldShell';
import ApplyFormPicker, { type ApplyFormOption } from './ApplyFormPicker';

type Props = {
  icon: IconName;
  label: string;
  placeholder: string;
  options: readonly ApplyFormOption[];
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  helper?: string;
  error?: string;
};

/**
 * Dòng chọn một giá trị trong danh sách (thay nhóm chip của màn cũ): hiện lựa
 * chọn hiện tại hoặc chữ gợi ý, mũi tên xuống báo có bảng chọn. Việc mở/đóng
 * bảng là state tạm của riêng dòng nên giữ tại đây.
 */
export default function ApplyFormSelectRow({
  icon,
  label,
  placeholder,
  options,
  value,
  onChange,
  required = false,
  helper,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <>
      <ApplyFormFieldShell
        icon={icon}
        label={label}
        required={required}
        focused={open}
        error={error}
        helper={helper}
        pressFeedback
        trailing={<Icon name="chevronDown" size={IconSize.xs} color={Colors.authMuted} />}
        // Giá trị đang chọn nằm luôn trong nhãn đọc: react-native-web bỏ qua
        // `accessibilityValue`, còn trạng thái dùng `aria-*` vì RN 0.86 và web đều hiểu.
        pressable={{
          onPress: () => setOpen(true),
          accessibilityRole: 'button',
          accessibilityLabel: `${required ? `${label}, bắt buộc` : label}: ${selected?.label ?? 'chưa chọn'}`,
          accessibilityHint: error ?? 'Mở danh sách để chọn',
          'aria-expanded': open,
        }}
      >
        <Text style={[applyFormValueStyles.value, !selected && applyFormValueStyles.placeholder]}>
          {selected?.label ?? placeholder}
        </Text>
      </ApplyFormFieldShell>

      <ApplyFormPicker
        visible={open}
        title={label}
        options={options}
        selected={value}
        onSelect={onChange}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
