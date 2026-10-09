import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, tabularNums } from '@/theme';
import type { BorrowerRuleResult } from '@/types/invest';
import { formatRuleValue, formatScore, splitRuleDescription } from '../borrowerDisplay';
import { ProfileCard, ProfileFootnote } from './ProfileCard';

/** Thanh điểm mảnh hơn thanh tiến độ gọi vốn: chỉ để so các luật với nhau. */
const BAR_HEIGHT = 6;

type Props = {
  rules: BorrowerRuleResult[];
  /** Tổng điểm theo bảng luật (0–100) do AI tính; app không cộng lại. */
  ruleScore: number | null;
};

/**
 * Bảng luật đã chấm, cùng nội dung bảng thẩm định viên xem nhưng không kèm giải thích SHAP: mỗi luật
 * đọc một số liệu của hồ sơ và cho điểm, điểm càng cao càng an toàn.
 */
export default function BorrowerRulesCard({ rules, ruleScore }: Props) {
  return (
    <ProfileCard title="Bảng luật đã chấm" aside={ruleScore == null ? undefined : `Tổng ${ruleScore}/100`}>
      {rules.length === 0 ? (
        <ProfileFootnote>Lần chấm điểm này không có bảng luật để hiển thị.</ProfileFootnote>
      ) : (
        <>
          {rules.map((rule, index) => (
            <RuleRow key={rule.code} rule={rule} first={index === 0} />
          ))}
          <ProfileFootnote>Mỗi luật cho điểm theo số liệu đọc được; điểm càng cao càng an toàn.</ProfileFootnote>
        </>
      )}
    </ProfileCard>
  );
}

function RuleRow({ rule, first }: { rule: BorrowerRuleResult; first: boolean }) {
  const { title, hint } = splitRuleDescription(rule.description);
  const missing = rule.missingData || rule.value === null;
  const value =
    missing || rule.value === null ? 'thiếu dữ liệu, tính điểm trung tính' : formatRuleValue(rule.field, rule.value);
  const weight = rule.weight != null && rule.weight !== 1 ? `, trọng số ${formatScore(rule.weight)}` : '';
  const points = rule.points == null || rule.maxPoints == null ? null : `${rule.points}/${rule.maxPoints}`;
  const ratio =
    rule.points != null && rule.maxPoints ? Math.min(Math.max(rule.points / rule.maxPoints, 0), 1) : 0;

  return (
    <View
      style={[styles.row, !first && styles.rowDivided]}
      accessible
      accessibilityLabel={`${title}. Giá trị đọc được: ${value}${weight}. Điểm ${points ?? 'chưa có'}`}
    >
      <View style={styles.line}>
        <Text style={styles.title} maxFontSizeMultiplier={1.4}>
          {title}
        </Text>
        {points ? (
          <Text style={styles.points} maxFontSizeMultiplier={1.3}>
            {points}
          </Text>
        ) : null}
      </View>
      {hint ? (
        <Text style={styles.hint} maxFontSizeMultiplier={1.4}>
          {hint}
        </Text>
      ) : null}
      <Text style={[styles.value, missing && styles.valueMissing]} maxFontSizeMultiplier={1.4}>
        {`Giá trị đọc được: ${value}${weight}`}
      </Text>
      {points ? (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 3, paddingVertical: 12 },
  rowDivided: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.authBorder },
  line: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.lg },
  title: { flex: 1, fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authInk },
  points: { fontFamily: FontFamily.bold, fontSize: 14, lineHeight: 20, color: Colors.authInk, ...tabularNums },
  hint: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted },
  value: {
    marginTop: 2,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authLabel,
    ...tabularNums,
  },
  valueMissing: { color: Colors.authMuted },
  track: {
    height: BAR_HEIGHT,
    marginTop: 6,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: Colors.authBorder,
    overflow: 'hidden',
  },
  fill: { height: BAR_HEIGHT, borderRadius: BAR_HEIGHT / 2, backgroundColor: Colors.authPrimary },
});
