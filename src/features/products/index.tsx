/** Cửa ra công khai của feature `products`. */
export { default as ProductListScreen } from './component/ProductListScreen';
export { default as ProductDetailScreen } from './component/ProductDetailScreen';
export { default as ScheduleScreen } from './component/ScheduleScreen';
export { default as VentoPackagesScreen } from './component/VentoPackagesScreen';
export { default as PackageDetailScreen } from './component/PackageDetailScreen';
export { default as ProductCard } from './components/ProductCard';
export { useProduct, useProducts, usePurposes } from './hook/useProducts';
export { REPAYMENT_METHOD_LABEL, termOptions } from './constant';
// Khung chung của luồng nhập khoản vay ba bước; bước 3 "Nộp hồ sơ" (feature
// applications) dùng lại nền, đầu màn, hình minh hoạ và vùng ghim nút đáy, cùng
// lề và số đo để đặt hình y như bước 1–2.
export { default as LoanStepBackdrop } from './components/LoanStepBackdrop';
export { default as LoanStepHeader } from './components/LoanStepHeader';
export { default as LoanStepIllustration } from './components/LoanStepIllustration';
export { default as LoanStepFooter } from './components/LoanStepFooter';
export { default as LoanPrimaryButton } from './components/LoanPrimaryButton';
export {
  LOAN_STEP_DESIGN_WIDTH,
  LOAN_STEP_GUTTER,
  LOAN_STEP_ILLUSTRATION,
  LOAN_STEP_MAX_WIDTH,
} from './constant';
// Thẻ một kỳ của lịch trả: lịch của khoản vay đang trả (feature loan-servicing) dùng lại
// để hai màn lịch trả cùng một dáng thẻ, chỉ thêm nhãn "Kỳ tới".
export { default as SchedulePeriodCard } from './components/SchedulePeriodCard';
