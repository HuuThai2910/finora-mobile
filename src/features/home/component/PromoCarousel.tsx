import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import type { IconName } from '@/constants/icons';
import { FontFamily, SoftShadow } from '@/theme';
import { Icon } from '@/components/ui';
import type { PromoSlide, PromoTarget } from '../constant';

type Props = {
  slides: readonly PromoSlide[];
  onOpen: (target: PromoTarget) => void;
};

const HEIGHT = 108;
const BORDER = 1;
/** Chiều cao lòng thẻ (trừ viền), cũng là chiều cao mỗi trang. */
const INNER_HEIGHT = HEIGHT - 2 * BORDER;
/** Vùng bên phải dành cho nút mũi tên, tính cả lề. */
const CHEVRON_ZONE = 42;
/** Thẻ hẹp, chữ to hơn mức này sẽ tràn khỏi ba dòng. */
const MAX_FONT_SCALE = 1.15;

/**
 * Thẻ giới thiệu cạnh lời chào: lướt ngang từng trang, chấm dưới cho biết đang
 * ở trang nào. Không tự chạy: người dùng đang đọc thì thẻ không được tự đổi,
 * và không cần xử lý riêng cho người bật giảm chuyển động.
 */
export default function PromoCarousel({ slides, onOpen }: Props) {
  // Mỗi trang rộng đúng bằng lòng thẻ, mà thẻ co giãn theo màn nên phải đo mới
  // biết. Trừ viền hai bên: trang rộng hơn khung cuộn dù 1pt thì lướt sang trang
  // sau vẫn còn lộ một vệt của trang trước.
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  return (
    <View style={styles.shadow}>
      <View style={styles.card} onLayout={e => setWidth(e.nativeEvent.layout.width - 2 * BORDER)}>
        {width > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            // Web không có sự kiện dừng quán tính, nên tính trang ngay khi cuộn.
            onScroll={e => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {slides.map((slide, i) => (
              <Slide
                key={slide.target}
                slide={slide}
                width={width}
                position={i + 1}
                total={slides.length}
                onPress={() => onOpen(slide.target)}
              />
            ))}
          </ScrollView>
        ) : null}

        <View
          style={styles.dots}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {slides.map((slide, i) => (
            <View key={slide.target} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      </View>
    </View>
  );
}

type SlideProps = {
  slide: PromoSlide;
  width: number;
  position: number;
  total: number;
  onPress: () => void;
};

function Slide({ slide, width, position, total, onPress }: SlideProps) {
  // Hình minh hoạ co theo bề rộng thẻ để máy màn hẹp vẫn chừa đủ chỗ cho chữ.
  const art = Math.min(80, Math.max(58, width * 0.32));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={slide.title.replace(/ /g, ' ')}
      accessibilityHint={`${slide.hint}. Thẻ ${position} trên ${total}.`}
      style={({ pressed }) => [styles.slide, { width }, pressed && styles.pressed]}
    >
      <Text
        style={[styles.title, { width: width - 16 - art - CHEVRON_ZONE }]}
        numberOfLines={3}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {slide.title}
      </Text>

      <View style={[styles.art, { right: CHEVRON_ZONE - 4, top: (INNER_HEIGHT - art) / 2 }]}>
        <PromoArt icon={slide.icon} size={art} />
      </View>

      <View style={styles.chevron}>
        <Icon name="chevronRight" size={16} color={Colors.onDark} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

/**
 * Mockup dùng hình 3D (tấm bìa kẹp giấy có dấu tích). Ở đây dựng lại bằng icon
 * Lucide trên ô chuyển màu nghiêng nhẹ, cùng tông với logo, để cả ba thẻ có
 * chung một kiểu minh hoạ.
 */
function PromoArt({ icon, size }: { icon: IconName; size: number }) {
  const tile = size * 0.66;

  return (
    <View style={[styles.artBox, { width: size, height: size }]}>
      <View style={[styles.glow, { width: size, height: size, borderRadius: size / 2 }]} />
      <View style={[styles.tileShadow, { borderRadius: tile * 0.27 }]}>
        <LinearGradient
          colors={[Colors.authLogoLight, Colors.authPrimary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.tile, { width: tile, height: tile, borderRadius: tile * 0.27 }]}
        >
          <Icon name={icon} size={tile * 0.55} color={Colors.onDark} strokeWidth={2} />
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Bóng đặt ở lớp ngoài: lớp trong phải cắt góc (overflow) cho trang trượt,
  // mà iOS cắt luôn cả bóng của chính lớp đó.
  shadow: { flex: 1, borderRadius: 16, ...SoftShadow.glass },
  card: {
    height: HEIGHT,
    borderRadius: 16,
    borderWidth: BORDER,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glass,
    overflow: 'hidden',
  },
  slide: { height: INNER_HEIGHT, paddingLeft: 16, paddingTop: 16 },
  pressed: { opacity: 0.7 },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    lineHeight: 20,
    color: Colors.authPrimary,
  },
  art: { position: 'absolute' },
  artBox: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', backgroundColor: Colors.glowBlue },
  // Nền đặc cùng màu ô để Android có hình mà đổ bóng; ô chuyển màu phủ kín lên trên.
  tileShadow: {
    transform: [{ rotate: '-8deg' }],
    backgroundColor: Colors.authPrimary,
    ...SoftShadow.raised,
  },
  tile: { alignItems: 'center', justifyContent: 'center' },
  chevron: {
    position: 'absolute',
    right: 10,
    top: 30,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.chipBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.dotIdle },
  dotActive: { backgroundColor: Colors.authPrimary },
});
