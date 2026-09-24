import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { Spacing, Text_ } from '@/theme';
import { PHeader, PItem, Screen } from '@/components/phone';
import { Button, Field, InfoNote, SectionLabel } from '@/components/ui';
import { formatVND } from '@/utils/format';
import type { WalletStackParamList } from '@/navigation/types';
import { listNoteForSale } from '../api';
import {
  DEFAULTED_SELL_WARNING,
  FEE_RATE_PERCENT,
  SECONDARY_INTRO,
} from '../constant';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'SellNote'>;
type Route = RouteProp<WalletStackParamList, 'SellNote'>;

/**
 * Treo một Note đang giữ lên chợ thứ cấp.
 *
 * Trần giá bằng dư nợ gốc còn lại. Màn hình chặn trước khi gửi để người bán biết ngay, nhưng backend
 * vẫn là nơi quyết định — kiểm ở client chỉ để trải nghiệm tốt hơn, không thay thế kiểm ở server.
 *
 * Phí và tiền thực nhận hiện sẵn theo giá đang gõ, để người bán không phải tự tính 5%.
 */
export default function SellNoteScreen() {
  const nav = useNavigation<Nav>();
  const { noteNumber, noteId, outstandingPrincipal, defaulted } = useRoute<Route>().params;

  const [price, setPrice] = useState(String(outstandingPrincipal));
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const numeric = Number(price.replace(/\D/g, ''));
  const valid = Number.isFinite(numeric) && numeric > 0 && numeric <= outstandingPrincipal;
  const tooHigh = numeric > outstandingPrincipal;

  // Con số chỉ để hiển thị; backend chốt phí chính thức tại thời điểm có người mua.
  const fee = valid ? Math.floor(numeric * (FEE_RATE_PERCENT / 100)) : 0;
  const proceeds = valid ? numeric - fee : 0;

  const handleSubmit = async () => {
    if (!valid) return;
    setSubmitting(true);
    setFailed(null);
    try {
      await listNoteForSale(noteNumber, noteId, numeric);
      setDone(true);
    } catch (error) {
      setFailed(error instanceof Error ? error.message : 'Không đăng bán được Note này.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Screen>
        <PHeader title="Đăng bán Note" back />
        <InfoNote tone="success" style={styles.block}>
          Đã treo {noteNumber} với giá {formatVND(numeric)}. Note vẫn thuộc về bạn và tiếp tục nhận
          gốc lãi cho tới khi có người mua.
        </InfoNote>
        <Button label="Về chợ thứ cấp" onPress={() => nav.goBack()} style={styles.action} />
      </Screen>
    );
  }

  return (
    <Screen>
      <PHeader title="Đăng bán Note" back />

      <InfoNote style={styles.block}>{SECONDARY_INTRO}</InfoNote>

      {defaulted && (
        <InfoNote tone="warn" style={styles.block}>
          {DEFAULTED_SELL_WARNING}
        </InfoNote>
      )}

      <SectionLabel>Note đem bán</SectionLabel>
      <PItem label="Mã Note" value={noteNumber} />
      <PItem label="Dư nợ gốc còn lại" value={formatVND(outstandingPrincipal)} last />

      <SectionLabel style={styles.section}>Giá bán</SectionLabel>
      <Field
        label="Giá bạn muốn nhận (đ)"
        value={price}
        onChangeText={setPrice}
        keyboardType="number-pad"
        error={tooHigh ? `Không được vượt dư nợ gốc ${formatVND(outstandingPrincipal)}` : undefined}
        helper={
          tooHigh
            ? undefined
            : `Tối đa ${formatVND(outstandingPrincipal)} — người mua phải trả không quá phần gốc họ nhận về`
        }
      />

      {valid && (
        <>
          <PItem label={`Phí nền tảng (${FEE_RATE_PERCENT}%)`} value={formatVND(fee)} />
          <PItem label="Bạn thực nhận" value={formatVND(proceeds)} last />
          <Text style={styles.explain}>
            Bán thấp hơn dư nợ {formatVND(outstandingPrincipal - numeric)} là phần bạn nhường cho
            người mua để lấy tiền ngay. Cộng thêm phí, bạn nhận ít hơn dư nợ{' '}
            {formatVND(outstandingPrincipal - proceeds)}.
          </Text>
        </>
      )}

      {failed && (
        <InfoNote tone="warn" style={styles.blockTop}>
          {failed}
        </InfoNote>
      )}

      <Button
        label={submitting ? 'Đang đăng bán…' : 'Đăng bán'}
        onPress={handleSubmit}
        disabled={!valid || submitting}
        style={styles.action}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: Spacing.lg },
  blockTop: { marginTop: Spacing.lg },
  section: { marginTop: Spacing.xxl },
  explain: {
    ...Text_.micro,
    color: Colors.ink3,
    marginTop: Spacing.md,
    lineHeight: 18,
  },
  action: { marginTop: Spacing.xl },
});
