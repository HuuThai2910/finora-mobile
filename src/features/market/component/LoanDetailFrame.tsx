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
import { FUNDING_STATE_BADGE, MARKET_MAX_WIDTH, MARKET_PADDING } from '../constant';
import type { FundingState } from '../investRules';

type Props = {
  title: string;
  /** Trạng thái đợt gọi vốn, hiện thành dòng phụ dưới tiêu đề; chưa có dữ liệu thì bỏ trống. */
  state?: FundingState;
  /** Kéo xuống để tải lại; bỏ trống khi màn không có gì để làm mới. */
  refresh?: { refreshing: boolean; onRefresh: () => void };
  /** Vùng ghim đáy (nút đặt lệnh), nằm ngoài vùng cuộn để bàn phím mở không che nút. */
  footer?: React.ReactNode;
  children: React.ReactNode;
};

/** Kéo nút quay lại sát lề để mũi tên gần thẳng hàng mép thẻ; vùng chạm vẫn đủ 44pt. */
const BACK_PULL = 12;

/**
 * Khung màn chi tiết khoản vay, cùng bộ với sổ lệnh và form đặt lệnh của chợ Notes: nền sóng trang
 * chủ cuộn theo nội dung, cột cỡ điện thoại ở giữa trên web, đầu màn có nút quay lại, tiêu đề màu
 * mực xanh và trạng thái đợt gọi vốn (chấm màu luôn kèm chữ).
 */
export default function LoanDetailFrame({ title, state, refresh, footer, children }: Props) {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, MARKET_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn để lớp sóng đáy nằm sát đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);
  const badge = state ? FUNDING_STATE_BADGE[state] : null;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
        refreshControl={
          refresh ? (
            <RefreshControl
              refreshing={refresh.refreshing}
              onRefresh={refresh.onRefresh}
              // iOS đọc `tintColor`, Android đọc `colors`.
              tintColor={Colors.authPrimary}
              colors={[Colors.authPrimary]}
            />
          ) : undefined
        }
      >
        <View style={{ width, minHeight: viewportHeight }}>
          <WaveBackdrop background={HOME_WAVES} width={width} />
          <View style={styles.content}>
            <View style={[styles.header, { paddingTop: insets.top + Spacing.xs }]}>
              {nav.canGoBack() ? (
                <Pressable
                  onPress={() => nav.goBack()}
                  accessibilityRole="button"
                  accessibilityLabel="Quay lại"
                  style={({ pressed }) => [styles.back, pressed && styles.pressed]}
                >
                  <Icon name="chevronLeft" size={26} color={Colors.authInk} strokeWidth={2.2} />
                </Pressable>
              ) : null}
              <View style={styles.titleBlock}>
                <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.5}>
                  {title}
                </Text>
                {/* Trạng thái nằm dưới tiêu đề như dòng phụ của đầu màn đặt lệnh: mã khoản vay dài
                    hay chữ phóng to cũng không đẩy tiêu đề xuống dòng giữa mã. */}
                {badge ? (
                  <View style={styles.status} accessible accessibilityLabel={`Trạng thái: ${badge.label}`}>
                    <View style={[styles.dot, { backgroundColor: badge.dot }]} />
                    <Text style={styles.statusText} maxFontSizeMultiplier={1.4}>
                      {badge.label}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
            {children}
          </View>
        </View>
      </ScrollView>
      {footer}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Nền trùng hàng trên cùng của ảnh sóng: phủ hai bên cột trên web và phần lộ ra khi kéo làm mới.
  root: { flex: 1, backgroundColor: Colors.homeWaveTop },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { gap: Spacing.xl, paddingHorizontal: MARKET_PADDING, paddingBottom: Spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingBottom: Spacing.xs },
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: -BACK_PULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  titleBlock: { flex: 1, paddingTop: 8 },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: Colors.authInk,
  },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
});
