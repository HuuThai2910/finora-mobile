import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, MIN_TOUCH, Radius, Spacing, lh } from '@/theme';
import type { BankAccount } from '@/types/wallet';
import { bankAccountSubtitle } from '../mappers/bankAccount';
import BankLogo from './BankLogo';

type Props = {
  account: BankAccount;
  /** Chế độ chọn (màn rút tiền): hiện ô radio, chạm để chọn. */
  selectable?: { selected: boolean; onSelect: () => void };
  /** Chế độ quản lý: chạm để mở thao tác của tài khoản. */
  onPress?: () => void;
  divided?: boolean;
  disabled?: boolean;
};

const RADIO_SIZE = 22;

/**
 * Một tài khoản ngân hàng đã liên kết: logo, tên ngân hàng, số đã che và tên chủ tài khoản, nhãn "Mặc định". Dùng
 * chung cho danh sách quản lý và ô chọn tài khoản nhận ở màn rút tiền.
 */
export default function BankAccountRow({ account, selectable, onPress, divided = false, disabled = false }: Props) {
  const handlePress = selectable ? selectable.onSelect : onPress;
  const label = `${account.bankName}, ${bankAccountSubtitle(account)}${account.defaultAccount ? ', mặc định' : ''}`;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || !handlePress}
      accessibilityRole={selectable ? 'radio' : 'button'}
      accessibilityState={selectable ? { selected: selectable.selected, disabled } : { disabled }}
      aria-checked={selectable?.selected}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.row,
        divided && styles.divided,
        selectable?.selected && styles.selected,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <BankLogo uri={account.bankLogoUrl} size={44} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.bank} numberOfLines={1} maxFontSizeMultiplier={1.4}>
            {account.bankName}
          </Text>
          {account.defaultAccount ? (
            <Tag tone="blue" small>
              Mặc định
            </Tag>
          ) : null}
        </View>
        <Text style={styles.sub} numberOfLines={1} maxFontSizeMultiplier={1.4}>
          {bankAccountSubtitle(account)}
        </Text>
      </View>
      {selectable ? (
        <View style={[styles.radio, selectable.selected && styles.radioActive]}>
          {selectable.selected ? <View style={styles.radioDot} /> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    minHeight: MIN_TOUCH + Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
  },
  divided: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  selected: { backgroundColor: Colors.authFocusBg },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.5 },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  bank: {
    flexShrink: 1,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body, 1.4),
    color: Colors.authInk,
  },
  sub: { fontFamily: FontFamily.regular, fontSize: FontSize.caption, color: Colors.authMuted },
  radio: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    borderRadius: RADIO_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.authMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.authPrimary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.authPrimary },
});
