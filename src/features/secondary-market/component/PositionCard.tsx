import { StyleSheet, Text, View } from 'react-native';
import { Skeleton } from '@/components/feedback';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing, tabularNums } from '@/theme';
import type { BookPosition } from '@/types/orderBook';
import OrderRow from './OrderRow';

type Props = {
  position: BookPosition | null;
  loading: boolean;
  error: string | null;
  onCancel: (reference: string) => void;
  cancelling: string | null;
  cancelError: string | null;
  /** Nằm trong một `BookCard` đã có nền và bóng: bỏ khung thẻ riêng. */
  bare?: boolean;
};

/**
 * "Của bạn" trên sổ này: số Note còn bán được, số Note đang nằm trong lệnh bán, và các lệnh còn
 * hiệu lực kèm nút huỷ. Lỗi tải chỉ hiện trong thẻ này — sổ lệnh phía trên vẫn dùng được.
 */
export default function PositionCard({ position, loading, error, onCancel, cancelling, cancelError, bare = false }: Props) {
  const cardStyle = bare ? styles.bare : styles.card;
  if (!position && loading) return <Skeleton height={96} radius={Radius.md} />;
  if (!position) {
    return (
      <View style={cardStyle}>
        <Text style={styles.muted}>{error ?? 'Chưa tải được lệnh của bạn.'}</Text>
      </View>
    );
  }

  return (
    <View style={cardStyle}>
      <View style={styles.stats}>
        <Stat label="Note còn bán được" value={position.freeNotes} />
        <View style={styles.statDivider} />
        <Stat label="Note đang trong lệnh bán" value={position.lockedNotes} />
      </View>

      {position.activeOrders.length === 0 ? (
        <Text style={[styles.muted, styles.noOrders]}>Bạn chưa có lệnh nào đang chờ khớp trên sổ này.</Text>
      ) : (
        <View style={styles.orders}>
          {position.activeOrders.map((order, i) => (
            <OrderRow
              key={order.reference}
              order={order}
              first={i === 0}
              onCancel={onCancel}
              cancelling={cancelling === order.reference}
            />
          ))}
        </View>
      )}
      {cancelError ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {cancelError}
        </Text>
      ) : null}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.statValue} maxFontSizeMultiplier={1.3}>{value}</Text>
      <Text style={styles.statLabel} maxFontSizeMultiplier={1.4}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bare: {},
  card: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.scheduleTile,
  },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.sm },
  statDivider: { width: 1, backgroundColor: Colors.authBorder },
  statValue: { fontFamily: FontFamily.extrabold, fontSize: 22, lineHeight: 30, color: Colors.authInk, ...tabularNums },
  statLabel: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 17, color: Colors.authMuted, textAlign: 'center' },
  orders: { marginTop: Spacing.xs },
  noOrders: { marginTop: Spacing.lg },
  muted: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  error: { marginTop: Spacing.md, fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 19, color: Colors.tagRedText },
});
