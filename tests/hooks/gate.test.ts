import { describe, it, expect } from 'vitest';
import { parseVerdict, decideGate } from '../../src/hooks/gate.js';
import type { JudgeResult } from '../../src/types.js';

const ok = (provider: string, response: string): JudgeResult =>
  ({ provider, model: 'm', status: 'success', response });
const err = (provider: string): JudgeResult =>
  ({ provider, model: 'm', status: 'error', error: { message: 'boom' } });

describe('parseVerdict', () => {
  it('reads the verdict from the final line only', () => {
    expect(parseVerdict('looks fine\nVERDICT: pass')).toBe('pass');
    expect(parseVerdict('issues\nVERDICT: fail')).toBe('fail');
    expect(parseVerdict('meh\nVERDICT: concerns')).toBe('concerns');
  });

  it('ignores VERDICT strings that are not on the final line', () => {
    expect(parseVerdict('VERDICT: fail\n\nactually after reflection it is fine.')).toBe('concerns');
    expect(parseVerdict('example: `VERDICT: fail`\nVERDICT: pass')).toBe('pass');
  });

  it('treats a missing verdict as concerns, never fail', () => {
    expect(parseVerdict('no verdict here')).toBe('concerns');
    expect(parseVerdict('')).toBe('concerns');
  });
});

describe('decideGate', () => {
  it('blocks on a strict majority of fail among responding judges', () => {
    const decision = decideGate([
      ok('a', 'bad\nVERDICT: fail'),
      ok('b', 'worse\nVERDICT: fail'),
      ok('c', 'fine\nVERDICT: pass'),
    ]);
    expect(decision.outcome).toBe('block');
  });

  it('passes when fails are not a majority', () => {
    const decision = decideGate([
      ok('a', 'bad\nVERDICT: fail'),
      ok('b', 'ok\nVERDICT: pass'),
      ok('c', 'meh\nVERDICT: concerns'),
    ]);
    expect(decision.outcome).toBe('pass');
  });

  it('excludes errored judges from the quorum denominator', () => {
    // R=2 of T=3 respond, 1 fail: not a majority of R -> pass
    // (an errored judge counted as concerns would have made this a block)
    const decision = decideGate([
      ok('a', 'bad\nVERDICT: fail'),
      ok('b', 'ok\nVERDICT: pass'),
      err('c'),
    ]);
    expect(decision.outcome).toBe('pass');
    expect(decision.verdicts.find((v) => v.provider === 'c')?.verdict).toBe('error');
  });

  it('fails open when responding judges are at or below half of total', () => {
    // R=1 of T=2: R <= T/2 -> fail open even though the one judge says fail
    const decision = decideGate([ok('a', 'bad\nVERDICT: fail'), err('b')]);
    expect(decision.outcome).toBe('fail-open');
    expect(decision.reason).toContain('b');
  });

  it('fails open when every judge errors', () => {
    expect(decideGate([err('a'), err('b')]).outcome).toBe('fail-open');
  });
});
