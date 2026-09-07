import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabBar } from '@/components/phone';
import { HomeScreen, NotificationsScreen } from '@/features/home';
import { LoanDetailScreen, MarketScreen } from '@/features/market';
import {
  PackageDetailScreen,
  ProductDetailScreen,
  ProductListScreen,
  ScheduleScreen,
  VentoPackagesScreen,
} from '@/features/products';
import {
  ApplicationDetailScreen,
  ApplyFormScreen,
  ContractDetailScreen,
  MyApplicationsScreen,
  MyContractsScreen,
  RepaymentScheduleScreen,
} from '@/features/applications';
import {
  PayInstallmentScreen,
  TopUpScreen,
  WalletHistoryScreen,
  WithdrawScreen,
} from '@/features/wallet';
import { AutoInvestScreen, InvestContractScreen, PortfolioScreen } from '@/features/investment';
import { AccountInfoScreen, AccountScreen } from '@/features/account';
import { EkycCaptureScreen, EkycResultScreen, EkycSessionProvider } from '@/features/ekyc';
import type {
  HomeStackParamList,
  MarketStackParamList,
  ProfileStackParamList,
  TabParamList,
  WalletStackParamList,
} from './types';

const stackOptions = { headerShown: false, animation: 'slide_from_right' } as const;

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
function HomeTab() {
  return (
    <HomeStack.Navigator screenOptions={stackOptions}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    </HomeStack.Navigator>
  );
}

const MarketStack = createNativeStackNavigator<MarketStackParamList>();
function MarketTab() {
  return (
    <MarketStack.Navigator screenOptions={stackOptions}>
      <MarketStack.Screen name="Market" component={MarketScreen} />
      <MarketStack.Screen name="LoanDetail" component={LoanDetailScreen} />
      <MarketStack.Screen name="Products" component={ProductListScreen} />
      <MarketStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <MarketStack.Screen name="Schedule" component={ScheduleScreen} />
      <MarketStack.Screen name="VentoPackages" component={VentoPackagesScreen} />
      <MarketStack.Screen name="PackageDetail" component={PackageDetailScreen} />
      <MarketStack.Screen name="ApplyForm" component={ApplyFormScreen} />
    </MarketStack.Navigator>
  );
}

const WalletStack = createNativeStackNavigator<WalletStackParamList>();
function WalletTab() {
  return (
    <WalletStack.Navigator screenOptions={stackOptions}>
      <WalletStack.Screen name="WalletHistory" component={WalletHistoryScreen} />
      <WalletStack.Screen name="TopUp" component={TopUpScreen} />
      <WalletStack.Screen name="Withdraw" component={WithdrawScreen} />
      <WalletStack.Screen name="PayInstallment" component={PayInstallmentScreen} />
      <WalletStack.Screen name="Portfolio" component={PortfolioScreen} />
      <WalletStack.Screen name="AutoInvest" component={AutoInvestScreen} />
      <WalletStack.Screen name="InvestContract" component={InvestContractScreen} />
    </WalletStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileTab() {
  return (
    // eKYC là chức năng tuỳ chọn trong tab Hồ sơ. Ảnh CCCD đi giữa các màn qua
    // EkycSessionProvider (không qua params) nên provider bọc cả stack này.
    <EkycSessionProvider>
      <ProfileStack.Navigator screenOptions={stackOptions}>
      <ProfileStack.Screen name="Profile" component={AccountScreen} />
      <ProfileStack.Screen name="AccountInfo" component={AccountInfoScreen} />
      <ProfileStack.Screen name="EkycCapture" component={EkycCaptureScreen} />
      <ProfileStack.Screen name="EkycResult" component={EkycResultScreen} />
      <ProfileStack.Screen name="MyApplications" component={MyApplicationsScreen} />
      <ProfileStack.Screen name="ApplicationDetail" component={ApplicationDetailScreen} />
      <ProfileStack.Screen name="MyContracts" component={MyContractsScreen} />
      <ProfileStack.Screen name="ContractDetail" component={ContractDetailScreen} />
      <ProfileStack.Screen name="RepaymentSchedule" component={RepaymentScheduleScreen} />
      </ProfileStack.Navigator>
    </EkycSessionProvider>
  );
}

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Bốn tab đúng theo hàm `TABBAR` của mockup: Trang chủ · Sàn · Ví · Hồ sơ.
 * Mỗi màn được xếp vào tab mà mockup gán cho nó qua tham số `TABBAR(n)` — nhờ
 * vậy mở "Nạp tiền" từ nút tắt ở Trang chủ vẫn sáng tab Ví như bản thiết kế.
 */
export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={props => <TabBar {...props} />}>
      <Tab.Screen name="Trang chủ" component={HomeTab} />
      <Tab.Screen name="Sàn" component={MarketTab} />
      <Tab.Screen name="Ví" component={WalletTab} />
      <Tab.Screen name="Hồ sơ" component={ProfileTab} />
    </Tab.Navigator>
  );
}
