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
import { Colors } from '@/constants/colors';
import { Spacing } from '@/theme';
import { APPLICATION_LIST_MAX_WIDTH, APPLICATION_LIST_PADDING } from '../constant';
import ApplicationDetailHeader from './ApplicationDetailHeader';
import ApplicationsBackdrop from './ApplicationsBackdrop';

/** Đáy chừa một dải để lớp sóng đáy lộ ra dưới thẻ cuối, như màn danh sách hồ sơ. */
const BOTTOM_SPACE = 56;

type Props = {
  /** Mã hồ sơ in ở đầu trang; lấy từ tham số điều hướng nên có ngay cả khi đang tải. */
  applicationNumber: string;
  /** Kéo xuống để tải lại; bỏ trống ở lần tải đầu (đã có khung giả). */
  onRefresh?: () => void;
  refreshing?: boolean;
  children: React.ReactNode;
};

/**
 * Khung chung của màn chi tiết hồ sơ ở cả ba trạng thái (đang tải, lỗi, có dữ
 * liệu): nền sóng và hình minh hoạ dùng lại của màn danh sách (cùng ảnh), đầu
 * trang, rồi các thẻ. Bàn phím đẩy nội dung lên như `Screen` vì cuối màn có ô
 * nhập (lý do rút hồ sơ, lý do từ chối điều khoản).
 */
export default function ApplicationDetailScaffold({
  applicationNumber,
  onRefresh,
  refreshing = false,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, APPLICATION_LIST_MAX_WIDTH);

  return (
    <ApplicationsBackdrop width={width}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
          <ApplicationDetailHeader
            width={width}
            topInset={insets.top}
            applicationNumber={applicationNumber}
          />
          <View style={styles.cards}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ApplicationsBackdrop>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: APPLICATION_LIST_PADDING,
    paddingBottom: BOTTOM_SPACE,
  },
  cards: { gap: Spacing.lg, marginTop: Spacing.lg },
});
