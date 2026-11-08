/** Cửa ra công khai của feature `ekyc`. */
export { default as EkycConsentScreen } from './screens/EkycConsentScreen';
export { default as EkycCaptureScreen } from './screens/EkycCaptureScreen';
export { default as EkycLivenessScreen } from './screens/EkycLivenessScreen';
export { default as EkycResultScreen } from './screens/EkycResultScreen';
export { EkycSessionProvider } from './hooks/useEkycSession';
export { useEkycGate, isEkycRequiredError } from './hooks/useEkycGate';
