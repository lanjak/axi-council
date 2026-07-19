import { OpenAICompatibleProvider } from './openai-compatible.js';

export class KimiProvider extends OpenAICompatibleProvider {
  readonly name = 'kimi';
  readonly displayName = 'Moonshot Kimi';
  readonly capabilities = { supportsReasoning: true, supportsJsonMode: true };
}
