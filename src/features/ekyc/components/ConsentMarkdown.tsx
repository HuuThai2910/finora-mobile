import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BeVietnamPro_400Regular_Italic, useFonts } from '@expo-google-fonts/be-vietnam-pro';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, LineHeight, Spacing, Text_, lh } from '@/theme';
import { parseConsentMarkdown, type InlineSpan, type MarkdownBlock } from '../mappers/consentMarkdown';

const ITALIC_FAMILY = 'BeVietnamPro_400Regular_Italic';

/**
 * Hiển thị nội dung điều khoản (Markdown đơn giản do server trả) bằng Text gốc của React
 * Native, giữ cỡ chữ theo thiết lập trợ năng của máy.
 *
 * Font nghiêng chỉ nạp khi màn điều khoản mở (app không nạp sẵn); chưa nạp xong thì chữ
 * nghiêng tạm hiện bằng nét đậm vừa để vẫn tách được khỏi chữ thường.
 */
export default function ConsentMarkdown({ body }: { body: string }) {
  const [italicLoaded] = useFonts({ [ITALIC_FAMILY]: BeVietnamPro_400Regular_Italic });
  const blocks = useMemo(() => parseConsentMarkdown(body), [body]);

  return (
    <View style={styles.wrap}>
      {blocks.map((block, index) => (
        <Block key={index} block={block} italicLoaded={italicLoaded} />
      ))}
    </View>
  );
}

function Block({ block, italicLoaded }: { block: MarkdownBlock; italicLoaded: boolean }) {
  if (block.kind === 'divider') return <View style={styles.divider} />;

  const content = <Spans spans={block.spans} italicLoaded={italicLoaded} />;
  switch (block.kind) {
    case 'heading':
      return (
        <Text style={styles.heading} accessibilityRole="header">
          {content}
        </Text>
      );
    case 'label':
      return (
        <Text style={styles.label} accessibilityRole="header">
          {content}
        </Text>
      );
    case 'bullet':
      return (
        <View style={styles.bulletRow}>
          <Text style={styles.bulletDot} aria-hidden>
            •
          </Text>
          <Text style={[styles.body, styles.bulletText]}>{content}</Text>
        </View>
      );
    default:
      return <Text style={styles.body}>{content}</Text>;
  }
}

function Spans({ spans, italicLoaded }: { spans: InlineSpan[]; italicLoaded: boolean }) {
  return (
    <>
      {spans.map((span, index) => {
        if (span.bold) {
          return (
            <Text key={index} style={styles.bold}>
              {span.text}
            </Text>
          );
        }
        if (span.italic) {
          return (
            <Text key={index} style={italicLoaded ? styles.italic : styles.italicFallback}>
              {span.text}
            </Text>
          );
        }
        return span.text;
      })}
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md },
  heading: { ...Text_.title, color: Colors.ink, marginBottom: Spacing.xs },
  label: { ...Text_.bodyBold, color: Colors.ink, marginTop: Spacing.lg },
  body: { ...Text_.micro, color: Colors.ink2 },
  bulletRow: { flexDirection: 'row', gap: Spacing.md, paddingLeft: Spacing.xs },
  bulletDot: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.micro,
    lineHeight: lh(FontSize.micro, LineHeight.body),
    color: Colors.brand,
  },
  bulletText: { flex: 1 },
  bold: { fontFamily: FontFamily.bold, color: Colors.ink },
  italic: { fontFamily: ITALIC_FAMILY },
  italicFallback: { fontFamily: FontFamily.medium },
  divider: { height: 1, backgroundColor: Colors.line, marginVertical: Spacing.lg },
});
