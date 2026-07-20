import { describe, it, expect } from 'vitest';
import { formatTranscript, openerPrompt, turnPrompt } from '../../src/debate/prompts.js';
import type { DebateTurn } from '../../src/types.js';

const turn = (round: number, provider: string, response: string): DebateTurn => ({
  round, provider, model: `${provider}-model`, status: 'success', response, verdict: 'disagree',
});

describe('formatTranscript', () => {
  it('labels turns with round, name, model in speaking order', () => {
    const t = formatTranscript([turn(1, 'kimi', 'first'), turn(1, 'deepseek', 'second')]);
    expect(t).toContain('[round 1] kimi (kimi-model):\nfirst');
    expect(t).toContain('[round 1] deepseek (deepseek-model):\nsecond');
    expect(t.indexOf('kimi')).toBeLessThan(t.indexOf('deepseek'));
  });
  it('skips errored turns (no response to show)', () => {
    const errored: DebateTurn = { round: 1, provider: 'mimo', model: 'm', status: 'error', error: { message: 'boom' } };
    expect(formatTranscript([errored, turn(1, 'kimi', 'hi')])).not.toContain('mimo');
  });
});

describe('openerPrompt', () => {
  it('mentions judge count and both verdict lines', () => {
    const p = openerPrompt(3);
    expect(p).toContain('one of 3 independent judges');
    expect(p).toContain('VERDICT: AGREE');
    expect(p).toContain('VERDICT: DISAGREE');
    expect(p).toContain('Do not manufacture objections');
  });
});

describe('turnPrompt', () => {
  it('fills all placeholders', () => {
    const p = turnPrompt({ judgeName: 'kimi', judgeCount: 3, round: 2, maxRounds: 5, transcript: 'THE-TRANSCRIPT' });
    expect(p).toContain('You are kimi, one of 3');
    expect(p).toContain('round 2 of 5');
    expect(p).toContain('THE-TRANSCRIPT');
    expect(p).toContain('Attack the weakest point');
  });
});
