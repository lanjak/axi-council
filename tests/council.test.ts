import { describe, it, expect, vi } from 'vitest';
import { runCouncil } from '../src/council.js';
import { loadProvider } from '../src/providers/index.js';
import type { CouncilConfig } from '../src/config.js';

vi.mock('../src/providers/index.js', () => ({
  loadProvider: vi.fn(),
}));

describe('runCouncil', () => {
  it('collects successful and failed judges', async () => {
    const mockProvider = {
      name: 'openai',
      chat: vi.fn().mockResolvedValue({ content: 'looks good', usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 } }),
    };
    vi.mocked(loadProvider).mockReturnValue(mockProvider as any);

    const config: CouncilConfig = {
      providers: {
        openai: { name: 'openai', displayName: 'OpenAI', apiKey: 'key', baseURL: 'https://api.openai.com/v1', model: 'gpt-4o' },
        groq: { name: 'groq', displayName: 'Groq', apiKey: 'key', baseURL: 'https://api.groq.com/openai/v1', model: 'llama-3.1-70b' },
      },
    };

    const results = await runCouncil(config, {
      prompt: 'review this',
      mode: 'review',
      models: ['openai', 'groq'],
    });

    expect(results).toHaveLength(2);
    expect(results[0].status).toBe('success');
    expect(results[0].response).toBe('looks good');
  });

  it('marks failed providers as error without throwing', async () => {
    const mockProvider = {
      name: 'groq',
      chat: vi.fn().mockRejectedValue(new Error('rate limit')),
    };
    vi.mocked(loadProvider).mockReturnValue(mockProvider as any);

    const config: CouncilConfig = {
      providers: {
        groq: { name: 'groq', displayName: 'Groq', apiKey: 'key', baseURL: 'https://api.groq.com/openai/v1', model: 'llama-3.1-70b' },
      },
    };

    const results = await runCouncil(config, {
      prompt: 'review this',
      mode: 'review',
      models: ['groq'],
    });

    expect(results[0].status).toBe('error');
    expect(results[0].error?.message).toContain('rate limit');
  });

  it('skips providers without a configured model', async () => {
    const config: CouncilConfig = {
      providers: {
        openai: { name: 'openai', displayName: 'OpenAI', apiKey: 'key', baseURL: 'https://api.openai.com/v1' },
      },
    };

    const results = await runCouncil(config, {
      prompt: 'review this',
      mode: 'review',
      models: ['openai'],
    });

    expect(results[0].status).toBe('skipped');
    expect(results[0].error?.message).toContain('No model configured');
  });
});
