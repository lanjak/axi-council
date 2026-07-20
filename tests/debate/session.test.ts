import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  newSessionId, saveSession, loadSession, deleteSession, cleanupExpired, sessionPath,
} from '../../src/debate/session.js';
import type { DebateSession } from '../../src/types.js';

let dir: string;
let env: NodeJS.ProcessEnv;

const session = (id: string, createdAt = new Date().toISOString()): DebateSession => ({
  id, createdAt, prompt: 'q', models: ['kimi', 'deepseek', 'caller'], maxRounds: 5,
  turns: [], nextTurn: { round: 1, participant: 'caller', order: ['kimi', 'deepseek', 'caller'] },
});

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'council-debate-'));
  env = { XDG_STATE_HOME: dir };
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

describe('session store', () => {
  it('generates dbt-prefixed 6-hex ids', () => {
    expect(newSessionId()).toMatch(/^dbt-[0-9a-f]{6}$/);
    expect(newSessionId()).not.toBe(newSessionId());
  });

  it('round-trips a session', () => {
    saveSession(session('dbt-aaaaaa'), env);
    expect(loadSession('dbt-aaaaaa', env)).toMatchObject({ id: 'dbt-aaaaaa', maxRounds: 5 });
  });

  it('load of unknown id throws SESSION_NOT_FOUND', () => {
    expect(() => loadSession('dbt-nope', env)).toThrowError(expect.objectContaining({ code: 'SESSION_NOT_FOUND' }));
  });

  it('load of expired session throws SESSION_NOT_FOUND and deletes the file', () => {
    const old = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    saveSession(session('dbt-bbbbbb', old), env);
    expect(() => loadSession('dbt-bbbbbb', env)).toThrowError(expect.objectContaining({ code: 'SESSION_NOT_FOUND' }));
    expect(fs.existsSync(sessionPath('dbt-bbbbbb', env))).toBe(false);
  });

  it('load of a session with corrupt createdAt throws SESSION_NOT_FOUND and deletes the file', () => {
    saveSession(session('dbt-garbage', 'garbage'), env);
    expect(() => loadSession('dbt-garbage', env)).toThrowError(expect.objectContaining({ code: 'SESSION_NOT_FOUND' }));
    expect(fs.existsSync(sessionPath('dbt-garbage', env))).toBe(false);
  });

  it('cleanupExpired removes a session with corrupt createdAt', () => {
    saveSession(session('dbt-garbage2', 'garbage'), env);
    cleanupExpired(env);
    expect(fs.existsSync(sessionPath('dbt-garbage2', env))).toBe(false);
  });

  it('delete is idempotent', () => {
    saveSession(session('dbt-cccccc'), env);
    deleteSession('dbt-cccccc', env);
    expect(() => deleteSession('dbt-cccccc', env)).not.toThrow();
  });

  it('cleanupExpired removes only stale sessions', () => {
    const old = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    saveSession(session('dbt-old111', old), env);
    saveSession(session('dbt-new111'), env);
    cleanupExpired(env);
    expect(fs.existsSync(sessionPath('dbt-old111', env))).toBe(false);
    expect(fs.existsSync(sessionPath('dbt-new111', env))).toBe(true);
  });

  it('concurrent sessions are independent files', () => {
    saveSession(session('dbt-p1p1p1'), env);
    saveSession(session('dbt-p2p2p2'), env);
    expect(loadSession('dbt-p1p1p1', env).id).toBe('dbt-p1p1p1');
    expect(loadSession('dbt-p2p2p2', env).id).toBe('dbt-p2p2p2');
  });
});
