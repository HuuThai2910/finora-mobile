import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StackActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, IconSize, Spacing } from '@/theme';
import Icon from '@/components/ui/Icon';
import type { IconName } from '@/constants/icons';

/** Bốn mục đúng theo hàm `TABBAR` của mockup. */
export const TAB_ICONS: Record<string, IconName> = {
  'Trang chủ': 'home',
  Sàn: 'search',
  Ví: 'wallet',
  'Hồ sơ': 'users',
};

/**
 * `.p-tabbar` của mockup.
 * Mục đang chọn phân biệt bằng cả màu lẫn chữ đậm, không chỉ bằng màu.
 */
export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + Spacing.sm }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (event.defaultPrevented) return;

          if (!focused) {
            navigation.navigate(route.name);
            return;
          }

          // Khi đang ở một màn con (ví dụ: Nạp tiền), bấm lại tab hiện tại phải
          // đưa người dùng về màn gốc của tab thay vì giữ nguyên màn con.
          const nestedNavigatorKey = route.state?.key;
          if (nestedNavigatorKey) {
            navigation.dispatch({
              ...StackActions.popToTop(),
              target: nestedNavigatorKey,
            });
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <Icon
              name={TAB_ICONS[label] ?? 'grid'}
              size={IconSize.lg}
              color={focused ? Colors.brand : Colors.ink3}
            />
            <Text style={[styles.label, focused ? styles.labelActive : styles.labelIdle]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    backgroundColor: Colors.card,
    paddingTop: Spacing.lg,
  },
  tab: { flex: 1, alignItems: 'center', gap: Spacing.xs, minHeight: 44, justifyContent: 'center' },
  pressed: { opacity: 0.6 },
  label: { fontSize: FontSize.caption },
  labelActive: { fontFamily: FontFamily.bold, color: Colors.brand },
  labelIdle: { fontFamily: FontFamily.medium, color: Colors.ink3 },
});
