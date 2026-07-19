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
      name: 'kimi',
      chat: vi.fn().mockResolvedValue({ content: 'looks good', usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 } }),
    };
    vi.mocked(loadProvider).mockReturnValue(mockProvider as any);

    const config: CouncilConfig = {
      providers: {
        kimi: { apiKey: 'key', baseURL: 'https://api.moonshot.ai/v1' },
        deepseek: { apiKey: 'key', baseURL: 'https://api.deepseek.com/v1' },
      },
    };

    const results = await runCouncil(config, {
      prompt: 'review this',
      mode: 'review',
      models: ['kimi', 'deepseek'],
    });

    expect(results).toHaveLength(2);
    expect(results[0].status).toBe('success');
    expect(results[0].response).toBe('looks good');
  });

  it('marks failed providers as error without throwing', async () => {
    const mockProvider = {
      name: 'deepseek',
      chat: vi.fn().mockRejectedValue(new Error('rate limit')),
    };
    vi.mocked(loadProvider).mockReturnValue(mockProvider as any);

    const config: CouncilConfig = {
      providers: { deepseek: { apiKey: 'key', baseURL: 'https://api.deepseek.com/v1' } },
    };

    const results = await runCouncil(config, {
      prompt: 'review this',
      mode: 'review',
      models: ['deepseek'],
    });

    expect(results[0].status).toBe('error');
    expect(results[0].error?.message).toContain('rate limit');
  });
});
