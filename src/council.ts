import { loadProvider } from './providers/index.js';
import { resolveModel } from './config.js';
import type { CouncilConfig } from './config.js';
import type { CouncilRequest, JudgeResult } from './types.js';

export async function runCouncil(config: CouncilConfig, request: CouncilRequest): Promise<JudgeResult[]> {
  const promises = request.models.map(async (providerKey): Promise<JudgeResult> => {
    const providerConfig = config.providers[providerKey];
    const model = resolveModel(providerKey, providerConfig?.model);

    if (!providerConfig) {
      return {
        provider: providerKey,
        model,
        status: 'skipped',
        error: { message: `No configuration for provider "${providerKey}"` },
      };
    }

    if (!providerConfig.apiKey) {
      return {
        provider: providerKey,
        model,
        status: 'skipped',
        error: { message: `API key not set for ${providerKey}` },
      };
    }

    const provider = loadProvider(providerKey, providerConfig);

    try {
      const result = await provider.chat({
        prompt: request.prompt,
        system: request.systemPrompt,
        model,
      });

      return {
        provider: providerKey,
        model,
        status: 'success',
        response: result.content,
        reasoning: result.reasoning,
        usage: result.usage,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        provider: providerKey,
        model,
        status: 'error',
        error: { message },
      };
    }
  });

  return Promise.all(promises);
}
