import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
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

  const confirm = () => Alert.alert(
    'Từ chối ký hợp đồng?',
    'Hợp đồng dùng chung cho toàn bộ nhà đầu tư. Quyết định này sẽ hủy đợt vay và trả tiền đang giữ của tất cả nhà đầu tư về ví. Không thể hoàn tác.',
    [
      { text: 'Tiếp tục xem hợp đồng', style: 'cancel' },
      { text: 'Từ chối ký', style: 'destructive', onPress: () => void onDecline(detail) },
    ],
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Bạn không muốn tiếp tục đầu tư?</Text>
      <Text style={styles.body}>
        Bạn chỉ có thể từ chối khi phần vốn của mình chưa ký. Sau khi chữ ký được ghi nhận, FINORA không cho rút đơn phương.
      </Text>
      {open ? (
        <>
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
            <DetailButton label="Xác nhận từ chối ký" variant="danger" loading={declining} onPress={confirm} />
            <DetailButton label="Quay lại" variant="outline" disabled={declining} onPress={() => setOpen(false)} />
          </View>
        </>
      ) : (
        <DetailButton label="Không tiếp tục đầu tư" variant="danger" onPress={() => setOpen(true)} />
      )}
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
