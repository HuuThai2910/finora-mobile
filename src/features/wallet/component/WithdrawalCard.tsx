import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, tabularNums } from '@/theme';
import type { Withdrawal } from '@/types/wallet';
import { withdrawalCardView } from '../mappers/withdrawal';
import WithdrawalStatusPill from './WithdrawalStatusPill';

type Props = { withdrawal: Withdrawal; onPress: () => void };

/** Ô icon vuông bo góc, cùng số đo với thẻ giao dịch ví. */
const TILE = 42;

/**
 * Một lệnh rút trong lịch sử: ngân hàng và số tài khoản đã che, thời điểm tạo, số tiền và nhãn trạng thái. Bấm để mở
 * màn trạng thái của lệnh; cả thẻ được đọc thành một câu.
 */
export default function WithdrawalCard({ withdrawal, onPress }: Props) {
  const view = withdrawalCardView(withdrawal);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={view.accessibilityLabel}
      accessibilityHint="Mở trạng thái lệnh rút"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.tile}>
        <Icon name="banknoteArrowUp" size={21} color={Colors.authPrimary} strokeWidth={1.9} />
      </View>

      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1} maxFontSizeMultiplier={1.4}>
          {view.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1} maxFontSizeMultiplier={1.4}>
          {view.account} · {view.time}
        </Text>
        <WithdrawalStatusPill status={view.status} />
      </View>

      {/* Không co và chỉ một dòng: số tiền không bao giờ bị bẻ giữa các chữ số. */}
      <Text style={[styles.amount, view.refunded && styles.refunded]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
        {view.amount}
      </Text>
      <Icon name="chevronRight" size={18} color={Colors.chevronMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 84,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  pressed: { opacity: 0.85 },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tintBlue,
  },
  text: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authInk },
  meta: { fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 17, color: Colors.authMuted, ...tabularNums },
  amount: { flexShrink: 0, fontFamily: FontFamily.bold, fontSize: 14, lineHeight: 20, color: Colors.authInk, ...tabularNums },
  // Lệnh thất bại đã hoàn tiền: số tiền mờ đi, nhãn trạng thái nói rõ tiền đã về ví.
  refunded: { color: Colors.authMuted, textDecorationLine: 'line-through' },
});
