import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, MIN_TOUCH, Radius, SoftShadow, Spacing, lh } from '@/theme';
import type { WithdrawalBank } from '@/types/wallet';
import { WALLET_HISTORY_MAX_WIDTH } from '../constant';
import WithdrawField, { withdrawValueStyles } from './WithdrawField';

type Props = {
  banks: readonly WithdrawalBank[];
  value: string | null;
  onChange: (code: string) => void;
  error?: string;
};

const LABEL = 'Ngân hàng nhận';
const RADIO_SIZE = 22;
/** Bảng không cao quá phần này của màn, để luôn thấy lớp phủ phía trên mà chạm đóng. */
const SHEET_MAX_HEIGHT_RATIO = 0.7;

/**
 * Dòng chọn ngân hàng nhận và bảng chọn trượt từ đáy. Danh sách lấy từ policy của Payment (chỉ ngân hàng được hỗ
 * trợ), ngắn nên dùng ScrollView. Chọn xong thì đóng ngay; đóng bằng chạm lớp phủ, nút X hoặc phím Back của Android.
 * Việc mở/đóng bảng là state tạm của riêng dòng nên giữ tại đây.
 */
export default function WithdrawBankPicker({ banks, value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const selected = banks.find(bank => bank.code === value);
  const close = () => setOpen(false);

  return (
    <>
      <WithdrawField
        icon="bank"
        label={LABEL}
        focused={open}
        error={error}
        trailing={<Icon name="chevronDown" size={IconSize.xs} color={Colors.authMuted} />}
        // Giá trị đang chọn nằm luôn trong nhãn đọc vì react-native-web bỏ qua `accessibilityValue`.
        pressable={{
          onPress: () => setOpen(true),
          accessibilityRole: 'button',
          accessibilityLabel: `${LABEL}: ${selected?.name ?? 'chưa chọn'}`,
          accessibilityHint: error ?? 'Mở danh sách để chọn',
          'aria-expanded': open,
        }}
      >
        <Text style={[withdrawValueStyles.value, !selected && withdrawValueStyles.placeholder]} maxFontSizeMultiplier={1.4}>
          {selected?.name ?? 'Chọn ngân hàng'}
        </Text>
      </WithdrawField>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
        <View style={styles.root}>
          <Pressable style={styles.scrim} onPress={close} accessibilityRole="button" accessibilityLabel="Đóng danh sách" />
          <View
            accessibilityViewIsModal
            style={[styles.sheet, { maxHeight: height * SHEET_MAX_HEIGHT_RATIO, paddingBottom: insets.bottom + Spacing.lg }]}
          >
            <View style={styles.handle} />
            <View style={styles.head}>
              <Text style={styles.title} accessibilityRole="header">
                {LABEL}
              </Text>
              <Pressable
                onPress={close}
                accessibilityRole="button"
                accessibilityLabel="Đóng"
                style={({ pressed }) => [styles.close, pressed && styles.pressed]}
              >
                <Icon name="x" size={IconSize.xs} color={Colors.authMuted} />
              </Pressable>
            </View>

            <ScrollView accessibilityRole="radiogroup" accessibilityLabel={LABEL} bounces={false}>
              {banks.map((bank, index) => {
                const active = bank.code === value;
                return (
                  <Pressable
                    key={bank.code}
                    onPress={() => {
                      onChange(bank.code);
                      close();
                    }}
                    accessibilityRole="radio"
                    // `selected` cho iOS/Android; `aria-checked` là cách duy nhất react-native-web hiểu trạng thái radio.
                    accessibilityState={{ selected: active }}
                    aria-checked={active}
                    accessibilityLabel={bank.name}
                    style={({ pressed }) => [
                      styles.option,
                      index > 0 && styles.optionDivided,
                      active && styles.optionActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active ? <View style={styles.radioDot} /> : null}
                    </View>
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{bank.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: Colors.applyFormScrim },
  // Trên web/máy tính bảng, bảng giữ bề rộng cột nội dung của màn ví thay vì giãn hết cửa sổ.
  sheet: {
    width: '100%',
    maxWidth: WALLET_HISTORY_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Colors.card,
    ...SoftShadow.raised,
  },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: Radius.pill, backgroundColor: Colors.authBorder },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.sm },
  title: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.title,
    lineHeight: lh(FontSize.title, 1.4),
    color: Colors.authInk,
  },
  close: { width: MIN_TOUCH, height: MIN_TOUCH, marginRight: -Spacing.md, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    minHeight: MIN_TOUCH + Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  optionDivided: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  optionActive: { backgroundColor: Colors.authFocusBg },
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
  optionText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body, 1.4),
    color: Colors.authInk,
  },
  optionTextActive: { fontFamily: FontFamily.semibold },
});
