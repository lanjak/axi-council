import OpenAI from 'openai';
import { LLMProvider, ChatOptions, ChatResult, AuthResult, ProviderCapabilities } from './base.js';
import type { ProviderConfig } from '../types.js';

export abstract class OpenAICompatibleProvider extends LLMProvider {
  protected client: OpenAI;

  constructor(config: ProviderConfig) {
    super(config);
    this.client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL });
  }

  abstract override readonly name: string;
  abstract override readonly displayName: string;
  abstract override readonly capabilities: ProviderCapabilities;

  async checkAuth(): Promise<AuthResult> {
    if (!this.config.apiKey) {
      return {
        available: true,
        authenticated: false,
        detail: `${this.displayName} API key is not set`,
      };
    }
    return { available: true, authenticated: true, detail: `${this.displayName} API key is set` };
  }

  async chat(options: ChatOptions): Promise<ChatResult> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (options.system) {
      messages.push({ role: 'system', content: options.system });
    }
    messages.push({ role: 'user', content: options.prompt });

    const completion = await this.client.chat.completions.create({
      model: options.model,
      messages,
      temperature: options.temperature ?? 0.6,
      max_tokens: options.maxTokens ?? 4096,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined,
    });

    const choice = completion.choices[0];
    const content = choice?.message?.content ?? '';
    const usage = completion.usage
      ? {
          inputTokens: completion.usage.prompt_tokens,
          outputTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        }
      : undefined;

    return { content, usage };
  }
}
