import { loadConfig, listProviders } from '../config.js';
import { loadProvider } from '../providers/index.js';

export async function setupCommand(): Promise<void> {
  const config = loadConfig();
  const providers = listProviders(config);
  const lines: string[] = [];

  lines.push(`providers[${providers.length}]{name,authenticated,detail}:`);
  for (const name of providers) {
    const providerConfig = config.providers[name];
    const provider = loadProvider(name, providerConfig);
    const auth = await provider.checkAuth();
    lines.push(`  ${name},${auth.authenticated},${auth.detail}`);
  }

  if (providers.length === 0) {
    lines.push('  (none configured)');
  }

  lines.push('help[2]:');
  lines.push('  Set COUNCIL_PROVIDERS and per-provider env vars to add judges');
  lines.push('  Example: COUNCIL_PROVIDERS=openai OPENAI_API_KEY=sk-... OPENAI_BASE_URL=https://api.openai.com/v1 OPENAI_MODEL=gpt-4o');

  console.log(lines.join('\n'));
}
