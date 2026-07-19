export interface JudgeResult {
  provider: string;
  model: string;
  status: 'success' | 'error' | 'skipped';
  response?: string;
  reasoning?: string;
  error?: { message: string; code?: string };
  usage?: { inputTokens: number; outputTokens: number; totalTokens: number };
}

export interface CouncilRequest {
  prompt: string;
  mode: 'review' | 'plan';
  models: string[];
  systemPrompt?: string;
}

export interface CouncilOutput {
  prompt: string;
  mode: 'review' | 'plan';
  judges: JudgeResult[];
  synthesis: string;
  availableCount: number;
  totalCount: number;
}

export interface ProviderConfig {
  apiKey: string;
  baseURL: string;
  model?: string;
}
