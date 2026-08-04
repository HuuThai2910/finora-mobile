import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing, Text_ } from '@/theme';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import type { IconName } from '@/constants/icons';

type Props = {
  icon?: IconName;
  title: string;
  /** Gợi ý việc nên làm tiếp — không để màn rỗng trơ trọi. */
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Trạng thái rỗng có hướng dẫn hành động tiếp theo. */
export default function EmptyState({ icon = 'file', title, hint, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Icon name={icon} size={IconSize.xl} color={Colors.ink3} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.btn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: Spacing.page, gap: Spacing.lg },
  icon: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    backgroundColor: Colors.grayBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  title: { ...Text_.title, color: Colors.ink, textAlign: 'center' },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center' },
  btn: { marginTop: Spacing.md, minWidth: 200 },
});
