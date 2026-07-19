import { describe, it, expect } from 'vitest';
import { MimoProvider } from '../../src/providers/mimo.js';

describe('MimoProvider', () => {
  it('has correct metadata', () => {
    const provider = new MimoProvider({ apiKey: 'sk-test', baseURL: 'https://api.xiaomimimo.com/v1' });
    expect(provider.name).toBe('mimo');
    expect(provider.displayName).toBe('Xiaomi MiMo');
    expect(provider.capabilities.supportsReasoning).toBe(true);
  });
});
