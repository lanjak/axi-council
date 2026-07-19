import type { JudgeResult } from '../types.js';

export type Verdict = 'pass' | 'concerns' | 'fail';

export interface GateDecision {
  outcome: 'block' | 'pass' | 'fail-open';
  reason: string;
  verdicts: { provider: string; verdict: Verdict | 'error' }[];
}

export function parseVerdict(response: string): Verdict {
  const lines = response.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const last = lines[lines.length - 1] ?? '';
  const match = /^VERDICT:\s*(pass|concerns|fail)\s*$/i.exec(last);
  if (!match) return 'concerns';
  return match[1].toLowerCase() as Verdict;
}

export function decideGate(judges: JudgeResult[]): GateDecision {
  const verdicts = judges.map((j) => ({
    provider: j.provider,
    verdict: (j.status === 'success' ? parseVerdict(j.response ?? '') : 'error') as Verdict | 'error',
  }));

  const responding = verdicts.filter((v) => v.verdict !== 'error');
  const errored = verdicts.filter((v) => v.verdict === 'error');

  // Fail open when the response pool is too thin to mean anything: none
  // responded, or at most half of the configured judges did.
  if (responding.length === 0 || responding.length <= judges.length / 2) {
    return {
      outcome: 'fail-open',
      reason:
        errored.length > 0
          ? `quorum not met (${responding.length} of ${judges.length} responded; errored: ${errored.map((v) => v.provider).join(', ')})`
          : `quorum not met (${responding.length} of ${judges.length} responded)`,
      verdicts,
    };
  }

  const fails = responding.filter((v) => v.verdict === 'fail').length;
  if (fails > responding.length / 2) {
    return {
      outcome: 'block',
      reason: `${fails} of ${responding.length} responding judges returned VERDICT: fail`,
      verdicts,
    };
  }

  return {
    outcome: 'pass',
    reason: `${fails} of ${responding.length} responding judges returned VERDICT: fail`,
    verdicts,
  };
}
