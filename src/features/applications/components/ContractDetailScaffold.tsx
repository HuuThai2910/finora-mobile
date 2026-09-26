import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WaveBackdrop } from '@/components/phone';
import { Icon } from '@/components/ui';
import { HOME_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Spacing } from '@/theme';
import { APPLICATION_LIST_MAX_WIDTH, APPLICATION_LIST_PADDING } from '../constant';

/** Đáy chừa một dải để lớp sóng đáy lộ ra dưới thẻ cuối. */
const BOTTOM_SPACE = 56;
/** Kéo nút quay lại sát lề để mũi tên thẳng hàng mép thẻ; vùng chạm vẫn đủ 44pt. */
const BACK_PULL = 12;

type Props = {
  /** Kéo xuống để tải lại; bỏ trống ở lần tải đầu (đã có khung giả). */
  onRefresh?: () => void;
  refreshing?: boolean;
  children: React.ReactNode;
};

/**
 * Khung màn chi tiết hợp đồng ở cả ba trạng thái (đang tải, lỗi, có dữ liệu):
 * nền sóng dùng chung với trang chủ theo mockup, nút quay lại và tiêu đề, rồi
 * các thẻ. Bàn phím đẩy nội dung lên vì cuối màn có ô nhập lý do từ chối.
 */
export default function ContractDetailScaffold({ onRefresh, refreshing = false, children }: Props) {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, APPLICATION_LIST_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn để lớp sóng đáy luôn sát đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        // react-native-web đóng bàn phím mỗi khi cuộn, kể cả khi trình duyệt tự
        // cuộn tới ô vừa chạm; ô lý do từ chối sẽ mất focus nếu để mặc định.
        keyboardDismissMode={Platform.OS === 'web' ? 'none' : 'on-drag'}
        showsVerticalScrollIndicator={false}
        onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              // iOS đọc `tintColor`, Android đọc `colors`.
              tintColor={Colors.authPrimary}
              colors={[Colors.authPrimary]}
            />
          ) : undefined
        }
      >
        <View style={{ width, minHeight: viewportHeight }}>
          <WaveBackdrop background={HOME_WAVES} width={width} />

          <View style={[styles.content, { paddingTop: insets.top + Spacing.xs }]}>
            <View style={styles.header}>
              {nav.canGoBack() ? (
                <Pressable
                  onPress={() => nav.goBack()}
                  accessibilityRole="button"
                  accessibilityLabel="Quay lại"
                  style={({ pressed }) => [styles.back, pressed && styles.pressed]}
                >
                  <Icon name="chevronLeft" size={24} color={Colors.authInk} strokeWidth={2.2} />
                </Pressable>
              ) : null}
              <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
                Chi tiết hợp đồng
              </Text>
            </View>

            <View style={styles.cards}>{children}</View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Nền trùng hàng trên cùng của ảnh sóng: kéo làm mới lộ ra phía trên vẫn liền màu.
  root: { flex: 1, backgroundColor: Colors.homeWaveTop },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { paddingHorizontal: APPLICATION_LIST_PADDING, paddingBottom: BOTTOM_SPACE },
  header: { flexDirection: 'row', alignItems: 'center', minHeight: MIN_TOUCH },
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: -BACK_PULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  title: {
    flexShrink: 1,
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.2,
    color: Colors.authInk,
  },
  cards: { gap: Spacing.lg, marginTop: Spacing.md },
});
