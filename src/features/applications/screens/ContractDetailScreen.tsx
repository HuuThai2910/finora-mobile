import { Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState, LoadingScreen } from '@/components/feedback';
import { PHeader, Screen } from '@/components/phone';
import { Button, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { ProfileStackParamList } from '@/navigation/types';
import { MIN_TOUCH, Spacing, Text_ } from '@/theme';
import { useContractDetail } from '../hook/useContractDetail';
import ContractOverviewCard from '../components/ContractOverviewCard';
import ProcessTimeline from '../components/ProcessTimeline';
import PricingChangeNotice from '../components/PricingChangeNotice';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ContractDetail'>;

/**
 * Màn đọc hợp đồng. Đây là nơi để *hiểu* hợp đồng, việc ký hoặc từ chối nằm ở
 * `ContractConsentScreen`.
 *
 * Tách như vậy vì ở bản cũ toàn văn hợp đồng nằm lẫn với tóm tắt tài chính.
 * Màn này cho biết trạng thái và nghĩa vụ chính; phòng đọc tài liệu/PDF là một
 * màn riêng và chỉ từ đó mới đi tiếp sang bước ký.
 *
 * Màn này chỉ tóm tắt nhận diện, trạng thái và hạn xác nhận. Toàn bộ nghĩa vụ tiền
 * và lịch trả nằm trong phòng đọc để một con số không xuất hiện ở hai khối cạnh nhau.
 */
export default function ContractDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { contractNumber } = useRoute<RouteProp<ProfileStackParamList, 'ContractDetail'>>().params;
  const state = useContractDetail(contractNumber);

  if (state.loading) {
    return (
      <Screen>
        <PHeader title="Hợp đồng vay" back />
        <LoadingScreen cards={4} />
      </Screen>
    );
  }

  if (state.loadError || !state.view) {
    return (
      <Screen>
        <PHeader title="Hợp đồng vay" back />
        <ErrorState
          message={state.loadError ?? 'Không tải được hợp đồng vay.'}
          onRetry={state.reload}
        />
      </Screen>
    );
  }

  const {
    contract,
    pricingApplication,
    timeline,
    timelineFailed,
    countdown,
    canRespond,
    expiredWhileWaiting,
  } = state.view;

  return (
    <Screen
      onRefresh={state.reload}
      refreshing={state.refreshing}
      footer={
        canRespond ? (
          <Button
            label="Đọc nội dung và ký"
            onPress={() => navigation.navigate('ContractDocument', { contractNumber })}
          />
        ) : undefined
      }
    >
      <PHeader title="Hợp đồng vay" back />

      <ContractOverviewCard contract={contract} countdown={countdown} />

      {pricingApplication ? <PricingChangeNotice application={pricingApplication} /> : null}

      {expiredWhileWaiting ? (
        <InfoNote tone="warn" style={styles.note}>
          Hợp đồng đã quá hạn xác nhận nên không còn ký được. Hệ thống sẽ cập nhật trạng thái sang
          “Đã hết hạn”; nếu vẫn cần vay, bạn hãy nộp hồ sơ mới.
        </InfoNote>
      ) : null}

      <Pressable
        onPress={() =>
          navigation.navigate('ApplicationDetail', {
            applicationNumber: contract.applicationNumber,
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`Mở hồ sơ ${contract.applicationNumber}`}
        style={({ pressed }) => [styles.origin, pressed && styles.pressed]}
      >
        <Text style={styles.originText}>Lập từ hồ sơ {contract.applicationNumber}</Text>
      </Pressable>

      {!canRespond ? (
        <Button
          label="Xem nội dung hợp đồng"
          icon="file"
          variant="outline"
          onPress={() => navigation.navigate('ContractDocument', { contractNumber })}
          style={styles.documentButton}
        />
      ) : null}

      <ProcessTimeline title="LỊCH SỬ HỢP ĐỒNG" steps={timeline} failed={timelineFailed} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { marginTop: Spacing.xl },
  origin: { justifyContent: 'center', minHeight: MIN_TOUCH, marginTop: Spacing.sm },
  pressed: { opacity: 0.6 },
  originText: { ...Text_.micro, color: Colors.brand },
  documentButton: { marginTop: Spacing.section },
});
