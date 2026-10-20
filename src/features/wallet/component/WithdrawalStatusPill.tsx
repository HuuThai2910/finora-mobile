import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius } from '@/theme';
import type { WithdrawalStatusView, WithdrawalTone } from '../mappers/withdrawal';

const TONE_COLORS: Record<WithdrawalTone, { bg: string; fg: string }> = {
  blue: { bg: Colors.blueBg, fg: Colors.tagBlueText },
  amber: { bg: Colors.amberBg, fg: Colors.tagAmberText },
  green: { bg: Colors.greenBg, fg: Colors.tagGreenText },
  red: { bg: Colors.redBg, fg: Colors.tagRedText },
  gray: { bg: Colors.grayBg, fg: Colors.tagGrayText },
};

/** Nhãn trạng thái lệnh rút: luôn có chữ, màu chỉ bổ trợ. */
export default function WithdrawalStatusPill({ status }: { status: WithdrawalStatusView }) {
  const tone = TONE_COLORS[status.tone];
  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
      <Text style={[styles.text, { color: tone.fg }]} numberOfLines={1} maxFontSizeMultiplier={1.4}>
        {status.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-start', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  text: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 17 },
});
