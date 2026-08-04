import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/theme';

const GRID = 21;
const CELL = 10;

/**
 * Ô mã QR trong mockup được vẽ bằng `repeating-conic-gradient` chứ không phải
 * mã thật. Ở đây dựng lại bằng lưới ô đen trắng sinh từ chuỗi payload — giao
 * diện tĩnh, không quét được, đúng như phạm vi đã chốt.
 */
export default function QrPlaceholder({ payload }: { payload: string }) {
  const cells = buildPattern(payload);

  return (
    <View
      style={styles.frame}
      accessibilityRole="image"
      accessibilityLabel="Mã VietQR minh hoạ — bản demo không quét được"
    >
      <View style={styles.grid}>
        {cells.map((on, i) => (
          <View key={i} style={[styles.cell, on && styles.cellOn]} />
        ))}
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>VietQR</Text>
      </View>
    </View>
  );
}

/** Băm đơn giản, đủ để hai payload khác nhau cho hai hình khác nhau. */
function buildPattern(payload: string): boolean[] {
  const total = GRID * GRID;
  const out: boolean[] = [];
  let seed = 0;
  for (let i = 0; i < payload.length; i++) seed = (seed * 31 + payload.charCodeAt(i)) % 100_003;

  for (let i = 0; i < total; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    out.push((seed >> 16) % 2 === 0);
  }
  return out;
}

const styles = StyleSheet.create({
  frame: {
    width: GRID * CELL + Spacing.xl * 2,
    alignSelf: 'center',
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.line,
    borderRadius: Radius.xl,
    backgroundColor: Colors.card,
    marginVertical: Spacing.xxl,
    alignItems: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: GRID * CELL },
  cell: { width: CELL, height: CELL, backgroundColor: Colors.card },
  cellOn: { backgroundColor: Colors.ink },
  badge: {
    position: 'absolute',
    top: '50%',
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
  },
  badgeText: { fontFamily: FontFamily.extrabold, fontSize: FontSize.body, color: Colors.ink },
});
