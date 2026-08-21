import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { Icon } from '@/components/ui';
import { APP_NAME, APP_TAGLINE } from '../constants';

/** Khối logo đầu màn đăng nhập — ô gradient `navy → brand` với icon chuỗi khối. */
export default function BrandMark() {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[Colors.navy, Colors.brand]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.badge}
      >
        <Icon name="chain" size={45} color={Colors.cyanBright} />
      </LinearGradient>
      <Text style={styles.name}>{APP_NAME}</Text>
      <Text style={styles.tagline}>{APP_TAGLINE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.sm },
  badge: {
    width: 90,
    height: 90,
    borderRadius: Radius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  name: { ...Text_.display, color: Colors.ink },
  tagline: { ...Text_.micro, color: Colors.ink3 },
});
