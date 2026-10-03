import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';
import { MARKET_NOTE } from '../constant';

/**
 * Cuối danh sách chợ Notes, cùng dáng cuối màn Sàn: lối sang "Lệnh của tôi" rồi ô ghi chú về cách
 * tính giá và phí.
 */
export default function NotesFooter({ onMyOrders }: { onMyOrders: () => void }) {
  return (
    <View style={styles.root}>
      <Pressable
        onPress={onMyOrders}
        accessibilityRole="button"
        accessibilityLabel="Lệnh của tôi"
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <Icon name="receipt" size={24} color={Colors.authPrimary} />
        <Text style={styles.rowLabel} maxFontSizeMultiplier={1.4}>
          Lệnh của tôi
        </Text>
        <Icon name="chevronRight" size={20} color={Colors.chevronMuted} />
      </Pressable>

      <View style={styles.note}>
        <Icon name="info" size={20} color={Colors.authPrimary} />
        <Text style={styles.noteText}>{MARKET_NOTE}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: MIN_TOUCH + 8,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  pressed: { opacity: 0.72 },
  rowLabel: { flex: 1, fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21, color: Colors.authInk },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.walletHistoryNote,
  },
  noteText: { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
});
