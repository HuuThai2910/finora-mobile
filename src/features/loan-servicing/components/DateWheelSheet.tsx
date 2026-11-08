import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { DetailButton } from '@/features/applications';
import { FontFamily, Spacing } from '@/theme';
import { formatLocalDate } from '@/utils/format';
import { clampDay, daysInMonth, fromDateParts, toDateParts, type DateParts } from '../mappers/date';
import { isLocalDate } from '../mappers/servicing';
import BottomSheet from './BottomSheet';
import WheelColumn, { type WheelItem } from './WheelColumn';

type Props = {
  visible: boolean;
  /** Tên bảng cho trình đọc màn hình; bảng không in tiêu đề. */
  title: string;
  /** Ngày đang có ở ô (`yyyy-MM-dd`); trống thì bảng mở ở `minDate`. */
  value: string;
  /** Ngày sớm nhất được chọn; cuộn tới ngày sớm hơn thì nút xác nhận khoá và có câu nhắc. */
  minDate: string;
  /** Số năm cho cột năm, tính từ năm của `minDate`. */
  years?: number;
  onConfirm: (value: string) => void;
  onClose: () => void;
};

const MONTHS: readonly WheelItem[] = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: `Tháng ${index + 1}`,
}));

const pad2 = (value: number) => String(value).padStart(2, '0');

/**
 * Bảng chọn ngày trượt lên từ đáy màn: chỉ có tay nắm, ba cột bánh xe ngày | tháng | năm
 * (hàng giữa nằm giữa hai vạch là ngày đang chọn) và nút xác nhận. Kéo tay nắm xuống hoặc
 * chạm lớp phủ để đóng; đóng thì giữ nguyên ngày cũ, chỉ "Chọn ngày này" mới ghi vào ô.
 */
export default function DateWheelSheet({ visible, title, value, minDate, years = 10, onConfirm, onClose }: Props) {
  // Ô trống, hoặc ngày trong ô đã sớm hơn mốc cho phép (vd. vừa dời ngày bắt đầu ra sau): mở ở mốc.
  const start = isLocalDate(value) && value >= minDate ? value : minDate;
  const [parts, setParts] = useState<DateParts>(() => toDateParts(start));

  // Mỗi lần mở bảng bắt đầu từ ngày đang có ở ô (bỏ phần đã cuộn mà chưa xác nhận).
  useEffect(() => {
    if (visible) setParts(toDateParts(start));
  }, [visible, start]);

  const firstYear = toDateParts(minDate).year;
  const yearItems: WheelItem[] = Array.from({ length: years + 1 }, (_, index) => ({
    value: firstYear + index,
    label: String(firstYear + index),
  }));
  const dayItems: WheelItem[] = Array.from({ length: daysInMonth(parts.year, parts.month) }, (_, index) => ({
    value: index + 1,
    label: pad2(index + 1),
  }));

  const picked = fromDateParts(parts);
  const tooEarly = picked < minDate;
  const update = (patch: Partial<DateParts>) => setParts(current => clampDay({ ...current, ...patch }));

  return (
    <BottomSheet visible={visible} title={title} onClose={onClose}>
      <View style={styles.wheel}>
        <WheelColumn label="Ngày" items={dayItems} value={parts.day} onChange={day => update({ day })} />
        <WheelColumn label="Tháng" items={MONTHS} value={parts.month} onChange={month => update({ month })} />
        <WheelColumn label="Năm" items={yearItems} value={parts.year} onChange={year => update({ year })} />
      </View>

      {tooEarly ? (
        <Text style={styles.warn} accessibilityLiveRegion="polite">
          {`Chọn từ ngày ${formatLocalDate(minDate)} trở đi.`}
        </Text>
      ) : null}

      <View style={styles.action}>
        <DetailButton label="Chọn ngày" onPress={() => onConfirm(picked)} disabled={tooEarly} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  wheel: { flexDirection: 'row', gap: Spacing.md },
  warn: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontFamily: FontFamily.medium,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.tagRedText,
  },
  action: { marginTop: Spacing.lg },
});
