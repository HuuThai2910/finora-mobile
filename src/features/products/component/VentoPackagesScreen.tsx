import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { IconSize, Radius, Spacing, Text_ } from '@/theme';
import { PHeader, Screen } from '@/components/phone';
import { Icon } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import type { MarketStackParamList } from '@/navigation/types';
import { useVentoPackages } from '../hook/useProducts';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'VentoPackages'>;

/** Màn 27 — gói vay ưu đãi (thẻ nền navy, khác cách trình bày với màn Sản phẩm vay). */
export default function VentoPackagesScreen() {
  const nav = useNavigation<Nav>();
  const { data, loading, error, reload } = useVentoPackages();

  return (
    <Screen>
      <PHeader
        title="Gói vay ưu đãi"
        back
        right={<Icon name="search" size={IconSize.sm} color={Colors.ink2} />}
      />

      <Text style={styles.lead}>Chọn gói phù hợp — lãi suất ưu đãi theo sản phẩm</Text>

      {loading ? (
        <LoadingScreen cards={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        data?.map(pkg => (
          <Pressable
            key={pkg.code}
            onPress={() => nav.navigate('PackageDetail', { code: pkg.code })}
            accessibilityRole="button"
            accessibilityLabel={`${pkg.name}, ${pkg.rateLabel}`}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.left}>
              <View style={styles.icon}>
                <Icon name="coins" size={IconSize.lg} color={Colors.onDark} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{pkg.name}</Text>
                <Text style={styles.meta}>
                  {pkg.code} · {pkg.method}
                </Text>
              </View>
            </View>

            <View style={styles.right}>
              <Text style={styles.rate}>{pkg.rateLabel}</Text>
              <Icon name="chevronRight" size={IconSize.xs} color={Colors.onDarkMuted} />
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { ...Text_.micro, color: Colors.ink3, marginBottom: Spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    backgroundColor: Colors.navy,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  pressed: { opacity: 0.8 },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, flexShrink: 1 },
  icon: {
    width: 54,
    height: 54,
    borderRadius: Radius.md,
    backgroundColor: Colors.onDarkFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flexShrink: 1, gap: 2 },
  name: { ...Text_.bodyBold, color: Colors.onDark },
  meta: { ...Text_.caption, color: Colors.onDarkMuted },
  right: { alignItems: 'flex-end', gap: Spacing.xs },
  rate: { ...Text_.bodyBold, color: '#6ee7b7' },
});
