import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Field, InfoNote, SegmentGroup } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { DECLINE_REASONS, type DeclineReasonCode } from '../constant';

type Props = {
  reason: DeclineReasonCode;
  onReasonChange: (value: DeclineReasonCode) => void;
  detail: string;
  onDetailChange: (value: string) => void;
  /** Lỗi nghiệp vụ trả về từ backend, hiển thị ở cấp biểu mẫu. */
  error?: string;
};

/**
 * Biểu mẫu từ chối hợp đồng. Đặt ở một bước riêng chứ không bung ngay dưới nút
 * ký, để hai quyết định trái ngược nhau không nằm cạnh nhau trong cùng một tầm
 * mắt và người dùng không bấm nhầm.
 */
export default function DeclineForm({
  reason,
  onReasonChange,
  detail,
  onDetailChange,
  error,
}: Props) {
  // Chỉ báo thiếu nội dung sau khi người dùng đã chạm vào ô, không bắt lỗi ngay
  // khi biểu mẫu vừa mở.
  const [touched, setTouched] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title} accessibilityRole="header">
        Từ chối hợp đồng này
      </Text>
      <Text style={styles.body}>
        Sau khi từ chối, hợp đồng không còn hiệu lực để ký và khoản vay sẽ không được thiết lập.
        Hồ sơ đã duyệt vẫn được giữ lại trong lịch sử của bạn.
      </Text>

      <SegmentGroup
        options={DECLINE_REASONS}
        value={reason}
        onChange={onReasonChange}
        label="Chọn lý do từ chối hợp đồng"
        wrap
      />

      {reason === 'OTHER' ? (
        <Field
          label="Chi tiết lý do"
          value={detail}
          onChangeText={value => {
            setTouched(true);
            onDetailChange(value);
          }}
          multiline
          required
          helper="Bắt buộc khi bạn chọn “Lý do khác”."
          error={touched && !detail.trim() ? 'Vui lòng mô tả lý do từ chối.' : undefined}
        />
      ) : null}

      {error ? <InfoNote tone="warn">{error}</InfoNote> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xl },
  title: { ...Text_.title, color: Colors.ink },
  body: { ...Text_.micro, color: Colors.ink2 },
});
