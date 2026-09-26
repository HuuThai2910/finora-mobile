import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { TxTone, WalletTxView } from '../mappers/walletHistory';

type Props = { tx: WalletTxView };

/** Ô icon vuông bo góc theo mockup; khung giả lúc tải dùng cùng số đo. */
export const TX_TILE = 42;

const TONE: Record<TxTone, { bg: string; fg: string; amount: string }> = {
  in: { bg: Colors.tintGreen, fg: Colors.green, amount: Colors.walletHistoryIn },
  out: { bg: Colors.tintBlue, fg: Colors.authPrimary, amount: Colors.authInk },
};

/**
 * Một giao dịch ví trong thẻ trắng riêng (mockup 26/09/2026): ô icon theo loại,
 * mô tả và thời điểm, số tiền có dấu bên phải.
 *
 * Mockup có mũi tên ">" cuối thẻ, nhưng app chưa có màn chi tiết giao dịch nên
 * thẻ không bấm được; bỏ mũi tên để không hứa một thao tác không có. Cả thẻ vẫn
 * được đọc thành một câu.
 */
export default function WalletTxCard({ tx }: Props) {
  const tone = TONE[tx.tone];

  return (
    <View style={styles.card} accessible accessibilityLabel={tx.accessibilityLabel}>
      <View style={[styles.tile, { backgroundColor: tone.bg }]}>
        <Icon name={tx.icon} size={21} color={tone.fg} strokeWidth={1.9} />
      </View>

      <View style={styles.text}>
        {/* Mô tả dài xuống tối đa hai dòng trên máy hẹp thay vì đẩy số tiền. */}
        <Text style={styles.title} numberOfLines={2} maxFontSizeMultiplier={1.4}>
          {tx.title}
        </Text>
        <Text style={styles.time} numberOfLines={1} maxFontSizeMultiplier={1.4}>
          {tx.time}
        </Text>
      </View>

      {/* Không co và chỉ một dòng: số tiền không bao giờ bị bẻ giữa các chữ số. */}
      <Text style={[styles.amount, { color: tone.amount }]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
        {tx.amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Lề và khoảng cách gọn hơn thẻ tài khoản một chút để mô tả thường gặp
  // ("Trả nợ kỳ 3 — LN-1980") vừa một dòng cạnh số tiền ở 393pt như mockup.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  tile: {
    width: TX_TILE,
    height: TX_TILE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.authInk,
  },
  time: {
    marginTop: 3,
    fontFamily: FontFamily.regular,
    fontSize: 12.5,
    lineHeight: 17,
    color: Colors.authMuted,
    ...tabularNums,
  },
  amount: {
    flexShrink: 0,
    fontFamily: FontFamily.bold,
    fontSize: 14,
    lineHeight: 20,
    ...tabularNums,
  },
});
