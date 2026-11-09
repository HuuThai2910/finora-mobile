import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, MIN_TOUCH, Spacing } from '@/theme';
import { Icon } from '@/components/ui';
import type { SelfRegisterRole } from '@/types/auth';

type Props = {
  value: SelfRegisterRole;
  onChange: (value: SelfRegisterRole) => void;
  disabled?: boolean;
};

type Option = { value: SelfRegisterRole; title: string; caption: string; icon: IconName };

const OPTIONS: readonly Option[] = [
  { value: 'BORROWER', title: 'Người vay', caption: 'Đăng ký khoản vay', icon: 'handCoins' },
  { value: 'INVESTOR', title: 'Nhà đầu tư', caption: 'Góp vốn, nhận lãi', icon: 'chart' },
];

/**
 * Chọn vai trò khi tạo tài khoản: hai thẻ đặt cạnh nhau, bấm vào thẻ nào thì
 * thẻ đó sáng viền màu chủ đạo. Vai trò quyết định tab và quyền gọi API sau
 * đăng nhập (đặt lệnh đầu tư chỉ dành cho INVESTOR), nên phải chọn ngay từ đầu.
 */
export default function AuthRoleChoice({ value, onChange, disabled = false }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        Bạn tham gia với vai trò<Text style={styles.required}> *</Text>
      </Text>

      <View style={styles.row} accessibilityRole="radiogroup">
        {OPTIONS.map(option => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={`${option.title}, ${option.caption}`}
              style={({ pressed }) => [
                styles.card,
                selected && styles.cardSelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.head}>
                <Icon
                  name={option.icon}
                  size={20}
                  color={selected ? Colors.authPrimary : Colors.ink3}
                  strokeWidth={1.8}
                />
                <View style={[styles.dot, selected && styles.dotSelected]}>
                  {selected ? <View style={styles.dotInner} /> : null}
                </View>
              </View>
              <Text style={[styles.title, selected && styles.titleSelected]}>{option.title}</Text>
              <Text style={styles.caption}>{option.caption}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const DOT = 18;

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.xl },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authLabel,
    marginBottom: Spacing.sm,
  },
  required: { color: Colors.red },
  row: { flexDirection: 'row', gap: Spacing.lg },
  card: {
    flex: 1,
    minHeight: MIN_TOUCH,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    // Cùng độ dày viền ở mọi trạng thái như `AuthField`, chỉ đổi màu và nền.
    borderWidth: 1,
    borderColor: Colors.authBorder,
    borderRadius: 12,
    backgroundColor: Colors.card,
  },
  cardSelected: { borderColor: Colors.authPrimary, backgroundColor: Colors.authFocusBg },
  pressed: { opacity: 0.7 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 1.5,
    borderColor: Colors.authControl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSelected: { borderColor: Colors.authPrimary },
  dotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.authPrimary },
  title: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.ink },
  titleSelected: { color: Colors.authPrimary },
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.ink3,
    marginTop: 2,
  },
});
