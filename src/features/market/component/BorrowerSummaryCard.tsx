import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Skeleton } from '@/components/feedback';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, MIN_TOUCH, Radius, SoftShadow, Spacing } from '@/theme';
import type { BorrowerProfile } from '@/types/invest';
import { formatDong, formatPercentValue } from '@/utils/format';
import { KYC_LABEL, formatScore, ruleValue } from '../borrowerDisplay';
import { useBorrowerProfile } from '../hook/useMarket';
import InfoGrid from './InfoGrid';

type Props = {
  applicationNumber: string;
  onOpen: () => void;
};

/**
 * Thẻ "Hồ sơ người vay" trên màn khoản vay: bốn con số nhà đầu tư cần nhất trước khi nhập số tiền,
 * một dòng nhân thân và lối sang màn hồ sơ đầy đủ. Thẻ tự lo tải và lỗi, nên Loan Service chậm hay
 * lỗi cũng không chặn việc đặt lệnh ở phía dưới.
 */
export default function BorrowerSummaryCard({ applicationNumber, onOpen }: Props) {
  const profile = useBorrowerProfile(applicationNumber);

  return (
    <View style={styles.card}>
      {/* "Ẩn danh" đã nằm ngay ô "Người vay" của thẻ phía trên nên không lặp lại ở đây. */}
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
        Hồ sơ người vay
      </Text>
      {profile.data ? (
        <Summary profile={profile.data} onOpen={onOpen} />
      ) : profile.error ? (
        <View style={styles.error}>
          <Text style={styles.errorText} accessibilityRole="alert" maxFontSizeMultiplier={1.4}>
            {profile.error}
          </Text>
          <Pressable
            onPress={profile.reload}
            accessibilityRole="button"
            style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
          >
            <Text style={styles.link}>Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.loading} accessibilityLabel="Đang tải hồ sơ người vay">
          <Skeleton height={96} radius={Radius.sm} />
          <Skeleton height={16} width="70%" />
        </View>
      )}
    </View>
  );
}

function Summary({ profile, onOpen }: { profile: BorrowerProfile; onOpen: () => void }) {
  const { assessment, capacity } = profile;
  const items = [
    { label: 'Điểm đánh giá', value: scoreText(assessment) },
    {
      label: 'Xác suất vỡ nợ',
      value: assessment?.pdPercent == null ? 'Chưa chấm' : formatPercentValue(assessment.pdPercent),
    },
    { label: 'Thu nhập hằng tháng', value: formatDong(capacity.monthlyIncome) },
    { label: 'Nợ trên thu nhập', value: formatPercentValue(capacity.dtiPercent) },
  ];
  const facts = factsLine(profile);

  return (
    <>
      <InfoGrid items={items} />
      {facts ? (
        <Text style={styles.facts} maxFontSizeMultiplier={1.4}>
          {facts}
        </Text>
      ) : null}
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel="Xem hồ sơ người vay đầy đủ"
        style={({ pressed }) => [styles.more, pressed && styles.pressed]}
      >
        <Text style={styles.link} maxFontSizeMultiplier={1.4}>
          Xem hồ sơ đầy đủ
        </Text>
        <Icon name="chevronRight" size={18} color={Colors.authPrimary} strokeWidth={2.2} />
      </Pressable>
    </>
  );
}

function scoreText(assessment: BorrowerProfile['assessment']): string {
  if (assessment?.evaluationScore == null) return 'Chưa chấm';
  const score = formatScore(assessment.evaluationScore);
  return assessment.grade ? `${score} · hạng ${assessment.grade}` : score;
}

/**
 * Dòng nhân thân ngắn. Hồ sơ giả lập thì nói thẳng là giả lập, không in tuổi và eKYC như số liệu
 * thật. Điểm CIC chỉ có khi bảng luật có luật đọc trường này.
 */
function factsLine(profile: BorrowerProfile): string | null {
  const parts: string[] = [];
  const { background } = profile;
  if (background.mockProfile) {
    parts.push('Tuổi, eKYC từ hồ sơ giả lập');
  } else {
    if (background.kycStatus) parts.push(`eKYC ${KYC_LABEL[background.kycStatus].toLowerCase()}`);
    if (background.age != null) parts.push(`${background.age} tuổi`);
  }
  const cic = ruleValue(profile.rules, 'cic_score');
  if (typeof cic === 'number') parts.push(`Điểm CIC ${formatScore(cic)}`);
  return parts.length ? parts.join(' · ') : null;
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  title: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 23, color: Colors.authInk, marginBottom: Spacing.xs },
  facts: {
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.authBorder,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authMuted,
  },
  more: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.authBorder,
  },
  link: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, color: Colors.authPrimary },
  pressed: { opacity: 0.6 },
  loading: { gap: Spacing.md, paddingTop: Spacing.xs, paddingBottom: Spacing.lg },
  error: { gap: Spacing.xs, paddingBottom: Spacing.xs },
  errorText: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.tagRedText },
  retry: { alignSelf: 'flex-start', minHeight: MIN_TOUCH, justifyContent: 'center' },
});
