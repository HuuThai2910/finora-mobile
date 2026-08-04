import { Switch as RNSwitch, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

type Props = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  /** Bắt buộc — công tắc không có chữ đi kèm thì phải có nhãn cho trình đọc. */
  label: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * `.switch` của mockup. Dùng công tắc gốc của hệ điều hành thay vì tự vẽ:
 * giữ đúng cử chỉ, phản hồi chạm và hành vi trợ năng của từng nền tảng.
 * Màu bật lấy theo emerald của mockup.
 */
export default function Switch({ value, onValueChange, label, disabled, style }: Props) {
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      trackColor={{ false: '#c2cde3', true: Colors.emerald }}
      thumbColor={Colors.onDark}
      ios_backgroundColor="#c2cde3"
      style={style}
    />
  );
}
