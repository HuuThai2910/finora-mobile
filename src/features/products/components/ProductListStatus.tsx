import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, SoftShadow, Spacing } from '@/theme';
import { EmptyState, ErrorState } from '@/components/feedback';
import ProductListSkeleton from './ProductListSkeleton';

type Props = {
  /** Lần tải đầu, chưa có dữ liệu nào để hiện. */
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Danh mục có ít nhất một sản phẩm (trước khi lọc theo từ khoá). */
  hasProducts: boolean;
  /** Từ khoá đang lọc, đã bỏ khoảng trắng hai đầu. */
  query: string;
};

/**
 * Nội dung thay chỗ danh sách khi chưa có thẻ nào để vẽ: đang tải, lỗi, danh mục
 * rỗng, hoặc từ khoá không khớp sản phẩm nào. Lỗi và thông báo nằm trong thẻ
 * trắng như thẻ sản phẩm để không chìm vào lớp sóng phía sau.
 */
export default function ProductListStatus({ loading, error, onRetry, hasProducts, query }: Props) {
  if (loading) return <ProductListSkeleton />;

  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : !hasProducts ? (
        <EmptyState
          icon="grid"
          title="Chưa có sản phẩm nào đang mở"
          hint={'Quay lại sau khi hệ thống\nkích hoạt sản phẩm mới.'}
        />
      ) : (
        // Không thêm nút "xoá từ khoá" ở đây: ô tìm kiếm ngay phía trên đã có nút xoá.
        <EmptyState
          icon="search"
          title="Không tìm thấy sản phẩm"
          hint={`Không có sản phẩm nào có tên chứa “${query}”.\nHãy thử từ khoá khác.`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    ...SoftShadow.card,
  },
});
