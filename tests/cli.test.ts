import { describe, it, expect, vi } from 'vitest';
import { reviewCommand } from '../src/commands/review.js';
import { runCouncil } from '../src/council.js';

vi.mock('../src/council.js', () => ({
  runCouncil: vi.fn(),
}));

describe('reviewCommand', () => {
  it('renders TOON output when judges respond', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(runCouncil).mockResolvedValue([
      { provider: 'kimi', model: 'kimi-k3', status: 'success', response: 'Ship it.' },
    ]);

    await reviewCommand('ship?', { models: 'kimi' });

    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain('council[review]: "ship?"');
    expect(output).toContain('Ship it.');
    logSpy.mockRestore();
  });
});
