import { describe, it, expect } from 'vitest';
import { DeepSeekProvider } from '../../src/providers/deepseek.js';

describe('DeepSeekProvider', () => {
  it('has correct metadata', () => {
    const provider = new DeepSeekProvider({ apiKey: 'sk-test', baseURL: 'https://api.deepseek.com/v1' });
    expect(provider.name).toBe('deepseek');
    expect(provider.displayName).toBe('DeepSeek');
    expect(provider.capabilities.supportsReasoning).toBe(true);
  });
});
