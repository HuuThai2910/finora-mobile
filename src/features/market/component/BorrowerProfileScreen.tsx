import { StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Skeleton } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import type { MarketStackParamList } from '@/navigation/types';
import { FontFamily, Radius, Spacing } from '@/theme';
import { useBorrowerProfile } from '../hook/useMarket';
import { BackgroundCard, CapacityCard, CreditHistoryCard, LoanRequestCard } from './BorrowerFactCards';
import BorrowerRulesCard from './BorrowerRulesCard';
import BorrowerScoreCard from './BorrowerScoreCard';
import LoanDetailFrame from './LoanDetailFrame';
import LoanStatusCard from './LoanStatusCard';

type Route = RouteProp<MarketStackParamList, 'BorrowerProfile'>;

const TITLE = 'Hồ sơ người vay';

const ANONYMITY_NOTE =
  'Người vay ẩn danh: FINORA không hiển thị họ tên, số CCCD, số điện thoại, email và địa chỉ. ' +
  'Số liệu là bản chụp lúc người vay nộp hồ sơ và lúc hệ thống chấm điểm.';

/**
 * Hồ sơ người vay đầy đủ cho nhà đầu tư: mọi thứ thẩm định viên thấy ở trang thẩm định, trừ định
 * danh và giải thích SHAP. Mở từ thẻ "Hồ sơ người vay" trên màn khoản vay; chỉ đọc.
 */
export default function BorrowerProfileScreen() {
  const { applicationNumber } = useRoute<Route>().params;
  const profile = useBorrowerProfile(applicationNumber);

  if (profile.data && !profile.error) {
    const data = profile.data;
    return (
      <LoanDetailFrame title={TITLE} refresh={{ refreshing: profile.loading, onRefresh: profile.reload }}>
        <View style={styles.note}>
          <Text style={styles.noteText} maxFontSizeMultiplier={1.4}>
            {ANONYMITY_NOTE}
          </Text>
        </View>
        <BorrowerScoreCard assessment={data.assessment} />
        <CapacityCard profile={data} />
        <CreditHistoryCard profile={data} />
        <BackgroundCard background={data.background} />
        <BorrowerRulesCard rules={data.rules} ruleScore={data.assessment?.ruleScore ?? null} />
        <LoanRequestCard loan={data.loan} />
      </LoanDetailFrame>
    );
  }

  return (
    <LoanDetailFrame title={TITLE}>
      {profile.error ? (
        <LoanStatusCard
          icon="alert"
          danger
          title={profile.error}
          message="Thử tải lại sau ít phút. Hồ sơ chỉ xem được khi khoản vay đã lên sàn."
          primary={{ label: 'Thử lại', onPress: profile.reload }}
        />
      ) : (
        <View style={styles.skeleton} accessibilityLabel="Đang tải hồ sơ người vay">
          <Skeleton height={150} radius={Radius.md} />
          <Skeleton height={210} radius={Radius.md} />
          <Skeleton height={170} radius={Radius.md} />
        </View>
      )}
    </LoanDetailFrame>
  );
}

const styles = StyleSheet.create({
  skeleton: { gap: Spacing.xl },
  // Cùng tông ô ghi chú cuối màn sàn: nền xanh nhạt đậm hơn nền sóng một bậc để không chìm.
  note: { padding: Spacing.lg, borderRadius: Radius.md, backgroundColor: Colors.marketNote },
  noteText: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
});
