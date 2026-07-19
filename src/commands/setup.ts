import { loadConfig } from '../config.js';
import { loadProvider } from '../providers/index.js';

export async function setupCommand(): Promise<void> {
  const config = loadConfig();
  const entries = Object.entries(config.providers);
  const lines: string[] = [];

  lines.push(`providers[${entries.length}]{name,authenticated,detail}:`);
  for (const [name, providerConfig] of entries) {
    const provider = loadProvider(name, providerConfig);
    const auth = await provider.checkAuth();
    lines.push(`  ${name},${auth.authenticated},${auth.detail}`);
  }

  lines.push('help[1]:');
  lines.push('  Set KIMI_API_KEY, DEEPSEEK_API_KEY, and MIMO_API_KEY to authenticate providers');

  console.log(lines.join('\n'));
}
