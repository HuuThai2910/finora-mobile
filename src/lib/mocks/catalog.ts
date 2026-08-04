import { mockResponse } from './delay';
import {
  FALLBACK_PREVIEW,
  FALLBACK_PRODUCTS,
  FALLBACK_PURPOSES,
  VENTO_PACKAGE_DETAIL,
  VENTO_PACKAGES,
} from './fixtures';

export const listVentoPackages = (): Promise<typeof VENTO_PACKAGES> =>
  mockResponse('products', VENTO_PACKAGES);

export const getVentoPackage = (): Promise<typeof VENTO_PACKAGE_DETAIL> =>
  mockResponse('products', VENTO_PACKAGE_DETAIL);

export const listProducts = (): Promise<typeof FALLBACK_PRODUCTS> =>
  mockResponse('products', FALLBACK_PRODUCTS);

export const listPurposes = (): Promise<typeof FALLBACK_PURPOSES> =>
  mockResponse('products', FALLBACK_PURPOSES);

export const getPreview = (): Promise<typeof FALLBACK_PREVIEW> =>
  mockResponse('products', FALLBACK_PREVIEW);
