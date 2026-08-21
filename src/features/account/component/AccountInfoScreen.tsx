import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { PHeader, Screen } from '@/components/phone';
import { SectionLabel, Tag } from '@/components/ui';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { formatDate } from '@/utils/format';
import { GENDER_LABEL, KYC_LABEL, KYC_TONE, ROLE_LABEL } from '../constant';
import { useMyProfile } from '../hook/useAccount';

/** Giá trị chưa khai hiển thị nhất quán một kiểu thay vì ô trống. */
const EMPTY = 'Chưa cập nhật';

/**
 * Thông tin tài khoản — toàn bộ dữ liệu `GET /users/me` của người đang đăng nhập.
 *
 * Chỉ đọc: họ tên, ngày sinh, CCCD... đến từ eKYC nên không sửa tay được ở đây;
 * muốn thay đổi phải qua luồng định danh lại.
 */
export default function AccountInfoScreen() {
  const profile = useMyProfile();

  if (profile.loading) {
    return (
      <Screen>
        <PHeader title="Thông tin tài khoản" back />
        <LoadingScreen cards={3} />
      </Screen>
    );
  }
  if (profile.error) {
    return (
      <Screen>
        <PHeader title="Thông tin tài khoản" back />
        <ErrorState message={profile.error} onRetry={profile.reload} />
      </Screen>
    );
  }
  if (!profile.data) return null;

  const p = profile.data;

  return (
    <Screen onRefresh={profile.reload} refreshing={false}>
      <PHeader title="Thông tin tài khoản" back />

      <SectionLabel>Tài khoản</SectionLabel>
      <InfoRow label="Email" value={p.email} />
      <InfoRow label="Số điện thoại" value={p.phone} />
      <InfoRow label="Vai trò" value={ROLE_LABEL[p.role]} />
      <InfoRow
        label="Trạng thái định danh"
        value={<Tag tone={KYC_TONE[p.kycStatus]} small>{KYC_LABEL[p.kycStatus]}</Tag>}
        last
      />

      <SectionLabel style={styles.section}>Thông tin cá nhân</SectionLabel>
      <InfoRow label="Họ và tên" value={p.fullName} />
      <InfoRow label="Ngày sinh" value={p.dateOfBirth ? formatDate(p.dateOfBirth) : null} />
      <InfoRow label="Giới tính" value={p.gender ? GENDER_LABEL[p.gender] : null} />
      <InfoRow label="Số CCCD" value={p.idNumber} />
      <InfoRow label="Quê quán" value={p.placeOfOrigin} />
      <InfoRow label="Địa chỉ thường trú" value={p.address} last />

      <Text style={styles.note}>
        Thông tin cá nhân được lấy từ hồ sơ định danh (eKYC). Nếu có sai sót, vui lòng thực hiện
        định danh lại hoặc liên hệ hỗ trợ.
      </Text>
    </Screen>
  );
}

/** Dòng nhãn trên, giá trị dưới — giá trị dài (địa chỉ) tự xuống dòng thoải mái. */
function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <Text style={styles.label}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={styles.value}>{value}</Text>
      ) : (
        value ?? <Text style={styles.empty}>{EMPTY}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: Spacing.section },
  row: { gap: Spacing.xs, paddingVertical: Spacing.lg },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  label: { ...Text_.micro, color: Colors.ink3 },
  value: { ...Text_.body, color: Colors.ink },
  empty: { ...Text_.body, color: Colors.ink3 },
  note: { ...Text_.micro, color: Colors.ink3, marginTop: Spacing.section },
});
