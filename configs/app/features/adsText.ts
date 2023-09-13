import type { Feature } from './types';
import { SUPPORTED_AD_BANNER_PROVIDERS } from 'types/client/adProviders';
import type { AdTextProviders } from 'types/client/adProviders';

import { getEnvValue } from '../utils';

const provider: AdTextProviders = (() => {
  const envValue = getEnvValue(process.env.NEXT_PUBLIC_AD_TEXT_PROVIDER);
  return envValue && SUPPORTED_AD_BANNER_PROVIDERS.includes(envValue) ? envValue as AdTextProviders : 'coinzilla';
})();

const title = 'Text ads';

const config: Feature<{ provider: AdTextProviders }> = (() => {
  if (provider !== 'none') {
    return Object.freeze({
      title,
      isEnabled: true,
      provider,
    });
  }

  return Object.freeze({
    title,
    isEnabled: false,
  });
})();

export default config;
