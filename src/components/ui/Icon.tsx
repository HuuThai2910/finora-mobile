import Svg, { Circle, Ellipse, Line, Path, Polyline, Rect } from 'react-native-svg';
import { ICONS, type IconName, type IconShape } from '@/constants/icons';
import { Colors } from '@/constants/colors';
import { IconSize } from '@/theme';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  /** Độ dày nét — mockup dùng 2 trên viewBox 24. */
  strokeWidth?: number;
};

/**
 * Dựng lại hàm `IC()` của mockup bằng react-native-svg.
 * Icon là hình trang trí đi kèm nhãn chữ nên đánh dấu ẩn với trình đọc màn hình;
 * nút chỉ có icon phải tự đặt `accessibilityLabel` ở phía ngoài.
 */
export default function Icon({
  name,
  size = IconSize.md,
  color = Colors.ink,
  strokeWidth = 2,
}: Props) {
  const shapes = ICONS[name] as readonly IconShape[];

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      {shapes.map((s, i) => {
        switch (s.t) {
          case 'path':
            return <Path key={i} d={s.d} />;
          case 'circle':
            return <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} />;
          case 'rect':
            return <Rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} />;
          case 'ellipse':
            return <Ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />;
          case 'line':
            return <Line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />;
          case 'polyline':
            return <Polyline key={i} points={s.points} />;
        }
      })}
    </Svg>
  );
}
