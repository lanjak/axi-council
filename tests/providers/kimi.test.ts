import { describe, it, expect } from 'vitest';
import { KimiProvider } from '../../src/providers/kimi.js';

describe('KimiProvider', () => {
  it('has correct metadata', () => {
    const provider = new KimiProvider({ apiKey: 'sk-test', baseURL: 'https://api.moonshot.ai/v1' });
    expect(provider.name).toBe('kimi');
    expect(provider.displayName).toBe('Moonshot Kimi');
    expect(provider.capabilities.supportsReasoning).toBe(true);
  });
});
