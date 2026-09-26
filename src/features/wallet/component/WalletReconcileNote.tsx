import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing } from '@/theme';
import { RECONCILE_NOTE } from '../constant';

/** Không để gạch ngang "—" rơi xuống đầu dòng khi câu xuống dòng trên máy hẹp. */
const NOTE_TEXT = RECONCILE_NOTE.replace(/ — /g, '\u00a0— ');

/** Ô ghi chú đối soát cuối danh sách giao dịch (mockup 26/09/2026). */
export default function WalletReconcileNote() {
  return (
    <View style={styles.note}>
      {/* Chữ "i" trắng trong vòng tròn đặc như mockup; dựng bằng hai khối vì icon
          Lucide "info" chỉ có nét viền. Thuần trang trí nên ẩn với trình đọc màn hình. */}
      <View style={styles.icon} aria-hidden>
        <View style={styles.dot} />
        <View style={styles.bar} />
      </View>
      <Text style={styles.text}>{NOTE_TEXT}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.walletHistoryNote,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: Colors.authPrimary,
  },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.onDark },
  bar: { width: 3, height: 9, borderRadius: 1.5, backgroundColor: Colors.onDark },
  text: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authMuted,
  },
});
