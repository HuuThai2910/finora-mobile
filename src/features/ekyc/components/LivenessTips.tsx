import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { Icon } from '@/components/ui';
import { LIVENESS_PRIVACY_NOTE, LIVENESS_TIPS } from '../constants/liveness';

/**
 * Mẹo trước khi quay — chống mờ và chống tối ngay từ phía người dùng, vì Expo Go không cho app
 * tự đo ánh sáng hay khuôn mặt theo thời gian thực.
 */
export default function LivenessTips() {
  return (
    <View style={styles.card}>
      {LIVENESS_TIPS.map(tip => (
        <View key={tip.text} style={styles.row}>
          <View style={styles.tile}>
            <Icon name={tip.icon} size={18} color={Colors.brand} />
          </View>
          <Text style={styles.text}>{tip.text}</Text>
        </View>
      ))}
      <Text style={styles.note}>{LIVENESS_PRIVACY_NOTE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: Spacing.xl,
    padding: Spacing.xl,
    gap: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  tile: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.brand50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { ...Text_.micro, color: Colors.ink2, flex: 1 },
  note: { ...Text_.caption, color: Colors.ink3 },
});
