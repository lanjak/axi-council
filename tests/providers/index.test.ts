import { describe, it, expect } from 'vitest';
import { loadProvider, listProviders } from '../../src/providers/index.js';

const config = { apiKey: 'sk-test', baseURL: 'https://test.example/v1' };

describe('provider registry', () => {
  it('lists registered providers', () => {
    expect(listProviders()).toContain('kimi');
    expect(listProviders()).toContain('deepseek');
    expect(listProviders()).toContain('mimo');
  });

  it('loads a provider by name', () => {
    const provider = loadProvider('kimi', config);
    expect(provider.name).toBe('kimi');
  });

  it('throws for unknown provider', () => {
    expect(() => loadProvider('unknown', config)).toThrow('Unknown provider');
  });
});
