import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { Screen, PItem } from '@/components/phone';
import { Button, Icon, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import type { EkycStackParamList } from '@/navigation/types';
import type { LivenessStepStatus } from '@/types/ekyc';
import { LIVENESS_HINT } from '../constant';
import { useLiveness } from '../hook/useEkyc';

type Nav = NativeStackNavigationProp<EkycStackParamList, 'Liveness'>;

const STATUS: Record<LivenessStepStatus, { tone: 'green' | 'blue' | 'gray'; label: string }> = {
  passed: { tone: 'green', label: '✓' },
  processing: { tone: 'blue', label: 'Đang xử lý…' },
  pending: { tone: 'gray', label: 'Chưa' },
};

/**
 * Màn 5 — xác minh khuôn mặt (liveness).
 * Giao diện tĩnh: vòng ngắm được vẽ lại, không mở camera thật.
 */
export default function LivenessScreen() {
  const nav = useNavigation<Nav>();
  const { data, loading, error, reload } = useLiveness();

  return (
    <Screen light>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          Xác minh khuôn mặt
        </Text>
        <Text style={styles.sub}>Giữ khuôn mặt trong khung tròn</Text>
      </View>

      <View style={styles.circle} accessibilityLabel="Khung ngắm khuôn mặt">
        <Icon name="users" size={66} color={Colors.brand} />
      </View>

      {loading ? (
        <LoadingScreen cards={1} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data ? (
        <>
          <View style={styles.dots}>
            {Array.from({ length: data.total }).map((_, i) => (
              <View key={i} style={[styles.dot, i < data.completed && styles.dotDone]} />
            ))}
          </View>

          {data.steps.map((s, i) => (
            <PItem
              key={s.label}
              label={s.label}
              value={
                <Tag tone={STATUS[s.status].tone} small>
                  {STATUS[s.status].label}
                </Tag>
              }
              last={i === data.steps.length - 1}
            />
          ))}

          <Text style={styles.hint}>{LIVENESS_HINT}</Text>

          <Button
            label="Tiếp tục"
            onPress={() => nav.navigate('EkycResult')}
            style={styles.action}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.xl },
  title: { ...Text_.heading, color: Colors.ink },
  sub: { ...Text_.micro, color: Colors.ink3 },
  circle: {
    width: 255,
    height: 255,
    borderRadius: Radius.pill,
    borderWidth: 4,
    borderStyle: 'dashed',
    borderColor: Colors.brand,
    backgroundColor: Colors.brand50,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xxl,
  },
  dots: { flexDirection: 'row', gap: Spacing.md, justifyContent: 'center', marginBottom: Spacing.xxl },
  dot: { width: 11, height: 11, borderRadius: Radius.pill, backgroundColor: '#cbd5e1' },
  dotDone: { backgroundColor: Colors.emerald },
  hint: { ...Text_.micro, color: Colors.ink3, textAlign: 'center', marginTop: Spacing.xl },
  action: { marginTop: Spacing.xl },
});
