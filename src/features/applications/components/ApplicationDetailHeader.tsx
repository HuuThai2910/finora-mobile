import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH } from '@/theme';
import { APPLICATIONS_BACKGROUND, APPLICATION_LIST_PADDING, DETAIL_HEADER_TEXT_LIMIT } from '../constant';
import { ApplicationsTopArt } from './ApplicationsBackdrop';

type Props = {
  /** Bề rộng cột nội dung (đã giới hạn trên web). */
  width: number;
  topInset: number;
  /** Dòng tóm tắt "Vay kinh doanh 60 triệu · 18 tháng · nộp 09/11/2026"; `null` khi đang tải. */
  summary?: string | null;
  /** "Mã hồ sơ HS-…"; `null` khi chưa tải hoặc backend chưa trả mã hiển thị. */
  codeLine?: string | null;
};

const TOP_GAP = 6;
/** Kéo nút quay lại sát lề để mũi tên thẳng hàng mép thẻ; vùng chạm vẫn đủ 44pt. */
const BACK_PULL = 12;
/**
 * Khoảng trống tối thiểu giữa khối chữ và vật thể gần nhất của hình minh hoạ
 * (tờ giấy mờ). Đủ để mã hồ sơ 21 ký tự cỡ 11pt nằm trọn một dòng ở màn 360pt.
 */
const TEXT_GAP = 4;

/**
 * Đầu màn chi tiết nằm thẳng trên nền sóng như mockup: mũi tên quay lại, tiêu
 * đề, dòng tóm tắt khoản vay và mã hồ sơ `HS-…` bên trái hình minh hoạ tập hồ
 * sơ. Mã kỹ thuật `LA-…` không hiện. Mã hồ sơ chọn được để sao chép bằng thao
 * tác nhấn giữ của hệ điều hành; app chưa có thư viện clipboard nên không vẽ
 * nút sao chép.
 */
export default function ApplicationDetailHeader({ width, topInset, summary, codeLine }: Props) {
  const nav = useNavigation();
  // Mở từ lối tắt ở trang chủ thì stack Hồ sơ có thể chỉ có màn này; quay lại vẫn
  // được nhờ lịch sử tab, nên hỏi `canGoBack` của cả cây điều hướng.
  const canGoBack = nav.canGoBack();

  // Khối chữ dừng trước hình minh hoạ; chữ phóng to theo cỡ chữ hệ thống thì
  // xuống dòng chứ không đè lên hình.
  const scale = width / APPLICATIONS_BACKGROUND.width;
  const textLeft = APPLICATION_LIST_PADDING + (canGoBack ? MIN_TOUCH - BACK_PULL : 0);
  const textMaxWidth = DETAIL_HEADER_TEXT_LIMIT * scale - TEXT_GAP - textLeft;

  return (
    <View style={[styles.root, { paddingTop: topInset + TOP_GAP }]}>
      <ApplicationsTopArt width={width} topInset={topInset} />

      <View style={styles.row}>
        {canGoBack ? (
          <Pressable
            onPress={() => nav.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Icon name="chevronLeft" size={24} color={Colors.authInk} strokeWidth={2.2} />
          </Pressable>
        ) : null}

        <View style={[styles.text, { maxWidth: textMaxWidth }]}>
          <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
            Chi tiết hồ sơ vay
          </Text>
          {summary ? (
            <Text style={styles.summary} maxFontSizeMultiplier={1.3}>
              {summary}
            </Text>
          ) : null}
          {codeLine ? (
            <Text style={styles.number} selectable maxFontSizeMultiplier={1.2}>
              {codeLine}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Tràn ra hai mép cột để ảnh nền phủ trọn bề rộng; chữ vẫn giữ lề của thẻ.
  root: {
    marginHorizontal: -APPLICATION_LIST_PADDING,
    paddingHorizontal: APPLICATION_LIST_PADDING,
    overflow: 'visible',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  back: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: -BACK_PULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  // Tâm dòng tiêu đề thẳng hàng tâm mũi tên (giữa vùng chạm 44pt).
  text: { flexShrink: 1, paddingTop: 9, gap: 1 },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.2,
    color: Colors.authInk,
  },
  // `authMuted` chỉ đạt ~3,4:1 trên dải sóng đậm nhất quanh đầu trang (đo ở màn
  // danh sách cùng ảnh); `ink2` vẫn là chữ phụ nhưng giữ được mức AA.
  summary: { fontFamily: FontFamily.semibold, fontSize: 12.5, lineHeight: 18, color: Colors.authInk },
  number: { fontFamily: FontFamily.regular, fontSize: 11, lineHeight: 16, color: Colors.ink2 },
});
