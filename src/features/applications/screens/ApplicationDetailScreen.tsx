import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import RepaymentScheduleList from '@/components/loan/RepaymentScheduleList';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, Card, InfoNote, SectionLabel, Tag } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { ProfileStackParamList } from '@/navigation/types';
import { Spacing, Text_ } from '@/theme';
import { formatDate, formatDateTime, formatDong } from '@/utils/format';
import { APPLICATION_STATUS, EDUCATION_LEVEL_OPTIONS, HOME_OWNERSHIP_OPTIONS } from '../constant';
import { useGetApplicationHistoryQuery, useGetApplicationQuery } from '../api/applicationApi';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ApplicationDetail'>;

const PURPOSE_LABELS: Record<string, string> = {
  DEBT_CONSOLIDATION: 'Hợp nhất các khoản nợ', CREDIT_CARD: 'Thanh toán dư nợ thẻ',
  HOME_IMPROVEMENT: 'Sửa chữa nhà', MAJOR_PURCHASE: 'Mua sắm tài sản có giá trị',
  MEDICAL: 'Chi phí y tế', CAR: 'Mua hoặc sửa chữa xe', SMALL_BUSINESS: 'Vốn kinh doanh nhỏ',
  MOVING: 'Chi phí chuyển nơi ở', VACATION: 'Du lịch', EDUCATION: 'Chi phí giáo dục', OTHER: 'Khác',
};

const REPAYMENT_LABELS: Record<string, string> = {
  ANNUITY: 'Trả góp đều hằng kỳ',
  EQUAL_PRINCIPAL: 'Gốc đều, lãi giảm dần',
};

function optionLabel(options: ReadonlyArray<{ value: string; label: string }>, value: string | null): string {
  if (!value) return 'Chưa cung cấp';
  return options.find((option) => option.value === value)?.label ?? value;
}

