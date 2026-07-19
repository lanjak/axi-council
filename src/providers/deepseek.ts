import { OpenAICompatibleProvider } from './openai-compatible.js';

export class DeepSeekProvider extends OpenAICompatibleProvider {
  readonly name = 'deepseek';
  readonly displayName = 'DeepSeek';
  readonly capabilities = { supportsReasoning: true, supportsJsonMode: true };
}
