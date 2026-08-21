import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { SCREEN_PADDING, Spacing } from '@/theme';

type Props = {
  children: React.ReactNode;
  /** Không cuộn — dùng cho màn có danh sách tự cuộn bên trong. */
  scroll?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Nội dung ghim đáy màn (nút hành động chính). */
  footer?: React.ReactNode;
  /** Nền trắng thay vì nền canvas — vài màn trong mockup dùng nền trắng. */
  light?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * `.scr` của mockup — vùng nội dung bên trong khung máy.
 * Chịu trách nhiệm lề ngang chuẩn, vùng an toàn (tai thỏ, thanh cử chỉ) và
 * chừa chỗ cho tab bar để nội dung không bị che.
 */
export default function Screen({
  children,
  scroll = true,
  onRefresh,
  refreshing = false,
  footer,
  light = false,
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const bg = light ? Colors.card : Colors.bg;

  const padding = {
    paddingTop: insets.top + Spacing.lg,
    paddingBottom: footer ? Spacing.xl : insets.bottom + Spacing.section,
  };

  if (!scroll) {
    return (
      <KeyboardAvoid bg={bg}>
        <View style={[styles.content, padding, style]}>{children}</View>
        {footer ? <Footer insets={insets.bottom}>{footer}</Footer> : null}
      </KeyboardAvoid>
    );
  }

  return (
    <KeyboardAvoid bg={bg}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, padding, style]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      {footer ? <Footer insets={insets.bottom}>{footer}</Footer> : null}
    </KeyboardAvoid>
  );
}

/**
 * Đẩy nội dung lên khi bàn phím mở để ô đang nhập (form đăng ký, ô OTP) không
 * bị che. iOS cần `padding`; Android đã thu nhỏ cửa sổ sẵn nhờ `adjustResize`
 * nên không đặt behavior để tránh cộng dồn hai lần.
 */
function KeyboardAvoid({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

function Footer({ children, insets }: { children: React.ReactNode; insets: number }) {
  return (
    <View style={[styles.footer, { paddingBottom: insets + Spacing.xl }]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: SCREEN_PADDING, flexGrow: 1 },
  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
});
