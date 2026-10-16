import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { Field, Tag, type TagTone } from '@/components/ui';
import type { EkycFieldSource } from '@/types/ekyc';
import { SOURCE_LABEL } from '../constants/messages';
import type { DraftRow } from '../mappers/draftFields';

/**
 * Nguồn tất định (mã QR, dòng MRZ có chữ số kiểm tra) dùng tông xanh lá; chữ in đọc bằng OCR
 * tông xanh dương; AI tông hổ phách vì có thể đọc sai mà trông vẫn hợp lý; người dùng sửa tông
 * tím. Màu chỉ hỗ trợ — chữ trên nhãn mới là thông tin chính.
 */
const SOURCE_TONE: Record<EkycFieldSource, TagTone> = {
  QR: 'green',
  MRZ: 'green',
  OCR: 'blue',
  AI: 'amber',
  USER: 'violet',
};

type Props = {
  row: DraftRow;
  /** Giá trị đang hiển thị (đã gồm bản sửa của người dùng nếu có). */
  value: string;
  edited: boolean;
  error: string | null;
  onChange: (value: string) => void;
  last?: boolean;
};

/**
 * Một dòng của bản nháp: nhãn, giá trị (hoặc ô sửa nếu trường do AI đọc) và nhãn nguồn.
 * Trường người dùng đã sửa hiện "Bạn đã sửa" thay cho nhãn nguồn gốc.
 */
export default function DraftFieldRow({ row, value, edited, error, onChange, last = false }: Props) {
  const sources: EkycFieldSource[] = edited ? ['USER'] : row.field.sources;

  return (
    <View style={[styles.row, !last && styles.divider]}>
      {row.editable ? (
        <Field
          label={row.label}
          value={value}
          onChangeText={onChange}
          multiline={row.key === 'address' || row.key === 'birthRegistrationPlace'}
          autoCapitalize={row.key === 'fullName' ? 'characters' : 'sentences'}
          helper="AI đọc phần chữ trên thẻ — hãy đối chiếu và sửa nếu sai."
          error={error ?? undefined}
          style={styles.field}
        />
      ) : (
        <>
          <Text style={styles.label}>{row.label}</Text>
          {value ? <Text style={styles.value}>{value}</Text> : <Text style={styles.empty}>Không đọc được</Text>}
        </>
      )}

      {sources.length > 0 ? (
        <View style={styles.tags} accessibilityLabel={`Nguồn: ${sources.map(s => SOURCE_LABEL[s]).join(', ')}`}>
          {sources.map(source => (
            <Tag key={source} tone={SOURCE_TONE[source] ?? 'gray'} small>
              {SOURCE_LABEL[source] ?? source}
            </Tag>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: Spacing.xs, paddingVertical: Spacing.lg },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  field: { marginBottom: 0 },
  label: { ...Text_.micro, color: Colors.ink3 },
  value: { ...Text_.body, color: Colors.ink },
  empty: { ...Text_.body, color: Colors.ink3 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.xs },
});
