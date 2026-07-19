import { LLMProvider } from './base.js';
import { OpenAICompatibleProvider } from './openai-compatible.js';
import type { ProviderConfig } from '../types.js';

export function loadProvider(name: string, config: ProviderConfig): LLMProvider {
  return new OpenAICompatibleProvider({ ...config, name });
}

export { LLMProvider, OpenAICompatibleProvider };
