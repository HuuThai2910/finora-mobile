import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, Spacing, tabularNums } from '@/theme';
import type { AssistantCard, CardItem } from '@/types/assistant';

/** Cột bảng đủ rộng cho "25/10/2026" hay "2.350.000 đ"; bảng nhiều cột thì cuộn ngang. */
const COLUMN_MIN_WIDTH = 92;

/**
 * Thẻ số liệu trong câu trả lời. Mọi giá trị là chuỗi server đã định dạng từ API của chính người
 * dùng (spec mục 5), nên thẻ chỉ trình bày, không tính hay đổi định dạng lại.
 */
export default function AssistantCardView({ card }: { card: AssistantCard }) {
  return (
    <View style={styles.card}>
      {card.title ? (
        <Text style={styles.title} accessibilityRole="header">
          {card.title}
        </Text>
      ) : null}
      {card.kind === 'kv' ? <KeyValues items={card.items} /> : null}
      {card.kind === 'table' ? <Table columns={card.columns} rows={card.rows} /> : null}
      {card.kind === 'progress' ? <Progress value={card.value ?? 0} max={card.max ?? 0} label={card.label} /> : null}
    </View>
  );
}

function KeyValues({ items }: { items: readonly CardItem[] }) {
  return (
    <View>
      {items.map((item, index) => (
        <View key={`${item.label}-${index}`} style={[styles.kvRow, index > 0 && styles.divided]}>
          <Text style={styles.kvLabel}>{item.label}</Text>
          <Text style={styles.kvValue} selectable>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Table({ columns, rows }: { columns: readonly string[]; rows: readonly string[][] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
      <View>
        <View style={styles.tableHead}>
          {columns.map((column, index) => (
            <Text key={`${column}-${index}`} style={[styles.cell, styles.headCell]}>
              {column}
            </Text>
          ))}
        </View>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.tableRow, rowIndex > 0 && styles.divided]}>
            {columns.map((column, index) => (
              <Text key={`${column}-${index}`} style={styles.cell} selectable>
                {row[index] ?? ''}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Progress({ value, max, label }: { value: number; max: number; label: string | null }) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={styles.progress}>
      <ProgressBar percent={percent} label={label ?? undefined} />
      {label ? <Text style={styles.progressLabel}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.scheduleTile,
  },
  title: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authInk },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.lg, paddingVertical: 6 },
  divided: { borderTopWidth: 1, borderTopColor: Colors.rowDivider },
  kvLabel: { flexShrink: 1, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  kvValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: FontFamily.semibold,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authInk,
    ...tabularNums,
  },
  tableHead: { flexDirection: 'row', paddingBottom: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 6 },
  cell: {
    minWidth: COLUMN_MIN_WIDTH,
    paddingRight: Spacing.md,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authInk,
    ...tabularNums,
  },
  headCell: { fontFamily: FontFamily.semibold, color: Colors.authMuted },
  progress: { gap: Spacing.sm },
  progressLabel: { fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 19, color: Colors.authInk, ...tabularNums },
});
