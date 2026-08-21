import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import type { LivenessActionCode } from '@/types/ekyc';
import { ACTION_LABELS } from '../constants';

type Props = {
  actions: LivenessActionCode[];
  /** Đang trong lúc quay — làm nổi danh sách để người dùng biết phải làm ngay. */
  active?: boolean;
};

/**
 * Danh sách động tác của phiên, hiển thị **đúng thứ tự server sinh ra**.
 * Thứ tự là một phần của thử thách nên không được sắp xếp lại hay gộp nhóm.
 */
export default function LivenessActionList({ actions, active = false }: Props) {
  return (
    <View style={styles.list}>
      {actions.map((action, index) => (
        <View
          key={`${action}-${index}`}
          style={[styles.row, active && styles.rowActive]}
          accessibilityLabel={`Bước ${index + 1}: ${ACTION_LABELS[action]}`}
        >
          <View style={[styles.badge, active && styles.badgeActive]}>
            <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{index + 1}</Text>
          </View>
          <Text style={styles.label}>{ACTION_LABELS[action]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceMuted,
  },
  rowActive: { backgroundColor: Colors.brand50 },
  badge: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.line,
  },
  badgeActive: { backgroundColor: Colors.brand },
  badgeText: { ...Text_.captionBold, color: Colors.ink2 },
  badgeTextActive: { color: Colors.onDark },
  label: { ...Text_.body, color: Colors.ink, flex: 1 },
});
