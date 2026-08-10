import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, SectionLabel } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import type { LoanContractDetail } from '@/types/contract';
import { formatDong } from '@/utils/format';

type Props = {
  contract: LoanContractDetail;
};

const REPAYMENT_LABELS: Record<LoanContractDetail['repaymentMethod'], string> = {
  ANNUITY: 'trả góp đều hằng kỳ',
  EQUAL_PRINCIPAL: 'trả gốc đều, lãi giảm dần',
};

/**
 * Trình bày điều khoản borrower thực sự xác nhận và tách thông tin băm kỹ thuật khỏi nội dung chính.
 * Hợp đồng V1 vẫn giữ nguyên văn bản gốc trong vùng đối chiếu để không làm sai nội dung đã được băm.
 */
export default function ContractDocumentSection({ contract }: Props) {
  const [showVerification, setShowVerification] = useState(false);
  const isReadableDocument = contract.documentVersion === 'CLICK_WRAP_TEXT_V2'
    && contract.documentContent.startsWith('HỢP ĐỒNG VAY FINORA');

  return (
    <View>
      <SectionLabel style={styles.section}>NỘI DUNG HỢP ĐỒNG</SectionLabel>
      <Card style={styles.documentCard}>
        {isReadableDocument ? (
          <ReadableContractDocument content={contract.documentContent} />
        ) : (
          <LegacyContractSummary contract={contract} />
        )}
      </Card>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={showVerification ? 'Ẩn thông tin xác thực hợp đồng' : 'Xem thông tin xác thực hợp đồng'}
        accessibilityState={{ expanded: showVerification }}
        onPress={() => setShowVerification((value) => !value)}
        style={({ pressed }) => [styles.verificationToggle, pressed && styles.pressed]}
      >
        <View style={styles.toggleCopy}>
          <Text style={styles.toggleTitle}>Thông tin xác thực hợp đồng</Text>
          <Text style={styles.toggleDescription}>Dành cho việc đối chiếu phiên bản và tính toàn vẹn</Text>
        </View>
        <Text style={styles.toggleAction}>{showVerification ? 'Ẩn' : 'Xem'}</Text>
      </Pressable>

      {showVerification ? (
        <Card style={styles.verificationCard}>
          <VerificationValue label="Phiên bản điều khoản" value={contract.termsVersion} />
          <VerificationValue label="Phiên bản tài liệu" value={contract.documentVersion} />
          <VerificationValue label="Mã kiểm tra SHA-256" value={contract.documentHash} monospace />
          {!isReadableDocument ? (
            <View style={styles.originalDocument}>
              <Text style={styles.originalTitle}>Văn bản gốc của hợp đồng phiên bản cũ</Text>
              <Text style={styles.originalHint}>
                Nội dung này được giữ nguyên để mã kiểm tra không thay đổi. Phần tóm tắt phía trên diễn giải lại cùng các điều khoản bằng tiếng Việt dễ đọc.
              </Text>
              <Text style={styles.originalText}>{contract.documentContent}</Text>
            </View>
          ) : null}
        </Card>
      ) : null}
    </View>
  );
}

function LegacyContractSummary({ contract }: Props) {
  return (
    <View style={styles.summary}>
      <Text style={styles.summaryTitle}>Thỏa thuận khoản vay</Text>
      <Text style={styles.paragraph}>
        1. Người vay xác nhận khoản vay {formatDong(contract.principalAmount)} trong {contract.termMonths} tháng,
        với lãi suất cố định {contract.annualInterestRate}%/năm và phương thức {REPAYMENT_LABELS[contract.repaymentMethod]}.
      </Text>
      <Text style={styles.paragraph}>
        2. Tổng tiền lãi dự kiến là {formatDong(contract.totalInterest)}; tổng phí là {formatDong(contract.totalFees)};
        tổng tiền phạt dự kiến là {formatDong(contract.totalPenalties)} và tổng nghĩa vụ thanh toán dự kiến là {formatDong(contract.totalRepayment)}.
      </Text>
      <Text style={styles.paragraph}>
        3. Lịch trả từng kỳ hiển thị trên màn hình là một phần của điều khoản. Lịch chính thức có thể được cập nhật theo ngày giải ngân thực tế.
      </Text>
      <Text style={styles.paragraph}>
        4. Khi chọn “Ký xác nhận”, FINORA ghi nhận sự đồng ý bằng hình thức click-wrap trong hệ thống; đây chưa phải chữ ký số SmartCA.
      </Text>
    </View>
  );
}

function ReadableContractDocument({ content }: { content: string }) {
  return (
    <View style={styles.readableDocument}>
      {content.split('\n').map((line, index) => {
        if (!line) return <View key={`space-${index}`} style={styles.documentSpacing} />;
        if (line === 'HỢP ĐỒNG VAY FINORA') {
          return <Text key={`title-${index}`} style={styles.documentTitle}>{line}</Text>;
        }
        if (/^\d+\.\s/.test(line)) {
          return <Text key={`heading-${index}`} style={styles.documentHeading}>{line}</Text>;
        }
        return <Text key={`line-${index}`} style={styles.document}>{line}</Text>;
      })}
    </View>
  );
}

function VerificationValue({ label, value, monospace = false }: { label: string; value: string; monospace?: boolean }) {
  return (
    <View style={styles.verificationRow}>
      <Text style={styles.verificationLabel}>{label}</Text>
      <Text selectable style={[styles.verificationValue, monospace && styles.monospace]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: Spacing.section },
  documentCard: { borderRadius: Radius.lg },
  readableDocument: { gap: Spacing.sm },
  documentTitle: { ...Text_.heading, color: Colors.ink, textAlign: 'center', marginBottom: Spacing.sm },
  documentHeading: { ...Text_.bodyBold, color: Colors.brand700, marginTop: Spacing.md },
  document: { ...Text_.micro, color: Colors.ink2, lineHeight: 22 },
  documentSpacing: { height: Spacing.xs },
  summary: { gap: Spacing.lg },
  summaryTitle: { ...Text_.heading, color: Colors.ink },
  paragraph: { ...Text_.body, color: Colors.ink2, lineHeight: 23 },
  verificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.surfaceSubtle,
  },
  pressed: { opacity: 0.75 },
  toggleCopy: { flex: 1 },
  toggleTitle: { ...Text_.microBold, color: Colors.ink },
  toggleDescription: { ...Text_.caption, color: Colors.ink3, marginTop: Spacing.xs },
  toggleAction: { ...Text_.microBold, color: Colors.brand },
  verificationCard: { gap: Spacing.lg, marginTop: Spacing.md, backgroundColor: Colors.surfaceMuted },
  verificationRow: { gap: Spacing.xs },
  verificationLabel: { ...Text_.caption, color: Colors.ink3 },
  verificationValue: { ...Text_.micro, color: Colors.ink, flexShrink: 1 },
  monospace: { fontFamily: 'monospace' },
  originalDocument: { gap: Spacing.md, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.line },
  originalTitle: { ...Text_.microBold, color: Colors.ink },
  originalHint: { ...Text_.caption, color: Colors.ink3, lineHeight: 18 },
  originalText: { ...Text_.caption, color: Colors.ink2, lineHeight: 19, fontFamily: 'monospace' },
});
