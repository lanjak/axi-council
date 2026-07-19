import { describe, it, expect } from 'vitest';
import { parseHookPayload } from '../../src/hooks/payload.js';

describe('parseHookPayload', () => {
  it('returns an empty payload for non-JSON input', () => {
    expect(parseHookPayload('')).toEqual({});
    expect(parseHookPayload('not json')).toEqual({});
    expect(parseHookPayload('   ')).toEqual({});
  });

  it('parses a Claude Code PostToolUse payload', () => {
    const payload = parseHookPayload(JSON.stringify({
      session_id: 'abc-123',
      cwd: '/home/user/project',
      hook_event_name: 'PostToolUse',
      tool_input: { file_path: '/home/user/project/src/a.ts' },
    }));

    expect(payload.harness).toBe('claude-code');
    expect(payload.sessionId).toBe('abc-123');
    expect(payload.cwd).toBe('/home/user/project');
    expect(payload.event).toBe('PostToolUse');
    expect(payload.files).toEqual(['/home/user/project/src/a.ts']);
  });

  it('collects multiple files from array-shaped payloads', () => {
    const payload = parseHookPayload(JSON.stringify({
      sessionId: 's1',
      cwd: '/p',
      files: ['/p/a.ts', '/p/b.ts'],
    }));

    expect(payload.files).toEqual(['/p/a.ts', '/p/b.ts']);
  });

  it('sniffs alternative key spellings', () => {
    const payload = parseHookPayload(JSON.stringify({
      harness: 'pi',
      session: { id: 'xyz' },
      workspace: { cwd: '/w' },
      toolInput: { filePath: 'src/b.ts' },
    }));

    expect(payload.harness).toBe('pi');
    expect(payload.sessionId).toBe('xyz');
    expect(payload.cwd).toBe('/w');
    expect(payload.files).toEqual(['src/b.ts']);
  });

  it('omits files when none are present', () => {
    const payload = parseHookPayload(JSON.stringify({ session_id: 's', cwd: '/c' }));
    expect(payload.files).toBeUndefined();
  });
});
