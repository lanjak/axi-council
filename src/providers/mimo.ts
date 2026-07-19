import { OpenAICompatibleProvider } from './openai-compatible.js';

export class MimoProvider extends OpenAICompatibleProvider {
  readonly name = 'mimo';
  readonly displayName = 'Xiaomi MiMo';
  readonly capabilities = { supportsReasoning: true, supportsJsonMode: true };
}
