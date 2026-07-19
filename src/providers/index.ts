import { LLMProvider } from './base.js';
import { KimiProvider } from './kimi.js';
import { DeepSeekProvider } from './deepseek.js';
import { MimoProvider } from './mimo.js';
import type { ProviderConfig } from '../types.js';

const REGISTRY: Record<string, new (config: ProviderConfig) => LLMProvider> = {
  kimi: KimiProvider,
  deepseek: DeepSeekProvider,
  mimo: MimoProvider,
};

export function listProviders(): string[] {
  return Object.keys(REGISTRY);
}

export function loadProvider(name: string, config: ProviderConfig): LLMProvider {
  const Ctor = REGISTRY[name];
  if (!Ctor) {
    throw new Error(`Unknown provider: "${name}". Supported: ${listProviders().join(', ')}`);
  }
  return new Ctor(config);
}

export { LLMProvider };
