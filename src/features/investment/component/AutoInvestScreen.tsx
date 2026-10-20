import { useEffect, useRef, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '@/components/feedback';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { generateIdempotencyKey, toUserMessage } from '@/lib/api';
import { usePinGuard } from '@/features/pin';
import { FontFamily, Radius, Spacing } from '@/theme';
import type { AutoInvestConfig } from '@/types/invest';
import { RISK_DISCLOSURE_TEXT, RISK_DISCLOSURE_VERSION } from '@/features/market/constant';
import { saveAutoInvest } from '../api';
import { toDraft, validateDraft, type Draft, type DraftErrors } from '../autoInvestDraft';
import { AUTO_INVEST_FOOTNOTE, PORTFOLIO_MAX_WIDTH, PORTFOLIO_PADDING } from '../constant';
import { useAutoInvest, useAutoInvestMatches } from '../hook/useInvestment';
import AutoInvestBanner from './AutoInvestBanner';
import AutoInvestCriteriaCard from './AutoInvestCriteriaCard';
import AutoInvestMatchList from './AutoInvestMatchList';
import AutoInvestToggleCard from './AutoInvestToggleCard';
import InvestStatusCard from './InvestStatusCard';

/**
 * Màn 21 — Auto-Invest (vẽ lại theo bộ mockup trang chủ/Sàn): banner ba robot làm việc trên sàn, thẻ
 * bật/tắt, thẻ tiêu chí sửa tại chỗ, các lần khớp gần đây và ghi chú về tiền giữ.
 */
export default function AutoInvestScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, PORTFOLIO_MAX_WIDTH);
  const [viewportHeight, setViewportHeight] = useState(0);

  const config = useAutoInvest();
  const matches = useAutoInvestMatches();
  const [saved, setSaved] = useState<AutoInvestConfig | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftErrors, setDraftErrors] = useState<DraftErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { requirePin } = usePinGuard();
  // Mỗi lần lưu là một thao tác có mã riêng, token PIN chỉ duyệt đúng lần lưu đó (D38).
  const saveKey = useRef(generateIdempotencyKey());

  useEffect(() => {
    if (config.data) setSaved(config.data);
  }, [config.data]);

  const reload = () => {
    config.reload();
    matches.reload();
  };

  /**
   * Bật Auto-Invest là uỷ quyền đặt lệnh thay mình (Q5): người dùng đọc lại công bố rủi ro như khi tự góp vốn rồi mới
   * xác nhận. Đóng hộp thoại là không lưu.
   */
  const confirmRisk = (): Promise<boolean> => new Promise(resolve => {
    Alert.alert('Xác nhận công bố rủi ro', RISK_DISCLOSURE_TEXT, [
      { text: 'Để sau', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Tôi đã đọc và đồng ý', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });

  /** Mọi lần lưu (bật/tắt hay sửa tiêu chí) đều hỏi PIN; đóng bảng PIN là không lưu, giữ bản nháp. */
  const persist = async (next: AutoInvestConfig): Promise<boolean> => {
    // Hỏi lại khi chuyển tắt → bật, khi quy tắc đang tạm dừng hoặc khi bản đã xác nhận khác bản app đang hiển thị;
    // sửa tiêu chí của quy tắc đang bật và đã xác nhận đúng bản này thì không hỏi lại.
    const needsConfirmation = next.enabled && (!saved?.enabled || saved.pausedForRiskAcknowledgement
      || saved.riskAcknowledgedVersion !== RISK_DISCLOSURE_VERSION);
    if (needsConfirmation && !(await confirmRisk())) return false;
    setSaving(true);
    setSaveError(null);
    try {
      const pinToken = await requirePin('AUTO_INVEST', saveKey.current);
      if (!pinToken) return false;
      setSaved(await saveAutoInvest(next, saveKey.current, pinToken, RISK_DISCLOSURE_VERSION));
      saveKey.current = generateIdempotencyKey();
      return true;
    } catch (e) {
      setSaveError(toUserMessage(e));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggle = (enabled: boolean) => {
    if (saving || !saved) return;
    void persist({ ...saved, enabled });
  };

  const submitDraft = async () => {
    if (!draft || !saved) return;
    const { errors, value } = validateDraft(draft);
    setDraftErrors(errors);
    if (!value) return;
    if (await persist({ ...value, enabled: saved.enabled })) setDraft(null);
  };

  const editDraft = (patch: Partial<Draft>) => {
    setDraft(current => (current ? { ...current, ...patch } : current));
    setDraftErrors(current => {
      const next = { ...current };
      for (const key of Object.keys(patch) as (keyof Draft)[]) delete next[key];
      return next;
    });
  };

  const renderBody = () => {
    if (!saved && config.loading) {
      return (
        <>
          <Skeleton height={112} radius={Radius.md} />
          <Skeleton height={240} radius={Radius.md} />
        </>
      );
    }
    if (!saved) {
      return (
        <InvestStatusCard
          icon="alert"
          danger
          title={config.error ?? 'Chưa tải được cấu hình Auto-Invest.'}
          hint="Kiểm tra kết nối mạng rồi thử lại."
          action={{ label: 'Thử lại', onPress: reload }}
        />
      );
    }
    return (
      <>
        <AutoInvestToggleCard enabled={saved.enabled} saving={saving && !draft} onToggle={toggle} />
        {saved.enabled && saved.pausedForRiskAcknowledgement ? (
          <InvestStatusCard
            icon="alert"
            title="Auto-Invest đang tạm dừng"
            hint="Công bố rủi ro đã được cập nhật. Hãy đọc và xác nhận lại để hệ thống tiếp tục đặt lệnh thay bạn."
            action={{ label: 'Đọc và xác nhận', onPress: () => void persist({ ...saved, enabled: true }) }}
          />
        ) : null}
        {saveError ? (
          <View style={styles.error} accessibilityRole="alert">
            <Icon name="alert" size={18} color={Colors.tagRedText} />
            <Text style={styles.errorText}>{saveError}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
            Tiêu chí khớp
          </Text>
          <AutoInvestCriteriaCard
            saved={saved}
            draft={draft}
            errors={draftErrors}
            saving={saving}
            onEdit={() => setDraft(toDraft(saved))}
            onChange={editDraft}
            onSave={() => void submitDraft()}
            onCancel={() => {
              setDraft(null);
              setDraftErrors({});
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
            Khớp gần đây
          </Text>
          <AutoInvestMatchList matches={matches.data} error={matches.error} />
        </View>

        <View style={styles.note}>
          <Icon name="info" size={20} color={Colors.authPrimary} />
          <Text style={styles.noteText}>{AUTO_INVEST_FOOTNOTE}</Text>
        </View>
      </>
    );
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onLayout={e => setViewportHeight(e.nativeEvent.layout.height)}
      refreshControl={
        <RefreshControl
          refreshing={(config.loading || matches.loading) && !!saved}
          onRefresh={reload}
          tintColor={Colors.authPrimary}
          colors={[Colors.authPrimary]}
        />
      }
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <AutoInvestBanner width={width} topInset={insets.top} />
        <View style={styles.content}>{renderBody()}</View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Nền trùng hàng cuối banner (cùng ảnh màn Sàn): phủ hai bên cột trên web rộng, nối liền mép dưới ảnh.
  root: { flex: 1, backgroundColor: Colors.marketFill },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { gap: Spacing.xl, paddingHorizontal: PORTFOLIO_PADDING, paddingBottom: 40 },
  section: { gap: Spacing.md },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: 17, lineHeight: 24, color: Colors.authInk },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.redBg,
  },
  errorText: { flex: 1, fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 19, color: Colors.tagRedText },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.marketNote,
  },
  noteText: { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
});
