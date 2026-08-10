import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, Radius, Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, Icon, SectionLabel, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import type { MarketStackParamList } from '@/navigation/types';
import { useVentoPackage } from '../hook/useProducts';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'PackageDetail'>;

/** Màn 28 — chi tiết gói "Vay học phí". */
export default function PackageDetailScreen() {
  const nav = useNavigation<Nav>();
  const { code } = useRoute<RouteProp<MarketStackParamList, 'PackageDetail'>>().params;
  const { data, loading, error, reload } = useVentoPackage(code);

  if (loading) return <Screen><LoadingScreen cards={2} /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!data) return null;

  return (
    <Screen
      footer={
        <Button
          label="Bắt đầu vay →"
          variant="navyPill"
          onPress={() => nav.navigate('Products')}
        />
      }
    >
      <PHeader
        title={data.name}
        back
        right={<Icon name="bell" size={IconSize.sm} color={Colors.ink2} />}
      />

      <View style={styles.head}>
        <View style={styles.avatar}>
          <Icon name="coins" size={IconSize.md} color={Colors.onDark} />
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{data.name}</Text>
            <Tag tone="green" small>{data.badge}</Tag>
          </View>
          <Text style={styles.code}>{data.code}</Text>
        </View>
      </View>

      <View style={styles.rateBox}>
        <Text style={styles.rateValue}>
          {data.annualRatePercent}%<Text style={styles.rateUnit}> / năm</Text>
        </Text>
        <Text style={styles.rateHint}>{data.monthlyRateLabel}</Text>
      </View>

      <PItem label="Kiểu tính lãi" icon="chart" value={data.method} />
      <PItem label="Hạn mức" icon="coins" value={data.amountRange} />
      <PItem label="Lãi suất tùy chọn" icon="sparkles" value={data.rateRange} />
      <PItem label="Kỳ hạn" icon="clock" value={data.termRange} last />

      <SectionLabel muted style={styles.section}>
        Tài liệu cần nộp
      </SectionLabel>

      {data.documents.map((doc, i) => (
        <PItem
          key={doc.label}
          label={doc.label}
          icon="file"
          value={doc.required ? <Tag tone="red" small>Bắt buộc</Tag> : <Tag tone="gray" small>Tùy chọn</Tag>}
          last={i === data.documents.length - 1}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.xl },
  avatar: {
    width: 63,
    height: 63,
    borderRadius: Radius.lg,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flexShrink: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexWrap: 'wrap' },
  name: { ...Text_.title, color: Colors.ink },
  code: { ...Text_.micro, color: Colors.ink3 },
  rateBox: {
    backgroundColor: Colors.brand50,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  rateValue: { fontFamily: FontFamily.extrabold, fontSize: FontSize.hero, color: Colors.brand },
  rateUnit: { fontFamily: FontFamily.semibold, fontSize: FontSize.body, color: Colors.brand },
  rateHint: { ...Text_.micro, color: Colors.ink3 },
  section: { marginTop: Spacing.xl },
});
