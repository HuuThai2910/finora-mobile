import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MIN_TOUCH, Spacing, Text_ } from '@/theme';
import { Switch } from '@/components/ui';
import { categoryCopy } from '../constants/categories';

type Props = {
  category: string;
  pushEnabled: boolean;
  disabled: boolean;
  divider: boolean;
  onChange: (pushEnabled: boolean) => void;
};

/** Một nhóm thông báo: tên, mô tả ngắn và công tắc push. */
export default function PreferenceToggleRow({ category, pushEnabled, disabled, divider, onChange }: Props) {
  const copy = categoryCopy(category);

  return (
    <View style={[styles.row, divider && styles.divider]}>
      <View style={styles.text}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.description}>{copy.description}</Text>
      </View>
      <Switch
        value={pushEnabled}
        onValueChange={onChange}
        disabled={disabled}
        label={`Thông báo đẩy: ${copy.title}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    minHeight: MIN_TOUCH,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.line },
  text: { flex: 1, gap: Spacing.xs },
  title: { ...Text_.captionBold, color: Colors.ink },
  description: { ...Text_.micro, color: Colors.ink3 },
});
