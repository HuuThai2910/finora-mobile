import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing, Text_, lh } from '@/theme';
import type { TermsBlock, TermsSection } from '../constants/termsOfUse';

/** Một mục điều khoản: tiêu đề đậm rồi các đoạn văn và danh sách gạch đầu dòng, cùng cỡ chữ với điều khoản eKYC. */
export default function TermsSectionView({ section }: { section: TermsSection }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title} accessibilityRole="header">
        {section.title}
      </Text>
      {section.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </View>
  );
}

function Block({ block }: { block: TermsBlock }) {
  if (typeof block === 'string') return <Text style={styles.body}>{block}</Text>;
  return (
    <View style={styles.list}>
      {block.map(item => (
        <View key={item} style={styles.bulletRow}>
          <Text style={styles.bulletDot} aria-hidden>
            •
          </Text>
          <Text style={[styles.body, styles.bulletText]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.md },
  title: { ...Text_.bodyBold, color: Colors.authInk },
  body: { ...Text_.micro, color: Colors.ink2 },
  list: { gap: Spacing.sm },
  bulletRow: { flexDirection: 'row', gap: Spacing.md, paddingLeft: Spacing.xs },
  bulletDot: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.micro,
    lineHeight: lh(FontSize.micro),
    color: Colors.authPrimary,
  },
  bulletText: { flex: 1 },
});
