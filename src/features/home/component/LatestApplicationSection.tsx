import { StyleSheet } from 'react-native';
import { Tag } from '@/components/ui';
import { applicationJourneyStatus } from '@/features/applications';
import type { LoanApplication } from '@/types/loan';
import type { LoanContractSummary } from '@/types/contract';
import { formatDong } from '@/utils/format';
import ActivityRow from './ActivityRow';
import HomeSection, { RowSkeleton, SectionMessage } from './HomeSection';

type Props = {
  /** Hồ sơ đứng đầu danh sách Loan Service trả về (mới nhất); chưa có thì undefined. */
  application: LoanApplication | undefined;
  /** Hợp đồng của hồ sơ đó nếu đã lập, để trạng thái đi tiếp sang "Đã ký"… */
  contract: LoanContractSummary | undefined;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpen: (applicationNumber: string) => void;
  onSeeAll: () => void;
  onBrowseProducts: () => void;
};

const TITLE = 'Hồ sơ vay gần nhất';

/** Mục "Hồ sơ vay gần nhất": một dòng hồ sơ mới nhất kèm trạng thái hành trình. */
export default function LatestApplicationSection({
  application,
  contract,
  loading,
  error,
  onRetry,
  onOpen,
  onSeeAll,
  onBrowseProducts,
}: Props) {
  if (!application) {
    return (
      <HomeSection title={TITLE}>
        {loading ? (
          <RowSkeleton />
        ) : error ? (
          <SectionMessage text="Chưa tải được hồ sơ vay." actionLabel="Thử lại" onAction={onRetry} />
        ) : (
          <SectionMessage
            text="Bạn chưa có hồ sơ vay nào."
            actionLabel="Xem sản phẩm vay"
            onAction={onBrowseProducts}
          />
        )}
      </HomeSection>
    );
  }

  // Cùng cách ghép trạng thái với thẻ hồ sơ ở tab Hồ sơ, kể cả bước chờ xác
  // nhận điều khoản, để hai nơi không bao giờ báo hai trạng thái khác nhau.
  const status = applicationJourneyStatus(
    application.status,
    contract?.status,
    application.termsConfirmation?.status,
  );
  const amount = formatDong(application.requestedAmount);

  return (
    <HomeSection title={TITLE} onSeeAll={onSeeAll} seeAllLabel="Xem tất cả hồ sơ vay">
      <ActivityRow
        icon="fileText"
        shape="square"
        title={application.applicationNumber}
        titleEllipsis="middle"
        subtitle={amount}
        right={
          <Tag tone={status.tone} small style={styles.status}>
            {status.label}
          </Tag>
        }
        onPress={() => onOpen(application.applicationNumber)}
        accessibilityLabel={`Hồ sơ ${application.applicationNumber}, ${amount}, ${status.label}`}
      />
    </HomeSection>
  );
}

const styles = StyleSheet.create({
  // Nhãn trạng thái của mockup là viên thuốc không viền, to hơn tag thường một chút.
  status: { alignSelf: 'center', borderWidth: 0, paddingHorizontal: 12, paddingVertical: 4 },
});
