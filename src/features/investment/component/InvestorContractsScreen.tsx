import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '@/components/feedback';
import { WaveBackdrop } from '@/components/phone';
import { Icon } from '@/components/ui';
import { CONTRACTS_WAVES } from '@/constants/backgrounds';
import { Colors } from '@/constants/colors';
import type { WalletStackParamList } from '@/navigation/types';
import { FontFamily, Radius, Spacing } from '@/theme';
import type { InvestmentContract } from '@/types/invest';
import { CONTRACT_ART_BOTTOM, PORTFOLIO_MAX_WIDTH, PORTFOLIO_PADDING } from '../constant';
import { useInvestmentContracts } from '../hook/useInvestment';
import InvestHeader from './InvestHeader';
import InvestStatusCard from './InvestStatusCard';
import InvestorContractCard from './InvestorContractCard';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'InvestorContracts'>;

/**
 * Danh sách hợp đồng của nhà đầu tư, gồm cả bản cần ký và lịch sử đã ký để có thể mở lại PDF/biên nhận.
 *
 * @param signedOnly mở từ tab Hồ sơ → Hợp đồng: chỉ liệt kê phần vốn nhà đầu tư đã ký, giống màn hợp đồng của
 *                   người vay; bản chờ ký vẫn xử lý ở Ví → Hợp đồng đầu tư.
 */
export default function InvestorContractsScreen({ signedOnly = false }: { signedOnly?: boolean }) {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, PORTFOLIO_MAX_WIDTH);
  const [viewportHeight, setViewportHeight] = useState(0);
  const query = useInvestmentContracts();
  const contracts = (query.data ?? []).filter(contract => !signedOnly || contract.status === 'SIGNED');
  const awaiting = contracts.filter(contract => contract.status === 'PENDING_SIGNATURE' || contract.status === 'SIGNING');
  const history = contracts.filter(contract => contract.status !== 'PENDING_SIGNATURE' && contract.status !== 'SIGNING');

  const open = (contractNumber: string) => navigation.navigate('InvestContract', { contractNumber });

  const renderBody = () => {
    if (query.loading && !query.data) {
      return <><Skeleton height={112} radius={Radius.md} /><Skeleton height={190} radius={Radius.md} /></>;
    }
    if (query.error) {
      return <InvestStatusCard icon="alert" danger title={query.error} hint="Kiểm tra kết nối rồi thử lại." action={{ label: 'Thử lại', onPress: query.reload }} />;
    }
    if (contracts.length === 0) {
      return (
        <InvestStatusCard
          icon="file"
          title={signedOnly ? 'Bạn chưa có hợp đồng đầu tư đã ký' : 'Bạn chưa có hợp đồng đầu tư'}
          hint={signedOnly
            ? 'Hợp đồng chờ ký nằm ở Ví → Hợp đồng đầu tư; ký xong hợp đồng sẽ hiện ở đây.'
            : 'Hợp đồng được lập khi khoản vay bạn góp vốn đã gọi đủ tiền.'}
          action={{ label: 'Quay lại', onPress: () => navigation.goBack() }}
        />
      );
    }
    return (
      <>
        {awaiting.length > 0 ? (
          <ContractSection title="Cần bạn xử lý" hint="Đọc đúng bản PDF rồi ký hoặc từ chối trước hạn." contracts={awaiting} onOpen={open} />
        ) : null}
        {history.length > 0 ? (
          <ContractSection title="Hợp đồng của bạn" hint="Xem lại hợp đồng, bản PDF đã ký và biên nhận chữ ký." contracts={history} onOpen={open} />
        ) : null}
      </>
    );
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      onLayout={event => setViewportHeight(event.nativeEvent.layout.height)}
      refreshControl={<RefreshControl refreshing={query.loading && !!query.data} onRefresh={query.reload} tintColor={Colors.authPrimary} colors={[Colors.authPrimary]} />}
    >
      <View style={{ width, minHeight: viewportHeight }}>
        <WaveBackdrop background={CONTRACTS_WAVES} width={width} />
        <View style={styles.content}>
          <InvestHeader title="Hợp đồng đầu tư" topInset={insets.top} minHeight={CONTRACT_ART_BOTTOM * (width / CONTRACTS_WAVES.width)} />
          <View style={styles.explainer}>
            <Icon name="info" size={19} color={Colors.authPrimary} />
            <Text style={styles.explainerText}>
              Mỗi khoản vay chỉ có một hợp đồng chung. Mã hồ sơ LA, mã khoản vay LN và mã hợp đồng giúp bạn đối chiếu đúng phần vốn đã góp.
            </Text>
          </View>
          {renderBody()}
        </View>
      </View>
    </ScrollView>
  );
}

function ContractSection({
  title,
  hint,
  contracts,
  onOpen,
}: {
  title: string;
  hint: string;
  contracts: readonly InvestmentContract[];
  onOpen: (contractNumber: string) => void;
}) {
  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.sectionTitle} accessibilityRole="header">{title}</Text>
        <Text style={styles.sectionHint}>{hint}</Text>
      </View>
      {contracts.map(contract => (
        <InvestorContractCard key={contract.reference} contract={contract} onPress={() => onOpen(contract.reference)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.contractsFill },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { gap: Spacing.xl, paddingHorizontal: PORTFOLIO_PADDING, paddingBottom: 64 },
  explainer: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, padding: Spacing.lg, borderRadius: Radius.md, backgroundColor: Colors.walletHistoryNote },
  explainerText: { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
  section: { gap: Spacing.md },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: 17, lineHeight: 24, color: Colors.authInk },
  sectionHint: { marginTop: 2, fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 19, color: Colors.authMuted },
});
