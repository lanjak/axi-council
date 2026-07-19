import { describe, it, expect, vi } from 'vitest';
import { OpenAICompatibleProvider } from '../../src/providers/openai-compatible.js';

class TestProvider extends OpenAICompatibleProvider {
  readonly name = 'test';
  readonly displayName = 'Test Provider';
  readonly capabilities = { supportsReasoning: false, supportsJsonMode: true };
}

describe('OpenAICompatibleProvider', () => {
  it('returns chat content', async () => {
    const provider = new TestProvider({ apiKey: 'sk-test', baseURL: 'https://test.example/v1' });
    vi.spyOn(provider['client'].chat.completions, 'create').mockResolvedValue({
      choices: [{ message: { content: 'hello' } }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    } as any);

    const result = await provider.chat({ prompt: 'hi', model: 'test-model' });

    expect(result.content).toBe('hello');
    expect(result.usage).toEqual({ inputTokens: 10, outputTokens: 5, totalTokens: 15 });
  });

  it('propagates API errors as rejections', async () => {
    const provider = new TestProvider({ apiKey: 'sk-test', baseURL: 'https://test.example/v1' });

    vi.spyOn(provider['client'].chat.completions, 'create').mockRejectedValue(
      new Error('rate limit')
    );

    await expect(provider.chat({ prompt: 'hi', model: 'test-model' })).rejects.toThrow('rate limit');
  });
});
