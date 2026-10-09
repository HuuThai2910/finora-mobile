/** Cửa ra công khai của feature `applications`. */
export { default as ApplyFormScreen } from './screens/ApplyFormScreen';
export { default as MyApplicationsScreen } from './screens/MyApplicationsScreen';
export { default as ApplicationDetailScreen } from './screens/ApplicationDetailScreen';
export { default as MyContractsScreen } from './screens/MyContractsScreen';
export { default as ContractDetailScreen } from './screens/ContractDetailScreen';
export { default as RepaymentScheduleScreen } from './screens/RepaymentScheduleScreen';
// Bộ thẻ, ghi chú, nút, chip lọc và thẻ trạng thái của các màn hồ sơ/hợp đồng trong tab
// Hồ sơ. Luồng khoản vay đang trả (feature loan-servicing) nối tiếp hợp đồng nên dùng lại
// đúng bộ này, để hồ sơ → hợp đồng → khoản vay là một bộ giao diện.
export { default as DetailCard } from './components/DetailCard';
export { default as DetailNote } from './components/DetailNote';
export { default as DetailButton } from './components/DetailButton';
export { default as ApplicationFilterChips } from './components/ApplicationFilterChips';
export { default as ApplicationListStatus } from './components/ApplicationListStatus';
export { default as ApplicationDetailError } from './components/ApplicationDetailError';
export { useMyApplications } from './hook/useApplications';
export { APPLICATION_STATUS } from './constant';
export { applicationJourneyStatus } from './mappers/statusMeta';
