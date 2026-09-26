import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/theme';
import { Skeleton } from '@/components/feedback';
import AccountInfoCard, { INFO_HEADER_GAP } from './AccountInfoCard';
import { INFO_ROW_PADDING } from './AccountInfoRow';
import { INFO_TILE_SIZE } from './AccountInfoTile';

/** Số dòng của hai thẻ thật (Tài khoản: 4, Thông tin cá nhân: 6). */
const CARDS = [
  { key: 'account', rows: 4 },
  { key: 'personal', rows: 6 },
] as const;

/**
 * Khung giả lúc tải hồ sơ lần đầu, cùng khung thẻ và nhịp dòng với màn thật để
 * nội dung không nhảy chỗ khi dữ liệu về.
 */
export default function AccountInfoSkeleton() {
  return (
    <View
      style={styles.root}
      accessibilityLiveRegion="polite"
      accessibilityLabel="Đang tải thông tin tài khoản"
    >
      {CARDS.map(card => (
        <AccountInfoCard key={card.key}>
          <View style={styles.header}>
            <Tile />
            <Skeleton height={16} width="42%" />
          </View>
          {Array.from({ length: card.rows }, (_, i) => (
            <View key={i} style={styles.row}>
              <Tile />
              <Skeleton height={13} width="26%" />
              <Skeleton height={14} width="34%" style={styles.value} />
            </View>
          ))}
        </AccountInfoCard>
      ))}
    </View>
  );
}

function Tile() {
  return <Skeleton width={INFO_TILE_SIZE} height={INFO_TILE_SIZE} radius={Radius.sm} />;
}

const styles = StyleSheet.create({
  root: { gap: Spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, paddingBottom: INFO_HEADER_GAP },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: INFO_ROW_PADDING,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rowDivider,
  },
  value: { marginLeft: 'auto' },
});
