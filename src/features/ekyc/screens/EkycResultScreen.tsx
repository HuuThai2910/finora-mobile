import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Text_ } from '@/theme';
import { Screen, PItem } from '@/components/phone';
import { Button, Icon, InfoNote, Tag } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import type { EkycStackParamList } from '@/navigation/types';
import type { EkycResultCode } from '@/types/ekyc';
import { RESULT_FALLBACK_MESSAGE, WARNING_LABELS } from '../constants';
import { useEkycSession } from '../hooks/useEkycSession';

type Nav = NativeStackNavigationProp<EkycStackParamList, 'EkycResult'>;

/**
 * Với lỗi tạm thời (gọi quá nhanh, AI bận) ảnh trong phiên vẫn dùng được —
 * chỉ cần lùi về màn mặt sau bấm gửi lại. Lỗi thuộc về ảnh/số CCCD thì phải
 * chụp lại từ mặt trước.
 */
const RESUBMIT_CODES: ReadonlySet<EkycResultCode> = new Set(['RATE_LIMITED', 'AI_UNAVAILABLE']);

/** Màn kết quả định danh bằng giấy tờ hai mặt. */
export default function EkycResultScreen() {
  const nav = useNavigation<Nav>();
  const { completeKyc } = useAuth();
  const { result, reset } = useEkycSession();

  // Không có kết quả nghĩa là màn này bị mở ngoài luồng — không bịa dữ liệu.
  if (!result) {
    return (
      <Screen light>
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

  const passed = result.resultCode === 'VERIFIED';
  const message = result.message || RESULT_FALLBACK_MESSAGE[result.resultCode];
  const canResubmit = RESUBMIT_CODES.has(result.resultCode);

  return (
    <Screen light>
      <View style={styles.head}>
        <View style={[styles.badge, passed ? styles.badgeOk : styles.badgeFail]}>
          <Icon
            name={passed ? 'check' : 'x'}
            size={48}
            color={passed ? Colors.emerald : Colors.red}
            strokeWidth={3}
          />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {passed ? 'Định danh thành công' : 'Chưa xác minh được'}
        </Text>
        <Text style={styles.sub}>{message}</Text>
      </View>

      <PItem
        label="Giấy tờ (CCCD hai mặt)"
        value={
          <Tag tone={passed ? 'green' : 'red'} small>
            {passed ? 'ĐÃ XÁC MINH' : 'CHƯA ĐẠT'}
          </Tag>
        }
      />
      <PItem
        label="Trạng thái hồ sơ"
        value={
          <Tag tone={passed ? 'green' : 'amber'} small>
            {result.status}
          </Tag>
        }
        last
      />

      {result.ocrWarnings.length > 0 ? (
        <InfoNote tone="warn" style={styles.note}>
          <Text style={styles.warnText}>
            {result.ocrWarnings.map(code => WARNING_LABELS[code] ?? code).join('\n')}
          </Text>
        </InfoNote>
      ) : null}

      {passed ? (
        <Button
          label="Bắt đầu sử dụng"
          onPress={() => {
            reset();
            completeKyc();
          }}
          style={styles.action}
        />
      ) : canResubmit ? (
        <Button label="Gửi lại" icon="check" onPress={() => nav.goBack()} style={styles.action} />
      ) : (
        <Button
          label="Chụp lại từ đầu"
          icon="scan"
          onPress={() => nav.popToTop()}
          style={styles.action}
        />
      )}
    </Screen>
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
  note: { marginTop: Spacing.xl },
  warnText: { ...Text_.micro, color: Colors.warnText },
  action: { marginTop: Spacing.xl },
});
