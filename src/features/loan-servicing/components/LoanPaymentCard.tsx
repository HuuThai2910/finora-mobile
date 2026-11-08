import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DetailButton, DetailCard, DetailNote } from '@/features/applications';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, Spacing, tabularNums } from '@/theme';
import { formatDong, formatLocalDate } from '@/utils/format';
import { canPrepayLoan, dueAmountOf } from '../mappers/servicing';
import type { ServicingLoanSummary } from '../types';
import BottomSheet from './BottomSheet';

type Option = { label: string; hint: string; icon: IconName; onPress: () => void };

type Props = {
  loan: ServicingLoanSummary;
  onPay: () => void;
  onPrepay: () => void;
  onSettle: () => void;
  onReschedule: () => void;
  canReschedule: boolean;
};

/**
 * "Thanh toán" của màn chi tiết khoản vay: số tiền màn thanh toán sắp thu in lớn (khoản
 * quá hạn nếu có, không thì kỳ tới), nút trả chính và nút "Tuỳ chọn khác" mở bảng trượt với trả
 * trước một phần, tất toán, đổi lịch trả. Số liệu đang chờ đồng bộ thì khoá cả hai nút, vì thu
 * tiền theo số cũ sẽ bị backend từ chối.
 */
export default function LoanPaymentCard({ loan, onPay, onPrepay, onSettle, onReschedule, canReschedule }: Props) {
  const overdue = loan.overdueAmount > 0;
  const amount = dueAmountOf(loan);
  const prepay = canPrepayLoan(loan);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const options: Option[] = [
    ...(prepay
      ? [
          { label: "Trả trước một phần gốc", hint: "Trả bớt gốc để giảm dư nợ", icon: "coins" as const, onPress: onPrepay },
          { label: "Tất toán toàn bộ trước hạn", hint: "Trả hết dư nợ và đóng khoản vay", icon: "circleCheck" as const, onPress: onSettle },
        ]
      : []),
    ...(canReschedule
      ? [{ label: "Đổi kỳ hạn hoặc gia hạn", hint: "Gửi yêu cầu điều chỉnh lịch trả", icon: "refreshCw" as const, onPress: onReschedule }]
      : []),
  ];

  return (
    <DetailCard title="Thanh toán và điều chỉnh" icon="wallet">
      <View
        accessible
        accessibilityLabel={`${overdue ? "Số tiền quá hạn" : "Số tiền kỳ tới"} ${formatDong(amount)}`}
      >
        <View style={styles.amountRow}>
          <Text style={styles.amount} maxFontSizeMultiplier={1.2}>
            {formatDong(amount)}
          </Text>
          <Text style={styles.unit}>{overdue ? "/ quá hạn" : "/ kỳ tới"}</Text>
        </View>
        {overdue ? (
          <Text style={styles.overdue}>
            {loan.daysPastDue > 0
              ? `Đã quá hạn ${loan.daysPastDue} ngày`
              : "Có khoản đã quá hạn"}
          </Text>
        ) : loan.nextDueDate ? (
          <Text
            style={styles.caption}
          >{`Đến hạn ${formatLocalDate(loan.nextDueDate)}`}</Text>
        ) : null}
      </View>

      {overdue ? (
        <DetailNote tone="warn">
          Khoản thanh toán tiếp theo được ghi nhận là khắc phục quá hạn. Hãy
          thanh toán sớm để khoản vay trở lại đúng lịch.
        </DetailNote>
      ) : null}
      {loan.stale ? (
        <DetailNote tone="warn">
          Số liệu khoản vay đang chờ đồng bộ lại. Hãy kéo xuống để làm mới trước
          khi thanh toán.
        </DetailNote>
      ) : null}

      <View style={styles.actions}>
        <DetailButton
          label={overdue ? "Khắc phục quá hạn" : "Thanh toán kỳ tới"}
          icon="wallet"
          onPress={onPay}
          disabled={loan.stale || amount <= 0}
        />
        {options.length ? (
          <DetailButton
            label="Tuỳ chọn khác"
            variant="outline"
            icon="grid"
            onPress={() => setOptionsOpen(true)}
            disabled={loan.stale}
          />
        ) : null}
      </View>

      {/* Ba thao tác ít dùng (trả trước, tất toán, đổi lịch trả) nằm trong bảng trượt để thẻ chỉ còn
          nút trả chính; chọn một thao tác thì đóng bảng rồi mới mở màn tương ứng. */}
      <BottomSheet visible={optionsOpen} title="Tuỳ chọn khác" onClose={() => setOptionsOpen(false)}>
        <View style={styles.options}>
          {options.map((option, index) => (
            <OptionRow
              key={option.label}
              option={option}
              divided={index < options.length - 1}
              onPress={() => {
                setOptionsOpen(false);
                option.onPress();
              }}
            />
          ))}
        </View>
      </BottomSheet>

    </DetailCard>
  );
}

/**
 * Một dòng của bảng "Tuỳ chọn khác": nền trắng như bảng, biểu tượng trong ô tròn xanh nhạt, tên thao
 * tác đậm kèm một dòng giải thích ngắn, mũi tên xám; dòng nào còn dòng phía dưới thì kẻ nét mảnh ở đáy,
 * thay vì mỗi dòng một khối màu.
 */
function OptionRow({ option, divided, onPress }: {
  option: Option;
  /** Còn dòng phía dưới thì kẻ nét mảnh ở đáy dòng này; dòng cuối không kẻ. */
  divided: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={option.label}
      accessibilityHint={option.hint}
      style={({ pressed }) => [styles.option, divided && styles.optionDivided, pressed && styles.optionPressed]}
    >
      <View style={styles.optionIcon}>
        <Icon name={option.icon} size={22} color={Colors.authPrimary} />
      </View>
      <View style={styles.optionText}>
        <Text style={styles.optionLabel}>{option.label}</Text>
        <Text style={styles.optionHint}>{option.hint}</Text>
      </View>
      <Icon name="chevronRight" size={18} color={Colors.authMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  amountRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: Spacing.md },
  amount: {
    fontFamily: FontFamily.extrabold,
    fontSize: 30,
    lineHeight: 40,
    letterSpacing: -0.4,
    color: Colors.authInk,
    ...tabularNums,
  },
  unit: { fontFamily: FontFamily.regular, fontSize: 15, lineHeight: 21, color: Colors.authMuted },
  caption: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted, ...tabularNums },
  overdue: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 19, color: Colors.tagRedText },
  actions: { gap: Spacing.md },
  options: { paddingBottom: Spacing.sm },
  option: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, paddingVertical: Spacing.lg },
  // Nét 1pt màu viền ô nhập: nét hairline màu `rowDivider` gần như không thấy trên nền trắng của bảng.
  optionDivided: { borderBottomWidth: 1, borderBottomColor: Colors.authBorder },
  optionPressed: { opacity: 0.6 },
  optionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tintBlue,
  },
  optionText: { flex: 1, gap: 2 },
  optionLabel: { fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 22, color: Colors.authInk },
  optionHint: { fontFamily: FontFamily.regular, fontSize: 13.5, lineHeight: 19, color: Colors.authMuted },
  fine: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
});
