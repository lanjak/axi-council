import { describe, it, expect } from 'vitest';
import { synthesize, synthesizeDebate } from '../src/chairman.js';
import type { JudgeResult, DebateTurn } from '../src/types.js';

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

const finalTurn = (provider: string, verdict: 'agree' | 'disagree', response: string): DebateTurn => ({
  round: 3, provider, model: `${provider}-m`, status: 'success', response, verdict,
});

describe('synthesizeDebate', () => {
  it('renders consensus header and per-judge final positions', () => {
    const s = synthesizeDebate({
      judges: [finalTurn('kimi', 'agree', 'final A'), finalTurn('deepseek', 'agree', 'final B')],
      totalRounds: 3,
      consensus: true,
    });
    expect(s).toContain('## Council debate (2 judges, 3 rounds, consensus reached)');
    expect(s).toContain('### kimi (kimi-m)');
    expect(s).toContain('final A');
    expect(s).not.toContain('**Dissent:**');
  });

  it('renders dissent block on no-consensus', () => {
    const s = synthesizeDebate({
      judges: [finalTurn('kimi', 'agree', 'fine'), finalTurn('deepseek', 'disagree', 'still wrong because X\nmore detail')],
      totalRounds: 5,
      consensus: false,
    });
    expect(s).toContain('no consensus after 5 rounds');
    expect(s).toContain('**Dissent:**');
    expect(s).toContain('deepseek: still wrong because X');
    expect(s).not.toContain('kimi: fine');
  });
});
