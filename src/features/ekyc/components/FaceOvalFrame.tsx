import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { Radius } from '@/theme';
import { decorativeSvgProps } from '@/components/ui';

type Props = {
  width: number;
  height: number;
  /** Đang quay: viền oval đổi màu để người dùng biết camera đang ghi. */
  recording: boolean;
  /** `CameraView` — vẽ bên dưới lớp phủ (CameraView không nhận children). */
  children: React.ReactNode;
};

/**
 * Khung oval tĩnh cho bước liveness. Phần ngoài oval phủ **trắng** thay vì tối: cùng với độ
 * sáng màn hình tối đa, mảng trắng quanh mặt thành đèn phụ chiếu lên khuôn mặt (Expo Go
 * không có đèn flash trước khi quay video).
 *
 * Expo Go không có frame processor nên khung không biết mặt đã vào chưa — chỉ là vạch dẫn,
 * server mới là nơi kiểm tra có đúng một khuôn mặt.
 */
export default function FaceOvalFrame({ width, height, recording, children }: Props) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.42;
  const ry = height * 0.45;
  // Hình chữ nhật trừ hình elip (luật tô evenodd): chỉ phần ngoài oval được tô trắng.
  const mask =
    `M0 0H${width}V${height}H0Z ` +
    `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;

  return (
    <View
      style={[styles.wrap, { width, height }]}
      accessible
      accessibilityLabel="Khung camera trước. Giữ khuôn mặt nằm trong hình bầu dục."
    >
      {children}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none" {...decorativeSvgProps}>
        <Path d={mask} fill={Colors.card} fillRule="evenodd" />
        <Ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={recording ? Colors.emerald : Colors.brand}
          strokeWidth={recording ? 5 : 3}
          strokeDasharray={recording ? undefined : '10 8'}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
});
