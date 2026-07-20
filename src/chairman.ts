import type { CouncilRequest, JudgeResult, DebateTurn } from './types.js';

export function synthesize(request: CouncilRequest, judges: JudgeResult[]): string {
  const successful = judges.filter((j) => j.status === 'success' && j.response);

  if (successful.length === 0) {
    return 'No judges were available to review this request.';
  }

  const lines: string[] = [];

  if (successful.length === 1) {
    lines.push(`## Single-judge ${request.mode} (${successful[0].provider}, 1 judge)`);
    lines.push('');
    lines.push(successful[0].response ?? '');
    return lines.join('\n');
  }

  lines.push(`## Council ${request.mode} synthesis (${successful.length} judges)`);
  lines.push('');

  for (const judge of successful) {
    lines.push(`### ${judge.provider} (${judge.model})`);
    lines.push(judge.response ?? '');
    lines.push('');
  }

  const verdicts = successful.map((j) => firstLine(j.response ?? ''));
  lines.push('**Key points:**');
  for (const v of verdicts) {
    lines.push(`- ${v}`);
  }

  return lines.join('\n').trim();
}

function firstLine(text: string): string {
  return text.split('\n')[0]?.trim() ?? '';
}

export function synthesizeDebate(args: {
  judges: DebateTurn[];
  totalRounds: number;
  consensus: boolean;
}): string {
  const lines: string[] = [];
  const outcome = args.consensus
    ? 'consensus reached'
    : `no consensus after ${args.totalRounds} rounds`;
  lines.push(`## Council debate (${args.judges.length} judges, ${args.totalRounds} rounds, ${outcome})`);
  lines.push('');

  for (const judge of args.judges) {
    lines.push(`### ${judge.provider} (${judge.model})`);
    lines.push(judge.response ?? '');
    lines.push('');
  }

  const dissenters = args.judges.filter((j) => j.verdict !== 'agree');
  if (!args.consensus && dissenters.length > 0) {
    lines.push('**Dissent:**');
    for (const d of dissenters) {
      lines.push(`- ${d.provider}: ${firstLine(d.response ?? '')}`);
    }
  }

  return lines.join('\n').trim();
}
