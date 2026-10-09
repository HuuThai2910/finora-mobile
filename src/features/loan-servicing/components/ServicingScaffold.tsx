import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WaveBackdrop } from '@/components/phone';
import { HOME_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';
import { SERVICING_BOTTOM_SPACE, SERVICING_MAX_WIDTH, SERVICING_PADDING } from '../constants';
import ServicingHeader from './ServicingHeader';

type Props = {
  title: string;
  subtitle?: string;
  headerSize?: 'list' | 'detail';
  /** Kéo xuống để tải lại; bỏ trống ở lần tải đầu (đã có khung giả). */
  onRefresh?: () => void;
  refreshing?: boolean;
  children: React.ReactNode;
};

/**
 * Khung các màn khoản vay đang trả ở mọi trạng thái (đang tải, lỗi, có dữ liệu), cùng
 * dáng màn "Chi tiết hợp đồng": nền sóng của trang chủ cuộn theo nội dung, đầu màn rồi
 * các thẻ cách nhau đều. Bàn phím đẩy nội dung lên vì màn cơ cấu có ô nhập lý do.
 */
export default function ServicingScaffold({
  title,
  subtitle,
  headerSize = 'detail',
  onRefresh,
  refreshing = false,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, SERVICING_MAX_WIDTH);
  // Nội dung cao ít nhất bằng khung cuộn để lớp sóng đáy luôn sát đáy màn.
  const [viewportHeight, setViewportHeight] = useState(0);

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        // react-native-web đóng bàn phím mỗi khi cuộn, kể cả khi trình duyệt tự cuộn
        // tới ô vừa chạm; ô lý do đề nghị sẽ mất focus nếu để mặc định.
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
            <ServicingHeader title={title} subtitle={subtitle} size={headerSize} />
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
  content: { paddingHorizontal: SERVICING_PADDING, paddingBottom: SERVICING_BOTTOM_SPACE },
  cards: { gap: Spacing.lg, marginTop: Spacing.md },
});
