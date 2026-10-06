import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PHeader, Screen } from '@/components/phone';
import { Button, Card, InfoNote } from '@/components/ui';
import { Colors } from '@/constants/colors';
import type { TabParamList, WalletStackParamList } from '@/navigation/types';
import { Spacing, Text_ } from '@/theme';

type Nav = NativeStackNavigationProp<WalletStackParamList, 'PayInstallment'>;
type TabNav = BottomTabNavigationProp<TabParamList>;

/**
 * Route tương thích cho bookmark/build cũ. Luồng trả nợ thật đã chuyển sang
 * feature loan-servicing; không được khôi phục màn fixture trả kỳ trước đây.
 */
export default function PayInstallmentScreen() {
  const nav = useNavigation<Nav>();
  const tabNav = nav.getParent<TabNav>();
  const openServicing = () => tabNav?.navigate('Hồ sơ', { screen: 'LoanServicingList' });

  useEffect(() => {
    openServicing();
  }, [tabNav]);

  return (
    <Screen>
      <PHeader title="Thanh toán khoản vay" back />
      <Card style={styles.card}>
        <Text style={styles.title}>Luồng thanh toán đã được nâng cấp</Text>
        <Text style={styles.body}>Chọn đúng khoản vay để xem nghĩa vụ từ Fineract và thực hiện trả kỳ, trả trước hoặc tất toán.</Text>
      </Card>
      <Button label="Mở quản lý khoản vay" onPress={openServicing} style={styles.action} />
      <InfoNote>Màn này chỉ giữ để các đường dẫn cũ không bị lỗi; không sử dụng dữ liệu trả nợ giả.</InfoNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md },
  title: { ...Text_.title, color: Colors.authInk },
  body: { ...Text_.micro, color: Colors.authMuted },
  action: { marginTop: Spacing.xl },
});
