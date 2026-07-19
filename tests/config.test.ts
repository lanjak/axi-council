import { describe, it, expect } from 'vitest';
import { loadConfig, resolveModel, DEFAULT_BASE_URLS } from '../src/config.js';

describe('config', () => {
  it('loads keys from environment variables', () => {
    const config = loadConfig({
      KIMI_API_KEY: 'kimi-key',
      DEEPSEEK_API_KEY: 'deepseek-key',
      MIMO_API_KEY: 'mimo-key',
    });

    expect(config.providers.kimi.apiKey).toBe('kimi-key');
    expect(config.providers.deepseek.apiKey).toBe('deepseek-key');
    expect(config.providers.mimo.apiKey).toBe('mimo-key');
  });

  it('uses default base URLs when not overridden', () => {
    const config = loadConfig({ KIMI_API_KEY: 'kimi-key' });
    expect(config.providers.kimi.baseURL).toBe(DEFAULT_BASE_URLS.kimi);
    expect(config.providers.deepseek.baseURL).toBe(DEFAULT_BASE_URLS.deepseek);
  });

  it('allows base URL overrides', () => {
    const config = loadConfig({
      KIMI_API_KEY: 'kimi-key',
      KIMI_BASE_URL: 'https://custom.example/v1',
    });
    expect(config.providers.kimi.baseURL).toBe('https://custom.example/v1');
  });

  it('reads per-provider model overrides', () => {
    const config = loadConfig({ KIMI_API_KEY: 'kimi-key', KIMI_MODEL: 'kimi-k2.7-code' });
    expect(config.providers.kimi.model).toBe('kimi-k2.7-code');
    expect(config.providers.deepseek.model).toBeUndefined();
  });

  it('resolves requested models', () => {
    expect(resolveModel('kimi', undefined)).toBe('kimi-k3');
    expect(resolveModel('kimi', 'kimi-k2.7-code')).toBe('kimi-k2.7-code');
  });
});
