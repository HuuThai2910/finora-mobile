import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, InfoNote, SectionLabel, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatVND } from '@/utils/format';
import type { WalletStackParamList } from '@/navigation/types';
import type { NoteListing } from '@/types/invest';
import { buyNote, cancelListing } from '../api';
import { DEFAULTED_BUY_WARNING, STATUS_LABEL, STATUS_TONE } from '../constant';
import { useMyListings, useSecondaryListings } from '../hook/useSecondaryMarket';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'NoteListingDetail'>;
type Route = RouteProp<WalletStackParamList, 'NoteListingDetail'>;

/**
 * Chi tiết một tin đăng bán, và nơi xác nhận mua hoặc rút tin.
 *
 * Tin lấy từ danh sách đã tải thay vì gọi riêng: backend chưa có endpoint đọc một tin, và hai danh
 * sách trên màn trước đã mang đủ dữ liệu.
 *
 * Với Note thuộc khoản vay đang nợ xấu, cảnh báo hiện **ngay trên nút xác nhận** chứ không chỉ là
 * một nhãn trong bảng — người mua phải đọc trước khi bấm.
 */
export default function NoteListingDetailScreen() {
  const nav = useNavigation<Nav>();
  const { reference } = useRoute<Route>().params;

  const browse = useSecondaryListings();
  const mine = useMyListings();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const loading = browse.loading || mine.loading;
  const listing: NoteListing | undefined =
    browse.data?.find(item => item.reference === reference)
    ?? mine.data?.find(item => item.reference === reference);

  const isMine = mine.data?.some(item => item.reference === reference) ?? false;

  const reload = () => {
    browse.reload();
    mine.reload();
  };

  if (loading && !listing) {
    return (
      <Screen>
        <PHeader title="Chi tiết tin bán" back />
        <LoadingScreen cards={2} />
      </Screen>
    );
  }

  if (!listing) {
    return (
      <Screen>
        <PHeader title="Chi tiết tin bán" back />
        <ErrorState message="Không tìm thấy tin đăng bán này." onRetry={reload} />
      </Screen>
    );
  }

  const gain = listing.outstandingPrincipal - listing.askingPrice;

  const handleBuy = async () => {
    setSubmitting(true);
    setFailed(null);
    try {
      await buyNote(listing.reference);
      setMessage(
        `Đã mua ${listing.noteNumber}. Từ giờ gốc và lãi của Note này về ví của bạn.`,
      );
      reload();
    } catch (error) {
      // Lỗi nghiệp vụ (Note vừa bị người khác mua, ví không đủ tiền) hiện tại chỗ thay vì
      // ném ra ngoài: người dùng đang ở đúng màn để đọc và thử lại.
      setFailed(error instanceof Error ? error.message : 'Không mua được Note này.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setSubmitting(true);
    setFailed(null);
    try {
      await cancelListing(listing.reference);
      setMessage('Đã rút tin. Note vẫn thuộc về bạn và tiếp tục nhận gốc lãi.');
      reload();
    } catch (error) {
      setFailed(error instanceof Error ? error.message : 'Không rút được tin này.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <PHeader
        title="Chi tiết tin bán"
        back
        right={
          <Tag tone={STATUS_TONE[listing.status]} small>
            {STATUS_LABEL[listing.status]}
          </Tag>
        }
      />

      {/* Cảnh báo nợ xấu đặt trên cùng: người mua phải thấy trước mọi con số. */}
      {listing.defaulted && (
        <InfoNote tone="warn" style={styles.block}>
          {DEFAULTED_BUY_WARNING}
        </InfoNote>
      )}

      <SectionLabel>Note</SectionLabel>
      <PItem label="Mã Note" value={listing.noteNumber} />
      <PItem label="Khoản vay gốc" value={`#${listing.loanId}`} />
      <PItem label="Lãi suất" value={`${listing.annualRate}%/năm`} />
      <PItem label="Kỳ hạn còn lại" value={`${listing.termMonths} tháng`} />
      <PItem
        label="Hạng tín dụng"
        value={listing.grade ?? 'Không rõ'}
        last
      />

      <SectionLabel style={styles.section}>Giá và dòng tiền</SectionLabel>
      <PItem label="Giá bán" value={formatVND(listing.askingPrice)} />
      <PItem label="Dư nợ gốc còn lại" value={formatVND(listing.outstandingPrincipal)} />
      <PItem
        label={isMine ? 'Bạn nhận sau phí' : 'Bạn lợi về gốc'}
        value={isMine ? formatVND(listing.estimatedProceeds) : formatVND(gain)}
        last
      />

      {!isMine && (
        <Text style={styles.explain}>
          Bạn trả {formatVND(listing.askingPrice)} và nhận về {formatVND(listing.outstandingPrincipal)}
          {' '}gốc, cộng toàn bộ lãi {listing.annualRate}%/năm trong {listing.termMonths} tháng còn lại.
        </Text>
      )}

      {isMine && listing.status === 'OPEN' && (
        <Text style={styles.explain}>
          Phí nền tảng {formatVND(listing.estimatedFee)} được trừ khi có người mua. Người mua trả
          đúng giá treo, bạn nhận {formatVND(listing.estimatedProceeds)}.
        </Text>
      )}

      {listing.status === 'SOLD' && listing.sellerProceeds != null && (
        <>
          <SectionLabel style={styles.section}>Kết quả giao dịch</SectionLabel>
          <PItem label="Giá đã bán" value={formatVND(listing.soldPrice ?? 0)} />
          <PItem label="Phí nền tảng" value={formatVND(listing.platformFee ?? 0)} />
          <PItem label="Người bán nhận" value={formatVND(listing.sellerProceeds)} last />
        </>
      )}

      {message && (
        <InfoNote tone="success" style={styles.block}>
          {message}
        </InfoNote>
      )}

      {failed && (
        <InfoNote tone="warn" style={styles.block}>
          {failed}
        </InfoNote>
      )}

      {listing.status === 'OPEN' && !isMine && !message && (
        <Button
          label={submitting ? 'Đang mua…' : `Mua ${formatVND(listing.askingPrice)}`}
          onPress={handleBuy}
          disabled={submitting}
          style={styles.action}
        />
      )}

      {listing.status === 'OPEN' && isMine && !message && (
        <Button
          label={submitting ? 'Đang rút tin…' : 'Rút tin đăng bán'}
          variant="outline"
          onPress={handleCancel}
          disabled={submitting}
          style={styles.action}
        />
      )}

      {message && (
        <Button label="Về chợ thứ cấp" variant="outline" onPress={() => nav.goBack()} style={styles.action} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: Spacing.lg },
  section: { marginTop: Spacing.xxl },
  explain: {
    ...Text_.micro,
    color: Colors.ink3,
    marginTop: Spacing.md,
    lineHeight: 18,
  },
  action: { marginTop: Spacing.xl },
});
