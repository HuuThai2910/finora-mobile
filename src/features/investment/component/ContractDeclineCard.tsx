import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Field } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';
import DetailButton from '@/features/applications/components/DetailButton';

type Props = {
  declining: boolean;
  error: string | null;
  onDecline: (detail: string) => Promise<void>;
};

/** Quyết định trước chữ ký; không hiển thị khi phần vốn đã SIGNED. */
export default function ContractDeclineCard({ declining, error, onDecline }: Props) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState('');

  if (!open) {
    return (
      <DetailButton
        label="Không tiếp tục đầu tư"
        variant="outline"
        icon="x"
        onPress={() => setOpen(true)}
      />
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Từ chối ký hợp đồng</Text>
      <Text style={styles.body}>
        Đợt vay sẽ dừng và tiền đang giữ của các nhà đầu tư được trả về ví. Quyết định này không thể hoàn tác.
      </Text>
      <Field
        label="Lý do từ chối"
        value={detail}
        onChangeText={setDetail}
        placeholder="Không bắt buộc"
        helper="Không nhập thông tin nhạy cảm."
        multiline
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <DetailButton
          label="Xác nhận từ chối ký"
          variant="danger"
          loading={declining}
          onPress={() => void onDecline(detail)}
        />
        <DetailButton label="Quay lại" variant="outline" disabled={declining} onPress={() => setOpen(false)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.md, backgroundColor: Colors.card, ...SoftShadow.card },
  title: { fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 21, color: Colors.authInk },
  body: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  error: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.red },
  actions: { gap: Spacing.md },
});
