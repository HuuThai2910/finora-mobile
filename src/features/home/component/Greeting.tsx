import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/theme';

type Props = {
  /** Họ tên trên hồ sơ; chưa quét eKYC thì chưa có. */
  fullName: string | null | undefined;
};

/** Cột lời chào đứng cạnh thẻ giới thiệu, hẹp nên chỉ phóng chữ hệ thống tới mức này. */
const MAX_FONT_SCALE = 1.2;

/**
 * Tên gọi là chữ cuối của họ tên trên CCCD, viết hoa chữ đầu ("HẢI" → "Hải").
 * Chưa có tên thì gọi "bạn" chứ không lấy email thay tên.
 */
function givenNameOf(fullName: string | null | undefined): string {
  const last = fullName?.trim().split(/\s+/).slice(-1)[0] ?? '';
  return last ? last.charAt(0).toUpperCase() + last.slice(1).toLowerCase() : 'bạn';
}

export default function Greeting({ fullName }: Props) {
  const name = givenNameOf(fullName);

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="header"
      accessibilityLabel={`Xin chào, ${name}. Chúc bạn một ngày tốt lành!`}
    >
      <Text style={styles.hello} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Xin chào,
      </Text>
      {/* Tên dài thì thu nhỏ cho vừa một dòng thay vì đẩy lời chúc xuống. */}
      <Text
        style={styles.name}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {name} 👋
      </Text>
      <Text style={styles.wish} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Chúc bạn một ngày tốt lành!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 102 },
  hello: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    lineHeight: 21,
    color: Colors.authInk,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: Colors.authInk,
  },
  wish: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.authMuted,
    marginTop: 4,
  },
});