/** Chi tiết hồ sơ và snapshot tại lúc nộp; không biến lịch dự kiến thành lịch đã thanh toán. */
export default function ApplicationDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { applicationNumber } = useRoute<RouteProp<ProfileStackParamList, 'ApplicationDetail'>>().params;
  const applicationQuery = useGetApplicationQuery(applicationNumber);
  const historyQuery = useGetApplicationHistoryQuery({ applicationNumber, page: 0, size: 20 });

  const reload = () => {
    applicationQuery.refetch();
    historyQuery.refetch();
  };

  if (applicationQuery.isLoading) return <Screen><LoadingScreen cards={4} /></Screen>;
  if (applicationQuery.error || !applicationQuery.data) {
    return <Screen><ErrorState message="Không thể tải chi tiết hồ sơ vay." onRetry={reload} /></Screen>;
  }

  const application = applicationQuery.data;
  const status = APPLICATION_STATUS[application.status];
  const financial = application.financialInformation;
  const schedule = application.calculationSnapshot;
  const schedulePeriods = schedule.periods ?? [];

  return (
    <Screen onRefresh={reload} refreshing={applicationQuery.isFetching || historyQuery.isFetching}>
      <PHeader title="Chi tiết hồ sơ vay" back right={<Tag tone={status.tone} small>{status.label}</Tag>} />

      <Card style={styles.hero}>
        <Text style={styles.applicationNumber}>{application.applicationNumber}</Text>
        <Text style={styles.amount}>{formatDong(application.requestedAmount)}</Text>
        <Text style={styles.meta}>{application.requestedTermMonths} tháng · {application.productSnapshot.annualInterestRate}%/năm</Text>
      </Card>

      {application.status === 'APPROVED' ? (
        <View style={styles.contractNotice}>
          <InfoNote tone="success">
            Hồ sơ đã được duyệt. Hãy mở danh sách hợp đồng để đọc lịch trả và xác nhận phiên bản hợp đồng mới nhất.
          </InfoNote>
          <Button label="Xem và ký hợp đồng" onPress={() => navigation.navigate('MyContracts')} />
        </View>
      ) : null}

      <SectionLabel style={styles.section}>ĐỀ NGHỊ VAY</SectionLabel>
      <Card flush>
        <PItem label="Sản phẩm" value={application.productSnapshot.name} />
        <PItem label="Mục đích" value={PURPOSE_LABELS[application.purposeCode] ?? application.purposeCode} sub={application.purposeDetail || undefined} />
        <PItem label="Phương thức trả" value={REPAYMENT_LABELS[application.productSnapshot.repaymentMethod] ?? application.productSnapshot.repaymentMethod} />
        <PItem label="Ngày giải ngân dự kiến" value={formatDate(application.expectedDisbursementDate)} last />
      </Card>

      <SectionLabel style={styles.section}>THÔNG TIN TÀI CHÍNH ĐÃ KHAI</SectionLabel>
      <Card flush>
        <PItem label="Thu nhập tháng" value={formatDong(financial.declaredMonthlyIncome)} />
        <PItem label="Nghĩa vụ nợ tháng" value={formatDong(financial.monthlyDebtObligations)} />
        <PItem label="Tỷ lệ nợ/thu nhập" value={`${financial.dtiSnapshot}%`} />
        <PItem label="Tình trạng nhà ở" value={optionLabel(HOME_OWNERSHIP_OPTIONS, financial.homeOwnership)} />
        <PItem label="Trình độ học vấn" value={optionLabel(EDUCATION_LEVEL_OPTIONS, financial.educationLevel)} last />
      </Card>

      <SectionLabel style={styles.section}>LỊCH TRẢ DỰ KIẾN KHI NỘP HỒ SƠ</SectionLabel>
      <InfoNote tone="info" style={styles.scheduleNote}>
        Đây chưa phải lịch đã thanh toán. Lịch chính thức chỉ hình thành sau khi hợp đồng có hiệu lực và khoản vay được giải ngân.
      </InfoNote>
      <Card flush>
        <PItem label="Kỳ trả đầu tiên" value={formatDong(schedule.firstInstallment)} />
        <PItem label="Kỳ trả cao nhất" value={formatDong(schedule.maximumInstallment)} />
        <PItem label="Tổng tiền lãi" value={formatDong(schedule.totalInterest)} />
        <PItem label="Tổng phải trả dự kiến" value={formatDong(schedule.totalRepayment)} last />
      </Card>
      <RepaymentScheduleList
        periods={schedulePeriods}
        title={schedulePeriods.length > 0 ? `Chi tiết đầy đủ ${schedulePeriods.length} kỳ dự kiến` : 'Chi tiết các kỳ dự kiến'}
      />

      <SectionLabel style={styles.section}>LỊCH SỬ XỬ LÝ</SectionLabel>
      {historyQuery.error ? (
        <Text style={styles.historyError}>Chưa tải được lịch sử xử lý.</Text>
      ) : (
        <Card flush>
          {(historyQuery.data?.data ?? []).map((item, index, rows) => (
            <PItem
              key={item.id}
              label={APPLICATION_STATUS[item.toStatus].label}
              sub={`${item.actorType === 'SYSTEM' ? 'Hệ thống' : item.actorType === 'ADMIN' ? 'Quản trị viên' : 'Người vay'} · ${formatDateTime(item.createdAt)}`}
              last={index === rows.length - 1}
            />
          ))}
          {(historyQuery.data?.data.length ?? 0) === 0 ? <Text style={styles.emptyHistory}>Chưa có lịch sử xử lý.</Text> : null}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.sm },
  applicationNumber: { ...Text_.microBold, color: Colors.brand },
  amount: { ...Text_.figure, color: Colors.ink },
  meta: { ...Text_.micro, color: Colors.ink3 },
  contractNotice: { gap: Spacing.lg, marginTop: Spacing.xl },
  section: { marginTop: Spacing.section },
  scheduleNote: { marginBottom: Spacing.lg },
  historyError: { ...Text_.body, color: Colors.red },
  emptyHistory: { ...Text_.body, color: Colors.ink3, padding: Spacing.xl, textAlign: 'center' },
});
