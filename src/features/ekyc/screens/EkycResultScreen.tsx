import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { Screen, PHeader } from '@/components/phone';
import { Button, Icon, InfoNote } from '@/components/ui';
import { useSubmit } from '@/hooks/useSubmit';
import { useAuth } from '@/providers/AuthProvider';
import { getMyProfile } from '@/features/auth';
import type { ProfileStackParamList } from '@/navigation/types';
import type { EkycResultCode } from '@/types/ekyc';
import { RESULT_FALLBACK_MESSAGE, WARNING_LABELS } from '../constants';
import { confirmEkyc } from '../api/ekycApi';
import { useEkycSession } from '../hooks/useEkycSession';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'EkycResult'>;

/**
 * Với lỗi tạm thời (gọi quá nhanh, AI bận) ảnh trong phiên vẫn dùng được —
 * chỉ cần lùi về màn mặt sau bấm gửi lại. Lỗi thuộc về ảnh/số CCCD thì phải
 * chụp lại từ mặt trước.
 */
const RESUBMIT_CODES: ReadonlySet<EkycResultCode> = new Set(['RATE_LIMITED', 'AI_UNAVAILABLE']);

/**
 * Bản nháp thông tin OCR chờ người dùng soát.
 *
 * Hồ sơ CHƯA được lưu khi vào màn này: bản nháp nằm phía server, người dùng
 * thấy sai thì quét lại, chỉ khi bấm xác nhận backend mới ghi vào hồ sơ và
 * chuyển VERIFIED. Xác nhận xong hồ sơ trong phiên được tải lại để tên và
 * trạng thái mới hiện ngay trên các màn khác.
 */
