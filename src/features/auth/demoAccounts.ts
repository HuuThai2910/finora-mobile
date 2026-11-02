export type DemoAccount = Readonly<{
  email: string;
  password: string;
  label: string;
}>;

const SEEDED_DEMO_ACCOUNTS: readonly DemoAccount[] = [
  { email: 'nguyenhuynhngochai147@gmail.com', password: 'Xen123123!', label: 'Tài khoản của tôi' },
  { email: 'le.thu.thao@gmail.com', password: 'Finora@12345', label: 'Người vay' },
  { email: 'investor@finora.vn', password: 'Finora@12345', label: 'Nhà đầu tư' },
];

function configuredAccount(
  email: string | undefined,
  password: string | undefined,
  label: string,
): DemoAccount | null {
  const normalizedEmail = email?.trim();
  const normalizedPassword = password?.trim();

  if (!normalizedEmail || !normalizedPassword) return null;

  return {
    email: normalizedEmail,
    password: normalizedPassword,
    label,
  };
}

const LOCAL_BORROWER_ACCOUNTS = [
  configuredAccount(
    process.env.EXPO_PUBLIC_TEST_BORROWER_1_EMAIL,
    process.env.EXPO_PUBLIC_TEST_BORROWER_1_PASSWORD,
    'Người vay test 1',
  ),
  configuredAccount(
    process.env.EXPO_PUBLIC_TEST_BORROWER_2_EMAIL,
    process.env.EXPO_PUBLIC_TEST_BORROWER_2_PASSWORD,
    'Người vay test 2',
  ),
  configuredAccount(
    process.env.EXPO_PUBLIC_TEST_BORROWER_3_EMAIL,
    process.env.EXPO_PUBLIC_TEST_BORROWER_3_PASSWORD,
    'Người vay test 3',
  ),
].filter((account): account is DemoAccount => account !== null);

const LOCAL_INVESTOR_ACCOUNTS = [
  configuredAccount(
    process.env.EXPO_PUBLIC_TEST_INVESTOR_1_EMAIL,
    process.env.EXPO_PUBLIC_TEST_INVESTOR_1_PASSWORD,
    'Nhà đầu tư test 1',
  ),
  configuredAccount(
    process.env.EXPO_PUBLIC_TEST_INVESTOR_2_EMAIL,
    process.env.EXPO_PUBLIC_TEST_INVESTOR_2_PASSWORD,
    'Nhà đầu tư test 2',
  ),
  configuredAccount(
    process.env.EXPO_PUBLIC_TEST_INVESTOR_3_EMAIL,
    process.env.EXPO_PUBLIC_TEST_INVESTOR_3_PASSWORD,
    'Nhà đầu tư test 3',
  ),
].filter((account): account is DemoAccount => account !== null);

/**
 * Chỉ được render trong `__DEV__`. Ba tài khoản cấu hình thêm lấy từ `.env` cục bộ,
 * không đưa thông tin đăng nhập của môi trường test vào Git hoặc bản phát hành.
 */
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  ...SEEDED_DEMO_ACCOUNTS,
  ...LOCAL_BORROWER_ACCOUNTS,
  ...LOCAL_INVESTOR_ACCOUNTS,
];
