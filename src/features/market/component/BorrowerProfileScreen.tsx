import { StyleSheet, Text, View } from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { Skeleton } from "@/components/feedback";
import { Colors } from "@/constants/colors";
import type { MarketStackParamList } from "@/navigation/types";
import { FontFamily, Radius, Spacing } from "@/theme";
import { useBorrowerProfile } from "../hook/useMarket";
import { BackgroundCard, CapacityCard, LoanRequestCard } from "./BorrowerFactCards";
import BorrowerScoreCard from "./BorrowerScoreCard";
import LoanDetailFrame from "./LoanDetailFrame";
import LoanStatusCard from "./LoanStatusCard";

type Route = RouteProp<MarketStackParamList, "BorrowerProfile">;

const TITLE = "Hồ sơ người vay";

/**
 * Hồ sơ người vay cho nhà đầu tư: điểm đánh giá, khả năng trả nợ, nhân thân và khoản vay đề nghị.
 * Không có định danh, giải thích SHAP, lịch sử tín dụng hay bảng luật đã chấm (Loan không trả các
 * phần này cho nhà đầu tư). Mở từ thẻ "Hồ sơ người vay" trên màn khoản vay; chỉ đọc.
 */
export default function BorrowerProfileScreen() {
  const { applicationNumber } = useRoute<Route>().params;
  const profile = useBorrowerProfile(applicationNumber);

  if (profile.data && !profile.error) {
    const data = profile.data;
    return (
      <LoanDetailFrame
        title={TITLE}
        refresh={{ refreshing: profile.loading, onRefresh: profile.reload }}
      >
        <BorrowerScoreCard assessment={data.assessment} />
        <CapacityCard profile={data} />
        <BackgroundCard background={data.background} />
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
          primary={{ label: "Thử lại", onPress: profile.reload }}
        />
      ) : (
        <View
          style={styles.skeleton}
          accessibilityLabel="Đang tải hồ sơ người vay"
        >
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
  note: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.marketNote,
  },
  noteText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.authMuted,
  },
});
