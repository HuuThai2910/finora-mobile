import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing } from '@/theme';
import type { AssistantCitation } from '@/types/assistant';
import { CITATION_KIND } from '../constants';
import { formatCheckedAt } from '../mappers/chatResponse';

/**
 * Dòng "Căn cứ" dưới câu trả lời. Mỗi căn cứ có nhãn loại (quy định pháp luật, chính sách FINORA,
 * chưa xác minh nguồn, hướng dẫn) để người dùng không nhầm chính sách của sàn với luật. Căn cứ pháp
 * luật có nút mở văn bản chính thức; mapper đã bỏ mọi link không phải https.
 */
export default function CitationList({ citations }: { citations: readonly AssistantCitation[] }) {
  if (citations.length === 0) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading} accessibilityRole="header">
        Căn cứ
      </Text>
      {citations.map((citation, index) => (
        <CitationRow key={`${citation.id}-${index}`} citation={citation} />
      ))}
    </View>
  );
}

function CitationRow({ citation }: { citation: AssistantCitation }) {
  const meta = CITATION_KIND[citation.kind];
  const checked = formatCheckedAt(citation.checkedAt);
  const url = citation.url;

  const open = () => {
    if (!url) return;
    Linking.openURL(url).catch(() =>
      Alert.alert('Không mở được văn bản', `Bạn có thể tìm văn bản theo tên: ${citation.label}`),
    );
  };

  return (
    <View style={styles.row}>
      <Tag small tone={meta.tone} style={styles.tag}>
        {meta.label}
      </Tag>
      <Text style={styles.label}>{citation.label}</Text>
      {checked ? <Text style={styles.checked}>Kiểm ngày {checked}</Text> : null}
      {url ? (
        <Pressable
          onPress={open}
          accessibilityRole="link"
          accessibilityLabel={`Mở văn bản ${citation.label}`}
          hitSlop={8}
          style={({ pressed }) => [styles.link, pressed && styles.pressed]}
        >
          <Text style={styles.linkText}>Mở văn bản</Text>
          <Icon name="arrowUpRight" size={16} color={Colors.authPrimary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  heading: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 18, color: Colors.authMuted },
  row: { gap: 4 },
  tag: { alignSelf: 'flex-start' },
  label: { fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 19, color: Colors.authInk },
  checked: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  link: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, minHeight: 32 },
  pressed: { opacity: 0.6 },
  linkText: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 18, color: Colors.authPrimary },
});
