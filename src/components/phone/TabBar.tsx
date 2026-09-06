import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
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
  const focusedTab = state.routes[state.index];
  const focusedNestedRoute = getFocusedRouteNameFromRoute(focusedTab);

  // Phòng đọc hợp đồng cần toàn bộ chiều cao màn hình và không phải nơi đổi tác vụ.
  // Ẩn tab bar tại đây để tài liệu không bị cắt hoặc trông như một màn hình hồ sơ thông thường.
  if (focusedNestedRoute === 'ContractDocument') return null;

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + Spacing.sm }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
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
