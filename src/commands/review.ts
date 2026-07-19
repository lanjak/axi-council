import { loadConfig } from '../config.js';
import { runCouncil } from '../council.js';
import { synthesize } from '../chairman.js';
import { renderTOON } from '../output.js';
import { CouncilError } from '../errors.js';

export async function reviewCommand(
  prompt: string,
  options: { models?: string }
): Promise<void> {
  const config = loadConfig();
  const models = (options.models ?? 'kimi,deepseek,mimo').split(',').map((m) => m.trim());

  const judges = await runCouncil(config, { prompt, mode: 'review', models });
  const availableCount = judges.filter((j) => j.status === 'success').length;

  if (availableCount === 0) {
    throw new CouncilError('All providers unavailable', 'NO_QUORUM');
  }

  const synthesis = synthesize({ prompt, mode: 'review', models }, judges);
  const output = { prompt, mode: 'review' as const, judges, synthesis, availableCount, totalCount: models.length };

  console.log(renderTOON(output));
}