export default function EkycResultScreen() {
  const nav = useNavigation<Nav>();
  const { updateProfile } = useAuth();
  const { result, reset } = useEkycSession();

  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const confirm = useSubmit(useCallback(() => confirmEkyc(), []));

  const onConfirm = async () => {
    setConfirmError(null);
    const outcome = await confirm.submit();
    if (!outcome) return; // lỗi vận chuyển — useSubmit đã giữ thông điệp

    if (outcome.resultCode !== 'VERIFIED') {
      // Bản nháp hết hạn / số CCCD vừa bị tài khoản khác chiếm
      setConfirmError(outcome.message || RESULT_FALLBACK_MESSAGE[outcome.resultCode]);
      return;
    }

    // Hồ sơ vừa thay đổi phía server — tải lại để phiên cầm bản mới nhất
    updateProfile(await getMyProfile());
    setConfirmed(true);
  };

  const onRescan = () => {
    reset();
    nav.popToTop();
  };

  const onFinish = () => {
    reset();
    nav.popToTop();
  };

  // Không có kết quả nghĩa là màn này bị mở ngoài luồng — không bịa dữ liệu.
  if (!result) {
    return (
      <Screen light>
        <PHeader title="Định danh điện tử" back />
        <View style={styles.head}>
          <Text style={styles.title} accessibilityRole="header">
            Chưa có kết quả
          </Text>
          <Text style={styles.sub}>Hãy thực hiện lại quy trình định danh.</Text>
        </View>
        <Button
          label="Bắt đầu định danh"
          icon="scan"
          onPress={() => nav.navigate('EkycCapture', { side: 'front' })}
          style={styles.action}
        />
      </Screen>
    );
  }

  // Đã bấm xác nhận thành công — hồ sơ đã lưu và VERIFIED
  if (confirmed) {
    return (
      <Screen light>
        <View style={styles.head}>
          <View style={[styles.badge, styles.badgeOk]}>
            <Icon name="check" size={48} color={Colors.emerald} strokeWidth={3} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            Định danh thành công
          </Text>
          <Text style={styles.sub}>Thông tin đã được lưu vào hồ sơ của bạn.</Text>
        </View>
        <Button label="Hoàn tất" onPress={onFinish} style={styles.action} />
      </Screen>
    );
  }

  const draft = result.resultCode === 'DRAFT_READY' ? result.draft : null;
  const message = result.message || RESULT_FALLBACK_MESSAGE[result.resultCode];

  // Quét thất bại (ảnh mờ, số không hợp lệ, dịch vụ bận...) — chưa có bản nháp
  if (!draft) {
    const canResubmit = RESUBMIT_CODES.has(result.resultCode);
    return (
      <Screen light>
        <View style={styles.head}>
          <View style={[styles.badge, styles.badgeFail]}>
            <Icon name="x" size={48} color={Colors.red} strokeWidth={3} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            Chưa xác minh được
          </Text>
          <Text style={styles.sub}>{message}</Text>
        </View>
        {canResubmit ? (
          <Button label="Gửi lại" icon="check" onPress={() => nav.goBack()} style={styles.action} />
        ) : (
          <Button label="Chụp lại từ đầu" icon="scan" onPress={onRescan} style={styles.action} />
        )}
      </Screen>
    );
  }

  // Bản nháp — người dùng soát từng dòng trước khi cho lưu
  return (
    <Screen light>
      <PHeader title="Kiểm tra thông tin" back />
      <Text style={styles.lead}>
        Đối chiếu với CCCD của bạn. Thông tin <Text style={styles.leadBold}>chưa được lưu</Text> —
        xác nhận đúng thì hệ thống mới ghi vào hồ sơ.
      </Text>

      <DraftRow label="Số CCCD" value={draft.idNumber} />
      <DraftRow label="Họ và tên" value={draft.fullName} />
      <DraftRow label="Ngày sinh" value={draft.dateOfBirth} />
      <DraftRow label="Giới tính" value={draft.gender} />
      <DraftRow label="Quê quán" value={draft.placeOfOrigin} />
      <DraftRow label="Nơi thường trú" value={draft.address} last />

      {result.ocrWarnings.length > 0 ? (
        <InfoNote tone="warn" style={styles.note}>
          <Text style={styles.warnText}>
            {result.ocrWarnings.map(code => WARNING_LABELS[code] ?? code).join('\n')}
          </Text>
        </InfoNote>
      ) : null}

      {confirmError ?? confirm.error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {confirmError ?? confirm.error}
        </Text>
      ) : null}

      <Button
        label="Thông tin chính xác — Xác nhận"
        variant="emerald"
        loading={confirm.submitting}
        disabled={confirm.submitting}
        onPress={() => void onConfirm()}
        style={styles.action}
      />
      <Button
        label="Sai thông tin — Quét lại"
        variant="outline"
        disabled={confirm.submitting}
        onPress={onRescan}
        style={styles.secondary}
      />
    </Screen>
  );
}

/** Dòng nhãn trên, giá trị dưới — giá trị dài (địa chỉ) tự xuống dòng thoải mái. */
function DraftRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string | null;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? (
        <Text style={styles.rowValue}>{value}</Text>
      ) : (
        <Text style={styles.rowEmpty}>Không đọc được</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.section,
    marginBottom: Spacing.xxl,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  badgeOk: { backgroundColor: Colors.greenBg },
  badgeFail: { backgroundColor: Colors.redBg },
  title: { ...Text_.display, color: Colors.ink, textAlign: 'center' },
  sub: { ...Text_.micro, color: Colors.ink3, textAlign: 'center' },
  lead: { ...Text_.micro, color: Colors.ink2, marginBottom: Spacing.lg },
  leadBold: { fontFamily: Text_.microBold.fontFamily, color: Colors.ink },
  row: { gap: Spacing.xs, paddingVertical: Spacing.lg },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  rowLabel: { ...Text_.micro, color: Colors.ink3 },
  rowValue: { ...Text_.body, color: Colors.ink },
  rowEmpty: { ...Text_.body, color: Colors.ink3 },
  note: { marginTop: Spacing.xl },
  warnText: { ...Text_.micro, color: Colors.warnText },
  error: { ...Text_.micro, color: Colors.red, marginTop: Spacing.lg },
  action: { marginTop: Spacing.xl },
  secondary: { marginTop: Spacing.md },
});
