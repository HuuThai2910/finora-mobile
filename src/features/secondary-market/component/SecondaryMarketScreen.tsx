import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Spacing } from '@/theme';
import { PHeader, Screen } from '@/components/phone';
import { InfoNote, SectionLabel, SegmentGroup } from '@/components/ui';
import { EmptyState, ErrorState, LoadingScreen } from '@/components/feedback';
import type { WalletStackParamList } from '@/navigation/types';
import { BUYER_INTRO } from '../constant';
import { useMyListings, useSecondaryListings } from '../hook/useSecondaryMarket';
import NoteListingCard from './NoteListingCard';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'SecondaryMarket'>;

type Tab = 'BROWSE' | 'MINE';

const TABS: ReadonlyArray<{ value: Tab; label: string }> = [
  { value: 'BROWSE', label: 'Đang bán' },
  { value: 'MINE', label: 'Tin của tôi' },
];

/**
 * Chợ thứ cấp Notes — bảng tin và tin của chính mình.
 *
 * Hai tab dùng hai nguồn dữ liệu khác nhau: bảng tin lấy mọi tin đang mở, tin của tôi lấy cả tin đã
 * bán và đã rút để người bán theo dõi được kết quả.
 */
export default function SecondaryMarketScreen() {
  const nav = useNavigation<Nav>();
  const [tab, setTab] = useState<Tab>('BROWSE');

  const browse = useSecondaryListings();
  const mine = useMyListings();

  const active = tab === 'BROWSE' ? browse : mine;
  const reload = () => {
    browse.reload();
    mine.reload();
  };

  return (
    <Screen onRefresh={reload} refreshing={active.loading && !!active.data}>
      <PHeader title="Chợ thứ cấp" back />

      <SegmentGroup<Tab>
        options={TABS}
        value={tab}
        onChange={setTab}
        label="Chọn danh sách tin đăng bán"
        style={styles.tabs}
      />

      {tab === 'BROWSE' && <InfoNote style={styles.note}>{BUYER_INTRO}</InfoNote>}

      {active.loading && !active.data ? (
        <LoadingScreen cards={3} />
      ) : active.error ? (
        <ErrorState message={active.error} onRetry={reload} />
      ) : !active.data?.length ? (
        <EmptyState
          icon="search"
          title={tab === 'BROWSE' ? 'Chưa có Note nào đang bán' : 'Bạn chưa đăng bán Note nào'}
          hint={
            tab === 'BROWSE'
              ? 'Quay lại sau, hoặc mua Note mới trên sàn gọi vốn.'
              : 'Mở danh mục đầu tư, chọn một Note đang giữ rồi bấm Đăng bán.'
          }
        />
      ) : (
        <>
          <SectionLabel>
            {tab === 'BROWSE' ? `${active.data.length} Note đang bán` : 'Tin đã đăng'}
          </SectionLabel>

          {active.data.map(listing => (
            <NoteListingCard
              key={listing.reference}
              listing={listing}
              onPress={() =>
                nav.navigate('NoteListingDetail', { reference: listing.reference })
              }
            />
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { marginBottom: Spacing.lg },
  note: { marginBottom: Spacing.lg },
});
