import { useCallback, useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/** Cách đáy bao nhiêu point thì coi như đã đọc tới cuối (bù lề và làm tròn số đo). */
const END_SLACK = 24;

/**
 * Theo dõi người dùng đã cuộn tới cuối một `ScrollView` chưa — điều kiện để bật ô đồng ý
 * điều khoản eKYC. Nội dung ngắn hơn khung (máy màn lớn, chữ nhỏ) thì coi như đã đọc hết.
 * Đã chạm đáy một lần thì giữ nguyên, cuộn lên đọc lại không làm khoá ô. Đổi `resetKey`
 * (nội dung mới) thì phải đọc lại từ đầu.
 *
 * Trả về `scrollProps` để gắn thẳng vào `ScrollView`.
 */
export function useScrolledToEnd(resetKey: unknown) {
  const [reachedEnd, setReachedEnd] = useState(false);
  const viewport = useRef(0);
  const content = useRef(0);

  useEffect(() => {
    setReachedEnd(false);
  }, [resetKey]);

  const checkShortContent = useCallback(() => {
    if (viewport.current > 0 && content.current > 0 && content.current <= viewport.current + END_SLACK) {
      setReachedEnd(true);
    }
  }, []);

  const scrollProps = {
    scrollEventThrottle: 64,
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - END_SLACK) setReachedEnd(true);
    },
    onLayout: (e: LayoutChangeEvent) => {
      viewport.current = e.nativeEvent.layout.height;
      checkShortContent();
    },
    onContentSizeChange: (_width: number, height: number) => {
      content.current = height;
      checkShortContent();
    },
  };

  return { reachedEnd, scrollProps };
}
