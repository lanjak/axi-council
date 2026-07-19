import { describe, it, expect } from 'vitest';
import { Readable } from 'node:stream';
import { readStdinPayloadFrom } from '../src/stdin.js';

describe('readStdinPayloadFrom', () => {
  it('resolves empty immediately for a TTY-like stream', async () => {
    const tty = Object.assign(new Readable({ read() {} }), { isTTY: true });
    await expect(readStdinPayloadFrom(tty, 50)).resolves.toBe('');
  });

  it('resolves empty when no first byte arrives before the deadline', async () => {
    const silent = new Readable({ read() {} });
    await expect(readStdinPayloadFrom(silent, 50)).resolves.toBe('');
    silent.destroy();
  });

  it('reads to EOF after the first byte, even past the deadline', async () => {
    const slow = new Readable({ read() {} });
    const promise = readStdinPayloadFrom(slow, 50);
    slow.push('{"a":');
    setTimeout(() => slow.push('1}'), 120);
    setTimeout(() => slow.push(null), 150);
    await expect(promise).resolves.toBe('{"a":1}');
  });
});
