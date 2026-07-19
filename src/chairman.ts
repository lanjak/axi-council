import type { CouncilRequest, JudgeResult } from './types.js';

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
