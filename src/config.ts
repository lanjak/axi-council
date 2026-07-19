import type { ProviderConfig } from './types.js';

export interface CouncilConfig {
  providers: Record<string, ProviderConfig>;
}

export function loadConfig(env: Record<string, string | undefined> = process.env): CouncilConfig {
  const providers: Record<string, ProviderConfig> = {};

  const configured = env.COUNCIL_PROVIDERS?.split(',').map((p) => p.trim()).filter(Boolean) ?? [];

  for (const provider of configured) {
    const prefix = provider.toUpperCase();
    const apiKey = env[`${prefix}_API_KEY`] ?? '';
    const baseURL = env[`${prefix}_BASE_URL`] ?? '';
    const model = env[`${prefix}_MODEL`];
    const displayName = env[`${prefix}_DISPLAY_NAME`] ?? capitalize(provider);

    providers[provider] = {
      name: provider,
      apiKey,
      baseURL,
      model,
      displayName,
    };
  }

  return { providers };
}

function capitalize(text: string): string {
  return text.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function listProviders(config: CouncilConfig): string[] {
  return Object.keys(config.providers);
}

export function resolveModel(providerConfig: ProviderConfig): string | undefined {
  return providerConfig.model;
}
