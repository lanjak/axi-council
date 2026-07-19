import { describe, it, expect } from 'vitest';
import { synthesize } from '../src/chairman.js';
import type { JudgeResult } from '../src/types.js';

describe('synthesize', () => {
  it('returns single review when only one judge responds', () => {
    const judges: JudgeResult[] = [
      { provider: 'kimi', model: 'kimi-k3', status: 'success', response: 'Ship it.' },
    ];
    const result = synthesize({ prompt: 'x', mode: 'review', models: ['kimi'] }, judges);
    expect(result).toContain('Ship it.');
    expect(result).toContain('1 judge');
  });

  it('compares two judges', () => {
    const judges: JudgeResult[] = [
      { provider: 'kimi', model: 'kimi-k3', status: 'success', response: 'Ship.' },
      { provider: 'deepseek', model: 'deepseek-v4-pro', status: 'success', response: 'Wait.' },
    ];
    const result = synthesize({ prompt: 'x', mode: 'review', models: ['kimi', 'deepseek'] }, judges);
    expect(result).toContain('Ship.');
    expect(result).toContain('Wait.');
  });

  it('excludes failed judges from synthesis', () => {
    const judges: JudgeResult[] = [
      { provider: 'kimi', model: 'kimi-k3', status: 'success', response: 'Ship.' },
      { provider: 'deepseek', model: 'deepseek-v4-pro', status: 'error', error: { message: 'down' } },
    ];
    const result = synthesize({ prompt: 'x', mode: 'review', models: ['kimi', 'deepseek'] }, judges);
    expect(result).toContain('Ship.');
    expect(result).not.toContain('down');
  });
});
