import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, MIN_TOUCH, Radius, SoftShadow, Spacing, lh } from '@/theme';
import type { Bank } from '@/types/wallet';
import { WALLET_HISTORY_MAX_WIDTH } from '../constant';
import { matchesBankQuery } from '../mappers/bankAccount';
import BankLogo from './BankLogo';
import WithdrawField, { withdrawValueStyles } from './WithdrawField';

type Props = {
  banks: readonly Bank[];
  value: string | null;
  onChange: (code: string) => void;
  error?: string;
  disabled?: boolean;
};

const LABEL = 'Ngân hàng';
const RADIO_SIZE = 22;
/** Bảng không cao quá phần này của màn, để luôn thấy lớp phủ phía trên mà chạm đóng. */
const SHEET_MAX_HEIGHT_RATIO = 0.8;

/**
 * Dòng chọn ngân hàng và bảng chọn trượt từ đáy, đủ danh bạ NAPAS của Payment (hơn 40 ngân hàng) nên có ô tìm theo
 * tên ngắn, tên đầy đủ hoặc mã, gõ không dấu vẫn ra. Chọn xong thì đóng ngay; đóng bằng chạm lớp phủ, nút X hoặc phím
 * Back của Android. Việc mở/đóng bảng và chữ đang tìm là state tạm của riêng dòng nên giữ tại đây.
 */
export default function BankPicker({ banks, value, onChange, error, disabled = false }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const selected = banks.find(bank => bank.code === value);
  const visible = useMemo(() => banks.filter(bank => matchesBankQuery(bank, query)), [banks, query]);
  const close = () => {
    setOpen(false);
    setQuery('');
  };

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
          onPress: () => {
            if (!disabled) setOpen(true);
          },
          accessibilityRole: 'button',
          accessibilityLabel: `${LABEL}: ${selected?.shortName ?? 'chưa chọn'}`,
          accessibilityHint: error ?? 'Mở danh sách để chọn',
          'aria-expanded': open,
        }}
      >
        <View style={styles.selected}>
          {selected ? <BankLogo uri={selected.logoUrl} size={24} /> : null}
          <Text
            style={[withdrawValueStyles.value, !selected && withdrawValueStyles.placeholder, styles.selectedText]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.4}
          >
            {selected?.shortName ?? 'Chọn ngân hàng'}
          </Text>
        </View>
      </WithdrawField>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
        <View style={styles.root}>
          <Pressable style={styles.scrim} onPress={close} accessibilityRole="button" accessibilityLabel="Đóng danh sách" />
          <View
            accessibilityViewIsModal
            style={[styles.sheet, { height: height * SHEET_MAX_HEIGHT_RATIO, paddingBottom: insets.bottom + Spacing.lg }]}
          >
            <View style={styles.handle} />
            <View style={styles.head}>
              <Text style={styles.title} accessibilityRole="header">
                Chọn ngân hàng
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

            <View style={styles.search}>
              <Icon name="search" size={IconSize.xs} color={Colors.authMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Tìm tên hoặc mã ngân hàng"
                placeholderTextColor={Colors.authMuted}
                style={styles.searchInput}
                autoCorrect={false}
                autoCapitalize="none"
                accessibilityLabel="Tìm ngân hàng"
              />
            </View>

            <FlatList
              data={visible}
              keyExtractor={bank => bank.code}
              keyboardShouldPersistTaps="handled"
              accessibilityRole="radiogroup"
              accessibilityLabel={LABEL}
              ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy ngân hàng phù hợp.</Text>}
              renderItem={({ item: bank, index }) => {
                const active = bank.code === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(bank.code);
                      close();
                    }}
                    accessibilityRole="radio"
                    // `selected` cho iOS/Android; `aria-checked` là cách duy nhất react-native-web hiểu trạng thái radio.
                    accessibilityState={{ selected: active }}
                    aria-checked={active}
                    accessibilityLabel={`${bank.shortName}, ${bank.name}`}
                    style={({ pressed }) => [
                      styles.option,
                      index > 0 && styles.optionDivided,
                      active && styles.optionActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <BankLogo uri={bank.logoUrl} size={40} />
                    <View style={styles.optionBody}>
                      <Text style={[styles.optionText, active && styles.optionTextActive]} numberOfLines={1}>
                        {bank.shortName}
                      </Text>
                      <Text style={styles.optionSub} numberOfLines={1}>
                        {bank.name}
                      </Text>
                    </View>
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active ? <View style={styles.radioDot} /> : null}
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selected: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  selectedText: { flexShrink: 1 },
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
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: MIN_TOUCH,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    backgroundColor: Colors.authFocusBg,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    color: Colors.authInk,
  },
  empty: {
    paddingVertical: Spacing.xxl,
    textAlign: 'center',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    color: Colors.authMuted,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    minHeight: MIN_TOUCH + Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  optionDivided: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  optionActive: { backgroundColor: Colors.authFocusBg },
  optionBody: { flex: 1, gap: 2 },
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
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    lineHeight: lh(FontSize.body, 1.4),
    color: Colors.authInk,
  },
  optionTextActive: { fontFamily: FontFamily.semibold },
  optionSub: { fontFamily: FontFamily.regular, fontSize: FontSize.caption, color: Colors.authMuted },
});
