import { describe, it, expect } from 'vitest';
import { loadProvider } from '../../src/providers/index.js';

const config = {
  name: 'test',
  displayName: 'Test Provider',
  apiKey: 'sk-test',
  baseURL: 'https://test.example/v1',
  model: 'test-model',
};

describe('provider registry', () => {
  it('loads a generic OpenAI-compatible provider', () => {
    const provider = loadProvider('test', config);
    expect(provider.name).toBe('test');
    expect(provider.displayName).toBe('Test Provider');
  });
});
