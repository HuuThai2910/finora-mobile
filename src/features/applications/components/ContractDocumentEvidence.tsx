import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import type { LoanContractDetail } from '@/types/contract';
import { formatDateTime } from '@/utils/format';
import DisclosureSection from './DisclosureSection';

/** Dấu vết ký và dữ liệu kỹ thuật được tách khỏi các điều khoản borrower cần quét nhanh. */
export default function ContractDocumentEvidence({ contract }: { contract: LoanContractDetail }) {
  const confirmed = ['SIGNED', 'EFFECTIVE', 'COMPLETED'].includes(contract.status);

  return (
    <>
      {confirmed ? (
        <Card style={styles.confirmation}>
          <View style={styles.confirmationMark}><Text style={styles.confirmationMarkText}>✓</Text></View>
          <View style={styles.confirmationBody}>
            <Text style={styles.confirmationTitle}>Đã xác nhận điện tử</Text>
            <Text style={styles.confirmationText}>{contract.signedBy ?? 'Người vay'}</Text>
            <Text style={styles.confirmationHint}>
              {contract.signedAt ? formatDateTime(contract.signedAt) : 'Chưa có thời gian xác nhận'} · Click-wrap
            </Text>
          </View>
        </Card>
      ) : null}

      <DisclosureSection
        title="Toàn văn và thông tin đối chiếu"
        hint="Bản gốc, phiên bản tài liệu và mã kiểm tra SHA-256"
      >
        <VerificationValue label="Phiên bản điều khoản" value={contract.termsVersion} />
        <VerificationValue label="Phiên bản tài liệu" value={contract.documentVersion} />
        <VerificationValue label="Mã kiểm tra nội dung" value={contract.documentHash} monospace />
        <VerificationValue label="Mã kiểm tra lịch trả" value={contract.scheduleResponseHash} monospace />
        <View style={styles.originalDocument}>
          <Text style={styles.originalTitle}>Toàn văn do Loan Service phát hành</Text>
          <Text selectable style={styles.originalText}>{contract.documentContent}</Text>
        </View>
      </DisclosureSection>
    </>
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
  confirmation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderColor: Colors.tagGreenBorder,
    backgroundColor: Colors.emeraldBg,
  },
  confirmationMark: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.emerald,
  },
  confirmationMarkText: { ...Text_.bodyBold, color: Colors.onDark },
  confirmationBody: { flex: 1, gap: Spacing.xxs },
  confirmationTitle: { ...Text_.bodyBold, color: Colors.tagGreenText },
  confirmationText: { ...Text_.microBold, color: Colors.ink },
  confirmationHint: { ...Text_.caption, color: Colors.ink2 },
  verificationRow: { gap: Spacing.xxs, paddingVertical: Spacing.lg },
  verificationLabel: { ...Text_.caption, color: Colors.ink3 },
  verificationValue: { ...Text_.micro, color: Colors.ink, flexShrink: 1 },
  monospace: { fontFamily: 'monospace' },
  originalDocument: { gap: Spacing.md, paddingVertical: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.line },
  originalTitle: { ...Text_.microBold, color: Colors.ink },
  originalText: { ...Text_.caption, color: Colors.ink2, lineHeight: 19 },
});
