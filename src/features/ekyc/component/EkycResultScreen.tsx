import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { Screen, PItem } from '@/components/phone';
import { Button, Icon, InfoNote, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { useAuth } from '@/providers/AuthProvider';
import { useEkycResult } from '../hook/useEkyc';

/** Màn 6 — kết quả định danh. */
export default function EkycResultScreen() {
  const { completeKyc } = useAuth();
  const { data, loading, error, reload } = useEkycResult();

  if (loading) return <Screen light><LoadingScreen cards={2} /></Screen>;
  if (error) return <Screen light><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!data) return null;

  return (
    <Screen light>
      <View style={styles.head}>
        <View style={styles.badge}>
          <Icon name="check" size={48} color={Colors.emerald} strokeWidth={3} />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Định danh thành công
        </Text>
        <Text style={styles.sub}>Tài khoản đã kích hoạt đầy đủ</Text>
      </View>

      <PItem
        label="Điểm khớp khuôn mặt"
        value={`${data.faceMatchScore.toFixed(1).replace('.', ',')}%`}
        valueTone="up"
      />
      <PItem
        label="Liveness"
        value={<Tag tone={data.livenessPassed ? 'green' : 'red'} small>{data.livenessPassed ? 'PASSED' : 'FAILED'}</Tag>}
      />
      <PItem label="Họ tên (OCR)" value={data.ocrFullName} />
      <PItem label="Số CCCD" value={data.maskedIdNumber} />
      <PItem label="Trạng thái" value={<Tag tone="green" small>{data.status}</Tag>} last />

      <InfoNote tone="chain" mono style={styles.note}>
        <Text style={styles.chain}>
          ⛓ Hash hồ sơ KYC đã ghi Fabric{'\n'}tx {data.chainTxId} · block #{data.chainBlock}
        </Text>
      </InfoNote>

      <Button label="Bắt đầu sử dụng" onPress={completeKyc} style={styles.action} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.section, marginBottom: Spacing.xxl },
  badge: {
    width: 96,
    height: 96,
    borderRadius: Radius.pill,
    backgroundColor: Colors.greenBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: { ...Text_.display, color: Colors.ink },
  sub: { ...Text_.micro, color: Colors.ink3 },
  note: { marginTop: Spacing.xl },
  chain: { ...Text_.micro, fontFamily: 'monospace', color: Colors.tagVioletText },
  action: { marginTop: Spacing.xl },
});
