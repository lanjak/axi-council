import { describe, it, expect } from 'vitest';
import { buildDebateOutput, renderDebateTOON, renderDebatePaused } from '../../src/debate/render.js';
import type { DebateTurn } from '../../src/types.js';

const t = (round: number, provider: string, verdict: 'agree' | 'disagree', response = 'text'): DebateTurn => ({
  round, provider, model: `${provider}-m`, status: 'success', response: `${response}\nVERDICT: ${verdict.toUpperCase()}`, verdict,
});

const turns = [
  t(1, 'kimi', 'disagree'), t(1, 'deepseek', 'disagree'),
  t(2, 'deepseek', 'agree'), t(2, 'kimi', 'agree'),
];

describe('renderDebateTOON help lines', () => {
  it('never suggests the caller as a --models value', () => {
    const withCaller = [...turns, t(1, 'caller', 'disagree'), t(2, 'caller', 'agree')];
    const consensus = buildDebateOutput({ prompt: 'q', turns: withCaller, consensus: true, maxRounds: 5, totalCount: 3 });
    const consensusHelp = renderDebateTOON(consensus, { full: false }).split('help[')[1];
    expect(consensusHelp).toContain('--models kimi,deepseek');
    expect(consensusHelp).not.toContain('caller');

    const split = [
      t(1, 'kimi', 'agree'), t(1, 'deepseek', 'disagree'), t(1, 'caller', 'disagree'),
    ];
    const noConsensus = buildDebateOutput({ prompt: 'q', turns: split, consensus: false, maxRounds: 1, totalCount: 3 });
    const dissentHelp = renderDebateTOON(noConsensus, { full: false }).split('help[')[1];
    expect(dissentHelp).toContain('--models deepseek');
    expect(dissentHelp).not.toContain('--models deepseek,caller');
  });
});

describe('buildDebateOutput', () => {
  it('groups rounds, picks final turns, counts availability', () => {
    const o = buildDebateOutput({ prompt: 'q', turns, consensus: true, maxRounds: 5, totalCount: 2 });
    expect(o.rounds).toHaveLength(2);
    expect(o.rounds[0].turns).toHaveLength(2);
    expect(o.totalRounds).toBe(2);
    expect(o.judges.map((j) => j.round)).toEqual([2, 2]);
    expect(o.availableCount).toBe(2);
    expect(o.consensus).toBe(true);
  });
});

describe('renderDebateTOON', () => {
  const o = buildDebateOutput({ prompt: 'q', turns, consensus: true, maxRounds: 5, totalCount: 2 });

  it('renders rounds table, consensus line, judges table, size hint', () => {
    const s = renderDebateTOON(o, { full: false });
    expect(s).toContain('council[debate]:');
    expect(s).toContain('rounds[2]{round,agree,disagree,active}:');
    expect(s).toContain('  1,0,2,2');
    expect(s).toContain('  2,2,0,2');
    expect(s).toContain('consensus: reached in 2 of 5 rounds');
    expect(s).toContain('kimi,kimi-m,success,agree');
    expect(s).toMatch(/transcript: 2 rounds, \d+(\.\d+)? ?KB - rerun with --full/);
    expect(s).not.toContain('[round 1]'); // no full transcript by default
  });

  it('--full appends the complete transcript', () => {
    const s = renderDebateTOON(o, { full: true });
    expect(s).toContain('[round 1] kimi (kimi-m):');
    expect(s).toContain('[round 2] deepseek (deepseek-m):');
  });

  it('no-consensus render suggests escalation help', () => {
    const stuck = buildDebateOutput({
      prompt: 'q',
      turns: [t(1, 'kimi', 'agree'), t(1, 'deepseek', 'disagree')],
      consensus: false, maxRounds: 1, totalCount: 2,
    });
    const s = renderDebateTOON(stuck, { full: false });
    expect(s).toContain('consensus: none after 1 of 1 rounds');
    expect(s).toContain('--max-rounds');
    expect(s).toContain('--models deepseek');
  });
});

describe('renderDebatePaused', () => {
  it('shows status, session, unseen turns in full, and the turn command', () => {
    const s = renderDebatePaused({
      sessionId: 'dbt-4f2a91', round: 2, maxRounds: 5, turnIndex: 3, turnCount: 4,
      unseenTurns: [t(2, 'kimi', 'disagree', 'fresh argument')],
      seenRounds: 1, seenBytes: 2048,
    });
    expect(s).toContain('status: awaiting-caller (round 2 of 5, turn 3 of 4)');
    expect(s).toContain('session: dbt-4f2a91');
    expect(s).toContain('fresh argument'); // unseen turns never truncated
    expect(s).toContain('debate turn dbt-4f2a91 --stdin');
    expect(s).toMatch(/seen: 1 rounds?, 2(\.0)? ?KB/);
  });
});
