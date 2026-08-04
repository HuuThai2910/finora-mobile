import { mockResponse } from './delay';
import { EKYC_RESULT, LIVENESS } from './fixtures';
import type { EkycResult, LivenessProgress } from '@/types/ekyc';

export const getLivenessProgress = (): Promise<LivenessProgress> => mockResponse('ekyc', LIVENESS);

export const getResult = (): Promise<EkycResult> => mockResponse('ekyc', EKYC_RESULT);
