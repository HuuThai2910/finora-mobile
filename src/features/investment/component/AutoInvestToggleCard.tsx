import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Switch } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';
import { AUTO_INVEST_OFF_NOTE, AUTO_INVEST_ON_NOTE } from '../constant';

type Props = {
  enabled: boolean;
  saving: boolean;
  onToggle: (enabled: boolean) => void;
};

/**
 * Thẻ bật/tắt Auto-Invest, thứ đầu tiên người dùng tìm trên màn. Trạng thái nói bằng chữ ("Đang
 * bật"/"Đang tắt") cạnh chấm màu, không chỉ dựa vào màu công tắc.
 */
export default function AutoInvestToggleCard({ enabled, saving, onToggle }: Props) {
  return (
    <View style={[styles.card, enabled && styles.cardOn]}>
      <View style={styles.row}>
        <View style={styles.text}>
          <View style={styles.stateRow}>
            <View style={[styles.dot, { backgroundColor: enabled ? Colors.emerald : Colors.dotIdle }]} />
            <Text style={styles.state} maxFontSizeMultiplier={1.4}>{enabled ? 'Đang bật' : 'Đang tắt'}</Text>
            {saving ? <ActivityIndicator size="small" color={Colors.authPrimary} /> : null}
          </View>
          <Text style={styles.title} maxFontSizeMultiplier={1.4}>Tự góp vốn khi có khoản vay mới</Text>
        </View>
        <Switch value={enabled} onValueChange={onToggle} label="Bật Auto-Invest" disabled={saving} />
      </View>
      <Text style={styles.note} maxFontSizeMultiplier={1.4}>
        {enabled ? AUTO_INVEST_ON_NOTE : AUTO_INVEST_OFF_NOTE}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.card,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  // Đang bật: viền xanh lá mảnh, đủ để nhận ra trạng thái khi lướt qua mà không thành mảng màu lớn.
  cardOn: { borderColor: Colors.tagGreenBorder },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  text: { flex: 1, minWidth: 0 },
  stateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  state: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  title: { marginTop: 2, fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 23, color: Colors.authInk },
  note: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
});
