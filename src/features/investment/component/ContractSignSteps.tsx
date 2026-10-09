import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { FontFamily, Radius, SoftShadow, Spacing } from '@/theme';
import InvestButton from './InvestButton';

type StepState = 'todo' | 'active' | 'done';

type Props = {
  /** Đã mở đúng bản PDF hiện hành — điều kiện để được ký. */
  pdfOpened: boolean;
  openingPdf: boolean;
  onOpenPdf: () => void;
  providerIsMock: boolean;
  signed: boolean;
  signing: boolean;
  /** Hợp đồng còn trong hạn ký và đang chờ các nhà đầu tư. */
  windowOpen: boolean;
  submitting: boolean;
  checking: boolean;
  onSign: () => void;
  onCheck: () => void;
  error: string | null;
};

/**
 * Hai bước ký hợp đồng, theo đúng thứ tự backend đòi hỏi: đọc bản PDF hiện hành rồi mới ký. Bước 2
 * khóa cho tới khi bước 1 xong, và nói rõ vì sao đang khóa thay vì để nút mờ không lời giải thích.
 */
export default function ContractSignSteps(props: Props) {
  const { pdfOpened, openingPdf, onOpenPdf, providerIsMock, signed, signing, windowOpen } = props;
  const readState: StepState = pdfOpened || signed ? 'done' : 'active';
  const signState: StepState = signed ? 'done' : pdfOpened ? 'active' : 'todo';

  const signHint = (() => {
    if (signed) return 'Chữ ký của bạn đã được ghi nhận trên đúng bản PDF này.';
    if (signing) return 'Mở ứng dụng VNPT SmartCA, xác nhận giao dịch rồi quay lại đây để kiểm tra kết quả.';
    if (!windowOpen) return 'Hợp đồng đã hết hạn ký hoặc không còn chờ nhà đầu tư.';
    if (!pdfOpened) return 'Mở hợp đồng ở bước 1 trước, rồi mới ký được.';
    return providerIsMock
      ? 'Bản thử nghiệm: xác nhận này chỉ phục vụ phát triển, không thay thế chữ ký số hợp pháp.'
      : 'FINORA gửi giao dịch tới tài khoản VNPT SmartCA của bạn để xác nhận.';
  })();

  return (
    <View style={styles.card}>
      <Step index={1} state={readState} hasNext title="Đọc hợp đồng PDF" hint="Mọi bên ký trên cùng một bản. Bạn cần mở bản hiện hành trước khi ký.">
        <InvestButton
          label={pdfOpened ? 'Mở lại hợp đồng' : 'Mở hợp đồng'}
          icon="file"
          variant={pdfOpened || signed ? 'outline' : 'primary'}
          onPress={onOpenPdf}
          loading={openingPdf}
        />
      </Step>

      <Step index={2} state={signState} title={providerIsMock ? 'Xác nhận hợp đồng' : 'Ký số VNPT SmartCA'} hint={signHint}>
        {signed ? null : signing ? (
          <InvestButton label="Tôi đã xác nhận, kiểm tra kết quả" icon="check" onPress={props.onCheck} loading={props.checking} />
        ) : (
          <InvestButton
            label={providerIsMock ? 'Xác nhận hợp đồng' : 'Gửi yêu cầu ký SmartCA'}
            icon="pen"
            onPress={props.onSign}
            loading={props.submitting}
            disabled={!pdfOpened || !windowOpen}
          />
        )}
      </Step>

      {props.error ? (
        <View style={styles.error} accessibilityRole="alert">
          <Icon name="alert" size={18} color={Colors.tagRedText} />
          <Text style={styles.errorText}>{props.error}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Step({ index, state, hasNext = false, title, hint, children }: { index: number; state: StepState; hasNext?: boolean; title: string; hint: string; children: React.ReactNode }) {
  const done = state === 'done';
  const todo = state === 'todo';
  return (
    <View style={styles.step} accessible={false}>
      <View style={styles.rail}>
        <View
          style={[styles.badge, done ? styles.badgeDone : todo ? styles.badgeTodo : styles.badgeActive]}
          accessibilityLabel={`Bước ${index}${done ? ', đã xong' : ''}`}
        >
          {done ? (
            <Icon name="check" size={16} color={Colors.onDark} strokeWidth={3} />
          ) : (
            <Text style={[styles.badgeText, todo && styles.badgeTextTodo]}>{index}</Text>
          )}
        </View>
        {hasNext ? <View style={styles.connector} /> : null}
      </View>
      <View style={[styles.stepBody, hasNext && styles.stepBodyWithNext]}>
        <Text style={[styles.stepTitle, todo && styles.stepTitleTodo]} maxFontSizeMultiplier={1.4}>{title}</Text>
        <Text style={styles.stepHint} maxFontSizeMultiplier={1.4}>{hint}</Text>
        {children ? <View style={styles.stepAction}>{children}</View> : null}
      </View>
    </View>
  );
}

const BADGE = 30;

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    ...SoftShadow.card,
  },
  step: { flexDirection: 'row', gap: Spacing.lg },
  badge: { width: BADGE, height: BADGE, borderRadius: BADGE / 2, alignItems: 'center', justifyContent: 'center' },
  badgeActive: { backgroundColor: Colors.authPrimary },
  badgeDone: { backgroundColor: Colors.emerald },
  badgeTodo: { backgroundColor: Colors.surfaceMuted, borderWidth: 1, borderColor: Colors.authBorder },
  badgeText: { fontFamily: FontFamily.bold, fontSize: 14, color: Colors.onDark },
  badgeTextTodo: { color: Colors.authMuted },
  rail: { width: BADGE, alignItems: 'center' },
  // Đường nối nằm trong cột huy hiệu và giãn theo chiều cao nội dung bước, nên luôn chạy liền từ
  // huy hiệu này tới huy hiệu bước sau dù mô tả hay nút bên phải cao bao nhiêu.
  connector: { flex: 1, width: 2, backgroundColor: Colors.authBorder },
  stepBody: { flex: 1, minWidth: 0, gap: 4 },
  stepBodyWithNext: { paddingBottom: Spacing.xxxl },
  stepTitle: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 23, color: Colors.authInk },
  stepTitleTodo: { color: Colors.authMuted },
  stepHint: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  stepAction: { marginTop: Spacing.md },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.sm,
    backgroundColor: Colors.redBg,
  },
  errorText: { flex: 1, fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 19, color: Colors.tagRedText },
});
