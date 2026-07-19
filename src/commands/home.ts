import { loadConfig } from '../config.js';
import { loadProvider } from '../providers/index.js';

export async function homeCommand(): Promise<void> {
  const config = loadConfig();
  const entries = Object.entries(config.providers);
  const lines: string[] = [];

  lines.push('axi-council: multi-LLM adversarial review council');
  lines.push(`providers[${entries.length}]{name,authenticated}:`);
  for (const [name, providerConfig] of entries) {
    const provider = loadProvider(name, providerConfig);
    const auth = await provider.checkAuth();
    lines.push(`  ${name},${auth.authenticated}`);
  }

  lines.push('commands[3]{name,purpose}:');
  lines.push('  setup,check provider authentication');
  lines.push('  review,adversarial review of an artifact or question');
  lines.push('  plan,pressure-test a plan or decision');

  lines.push('help[2]:');
  lines.push('  Run `npx -y axi-council review "<prompt>" --models kimi,deepseek,mimo`');
  lines.push('  Run `npx -y axi-council setup` to check provider authentication');

  console.log(lines.join('\n'));
}
