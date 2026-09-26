import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, SoftShadow, Spacing } from '@/theme';
import DetailButton from './DetailButton';
import DetailCard from './DetailCard';

type Props = {
  /** Hợp đồng đã ký/hiệu lực/tất toán: PDF là bản xác nhận chứ không còn là bản để đọc trước khi ký. */
  confirmed: boolean;
  /** Hợp đồng cũ có thể chưa có PDF do máy chủ phát hành. */
  hasPdf: boolean;
  opening: boolean;
  sharing: boolean;
  onOpen: () => void;
  onShare: () => void;
  applicationNumber: string;
  onOpenApplication: () => void;
};

/**
 * "Nội dung hợp đồng" (mockup 26/09/2026): mở toàn văn PDF do Loan Service phát
 * hành, lưu hoặc chia sẻ, và lối về hồ sơ gốc. Nội dung không dựng lại bằng
 * React Native để PDF người vay đọc và hash gửi khi ký luôn là một tài liệu.
 */
export default function ContractDocumentCard({
  confirmed,
  hasPdf,
  opening,
  sharing,
  onOpen,
  onShare,
  applicationNumber,
  onOpenApplication,
}: Props) {
  return (
    <DetailCard>
      <View style={styles.top}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow} maxFontSizeMultiplier={1.3}>
            NỘI DUNG HỢP ĐỒNG
          </Text>
          <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
            {confirmed ? 'Bản PDF xác nhận' : 'Hợp đồng và lịch trả nợ'}
          </Text>
          <Text style={styles.body}>
            Mở toàn văn PDF do Loan Service phát hành. Lịch từng kỳ và tổng nghĩa vụ chỉ nằm trong
            tài liệu này để tránh hiển thị lặp.
          </Text>
        </View>
        <PdfArt />
      </View>

      {/* Mockup đặt hai nút cạnh nhau, nhưng Be Vietnam Pro rộng hơn font mockup nên
          nhãn bị bẻ hai dòng ngay cả ở màn 393pt; xếp dọc để nhãn luôn một dòng. */}
      <View style={styles.actions}>
        <View>
          <DetailButton
            label="Xem hợp đồng PDF"
            icon="file"
            onPress={onOpen}
            loading={opening}
            disabled={!hasPdf || sharing}
            accessibilityLabel={confirmed ? 'Mở bản xác nhận PDF' : 'Mở nội dung hợp đồng PDF'}
          />
        </View>
        <View>
          <DetailButton
            label="Lưu hoặc chia sẻ"
            icon="download"
            variant="outline"
            onPress={onShare}
            loading={sharing}
            disabled={!hasPdf || opening}
            accessibilityLabel="Lưu hoặc chia sẻ PDF"
          />
        </View>
      </View>

      <DetailButton
        // Ký tự nối từ (U+2060) quanh dấu gạch: mã hồ sơ xuống dòng nguyên khối
        // thay vì bị bẻ đôi ở "LA-".
        label={`Lập từ hồ sơ ${applicationNumber.replace(/-/g, '⁠-⁠')}`}
        icon="folder"
        variant="row"
        onPress={onOpenApplication}
        accessibilityLabel={`Mở hồ sơ ${applicationNumber}`}
      />
    </DetailCard>
  );
}

/**
 * Hình minh hoạ tập tài liệu PDF của mockup, dựng bằng khối màu và icon Lucide
 * thay cho ảnh 3D: hai tờ giấy xếp chồng và nhãn "PDF".
 */
function PdfArt() {
  return (
    <View style={styles.art} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.backSheet} />
      <View style={styles.frontSheet}>
        <Icon name="fileText" size={26} color={Colors.authPrimary} strokeWidth={1.8} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PDF</Text>
        </View>
      </View>
    </View>
  );
}

const ART = 64;

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.lg },
  copy: { flex: 1, gap: 4 },
  eyebrow: {
    fontFamily: FontFamily.semibold,
    fontSize: 11.5,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: Colors.authMuted,
  },
  title: { fontFamily: FontFamily.bold, fontSize: 18, lineHeight: 25, color: Colors.authInk },
  body: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  actions: { gap: Spacing.md },
  art: { width: ART, height: ART + 8, marginTop: 4 },
  backSheet: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: ART - 14,
    height: ART,
    borderRadius: 10,
    backgroundColor: Colors.tintBlue,
    transform: [{ rotate: '8deg' }],
  },
  frontSheet: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: ART - 14,
    height: ART,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.authBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...SoftShadow.raised,
  },
  badge: {
    position: 'absolute',
    bottom: 6,
    right: -8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    backgroundColor: Colors.authPrimary,
  },
  badgeText: { fontFamily: FontFamily.bold, fontSize: 10, lineHeight: 14, color: Colors.onDark },
});
