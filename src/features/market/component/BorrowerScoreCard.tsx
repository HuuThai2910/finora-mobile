import { StyleSheet, Text, View } from 'react-native';
import { Tag, type CreditGrade } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Spacing, tabularNums } from '@/theme';
import type { BorrowerProfile } from '@/types/invest';
import { formatDate, formatPercentValue } from '@/utils/format';
import { DECISION_SOURCE_LABEL, formatScore } from '../borrowerDisplay';
import { GRADE_TONE } from '../constant';
import { ProfileCard, ProfileFootnote, ProfileRow } from './ProfileCard';

const GRADES: readonly CreditGrade[] = ['A', 'B', 'C', 'D', 'E'];

/**
 * Kết quả chấm điểm của hồ sơ: điểm đánh giá (thang 100) kèm hạng, rồi xác suất vỡ nợ, điểm theo
 * bảng luật và cách hồ sơ được duyệt. Không có giải thích SHAP: phần đó chỉ dành cho thẩm định viên.
 */
export default function BorrowerScoreCard({ assessment }: { assessment: BorrowerProfile['assessment'] }) {
  if (!assessment) {
    return (
      <ProfileCard title="Đánh giá tín dụng">
        <ProfileFootnote>Hồ sơ chưa có lần chấm điểm thành công.</ProfileFootnote>
      </ProfileCard>
    );
  }

  const grade = GRADES.find(item => item === assessment.grade?.trim().toUpperCase());
  const score = assessment.evaluationScore;
  const scoreLabel = score == null ? 'chưa có' : `${formatScore(score)} trên 100`;

  return (
    <ProfileCard
      title="Đánh giá tín dụng"
      aside={assessment.scoredAt ? `Chấm ngày ${formatDate(assessment.scoredAt)}` : undefined}
    >
      <View
        style={styles.hero}
        accessible
        accessibilityLabel={`Điểm đánh giá ${scoreLabel}${grade ? `, hạng ${grade}` : ''}`}
      >
        <Text style={styles.score} maxFontSizeMultiplier={1.3}>
          {score == null ? 'Chưa có' : formatScore(score)}
        </Text>
        {score == null ? null : (
          <Text style={styles.scale} maxFontSizeMultiplier={1.3}>
            /100
          </Text>
        )}
        {grade ? (
          <Tag tone={GRADE_TONE[grade]} small style={styles.grade}>
            {`Hạng ${grade}`}
          </Tag>
        ) : null}
      </View>
      <ProfileRow
        label="Xác suất vỡ nợ (PD)"
        hint="Mô hình ước tính khả năng người vay không trả được nợ"
        value={assessment.pdPercent == null ? 'Chưa có' : formatPercentValue(assessment.pdPercent)}
      />
      <ProfileRow
        label="Điểm theo bảng luật"
        value={assessment.ruleScore == null ? 'Chưa có' : `${assessment.ruleScore}/100`}
      />
      <ProfileRow
        label="Cách duyệt"
        value={assessment.decisionSource ? DECISION_SOURCE_LABEL[assessment.decisionSource] : 'Chưa có'}
      />
    </ProfileCard>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.xs, paddingBottom: Spacing.md },
  score: {
    fontFamily: FontFamily.extrabold,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.5,
    color: Colors.authInk,
    ...tabularNums,
  },
  scale: { fontFamily: FontFamily.medium, fontSize: 14, lineHeight: 20, color: Colors.authMuted },
  // Đẩy nhãn hạng sang mép phải, canh giữa theo chiều cao con số.
  grade: { marginLeft: 'auto', alignSelf: 'center' },
});
