import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Button, Icon, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { ProfileStackParamList } from '@/navigation/types';
import { IconSize, MIN_TOUCH, Radius, Spacing, Text_ } from '@/theme';
import ContractDocumentSection from '../components/ContractDocumentSection';
import { useContractDetail } from '../hook/useContractDetail';
import { useContractPdf } from '../hook/useContractPdf';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ContractDocument'>;
type Route = RouteProp<ProfileStackParamList, 'ContractDocument'>;

/**
 * Phòng đọc hợp đồng tách khỏi màn tóm tắt. Nội dung được phân cấp thành các khối dễ đọc,
 * còn toàn văn gốc và PDF vẫn dùng đúng documentContent mà Loan Service đã phát hành.
 */
export default function ContractDocumentScreen() {
  const navigation = useNavigation<Nav>();
  const { contractNumber } = useRoute<Route>().params;
  const detail = useContractDetail(contractNumber);

  if (detail.loading) {
    return <Screen><PHeader title="Nội dung hợp đồng" back /><LoadingScreen cards={4} /></Screen>;
  }
  if (detail.loadError || !detail.view) {
    return (
      <Screen>
        <PHeader title="Nội dung hợp đồng" back />
        <ErrorState message={detail.loadError ?? 'Không tải được nội dung hợp đồng.'} onRetry={detail.reload} />
      </Screen>
    );
  }

  return (
    <DocumentBody
      view={detail.view}
      onConsent={() => navigation.navigate('ContractConsent', { contractNumber })}
      onOpenSchedule={() => navigation.navigate('RepaymentSchedule', { source: 'contract', number: contractNumber })}
    />
  );
}

function DocumentBody({
  view,
  onConsent,
  onOpenSchedule,
}: {
  view: NonNullable<ReturnType<typeof useContractDetail>['view']>;
  onConsent: () => void;
  onOpenSchedule: () => void;
}) {
  const pdf = useContractPdf(view.contract);

  return (
    <Screen>
      <PHeader title="Hợp đồng vay" back />

      <View style={styles.toolbar}>
        <View style={styles.toolbarCopy}>
          <Text style={styles.toolbarTitle}>Bản hợp đồng chính thức</Text>
          <Text style={styles.toolbarHint}>Đọc kỹ điều khoản trước khi xác nhận</Text>
        </View>
        <Pressable
          onPress={pdf.exportPdf}
          disabled={pdf.exporting}
          accessibilityRole="button"
          accessibilityLabel="Lưu hoặc chia sẻ hợp đồng PDF"
          accessibilityState={{ busy: pdf.exporting, disabled: pdf.exporting }}
          style={({ pressed }) => [styles.pdfAction, pressed && styles.pressed, pdf.exporting && styles.disabled]}
        >
          {pdf.exporting
            ? <ActivityIndicator size="small" color={Colors.brand} />
            : <Icon name="download" size={IconSize.xs} color={Colors.brand} />}
          <Text style={styles.pdfActionText}>PDF</Text>
        </Pressable>
      </View>
      {pdf.error ? <InfoNote tone="warn" style={styles.pdfError}>{pdf.error}</InfoNote> : null}

      <ContractDocumentSection contract={view.contract} onOpenSchedule={onOpenSchedule} />

      {view.canRespond ? (
        <Button
          label="Tôi đã đọc, sang bước ký"
          onPress={onConsent}
          style={styles.consentButton}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  toolbarCopy: { flex: 1, gap: Spacing.xxs },
  toolbarTitle: { ...Text_.microBold, color: Colors.ink },
  toolbarHint: { ...Text_.caption, color: Colors.ink3 },
  pdfAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minWidth: 84,
    minHeight: MIN_TOUCH,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.tagBlueBorder,
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
  },
  pdfActionText: { ...Text_.microBold, color: Colors.brand },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.45 },
  pdfError: { marginBottom: Spacing.lg },
  consentButton: { marginTop: Spacing.section },
});
