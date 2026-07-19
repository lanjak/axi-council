import type { ProviderConfig } from './types.js';

export const DEFAULT_BASE_URLS: Record<string, string> = {
  kimi: 'https://api.moonshot.ai/v1',
  deepseek: 'https://api.deepseek.com/v1',
  mimo: 'https://api.xiaomimimo.com/v1',
};

export const DEFAULT_MODELS: Record<string, string> = {
  kimi: 'kimi-k3',
  deepseek: 'deepseek-v4-pro',
  mimo: 'mimo-v2.5-pro',
};

export interface CouncilConfig {
  providers: Record<string, ProviderConfig>;
}

export function loadConfig(env: Record<string, string | undefined> = process.env): CouncilConfig {
  const providers: Record<string, ProviderConfig> = {};

  for (const provider of Object.keys(DEFAULT_BASE_URLS)) {
    const prefix = provider.toUpperCase();
    providers[provider] = {
      apiKey: env[`${prefix}_API_KEY`] ?? '',
      baseURL: env[`${prefix}_BASE_URL`] ?? DEFAULT_BASE_URLS[provider],
      model: env[`${prefix}_MODEL`],
    };
  }

  return { providers };
}

export function resolveModel(provider: string, requested?: string): string {
  return requested ?? DEFAULT_MODELS[provider] ?? 'unknown';
}
