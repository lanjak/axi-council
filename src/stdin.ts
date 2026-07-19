import type { Readable } from 'node:stream';

export interface ReadStdinOptions {
  firstByteTimeoutMs?: number;
}

export const DEFAULT_STDIN_TIMEOUT_MS = 2000;

// Deadline applies to the FIRST byte only. After data starts arriving we read
// to EOF with no cutoff, so a slow harness mid-payload is never truncated.
export function readStdinPayloadFrom(
  stream: Readable & { isTTY?: boolean },
  firstByteTimeoutMs: number = DEFAULT_STDIN_TIMEOUT_MS
): Promise<string> {
  if (stream.isTTY) return Promise.resolve('');

  return new Promise((resolve) => {
    let chunks: Buffer[] = [];
    let gotFirstByte = false;

    const timer = setTimeout(() => {
      if (!gotFirstByte) {
        cleanup();
        resolve('');
      }
    }, firstByteTimeoutMs);

    function onData(chunk: Buffer) {
      gotFirstByte = true;
      chunks.push(chunk);
    }
    function onEnd() {
      cleanup();
      resolve(Buffer.concat(chunks).toString('utf8'));
    }
    function onError() {
      cleanup();
      resolve(chunks.length > 0 ? Buffer.concat(chunks).toString('utf8') : '');
    }
    function cleanup() {
      clearTimeout(timer);
      stream.off('data', onData);
      stream.off('end', onEnd);
      stream.off('error', onError);
    }

    stream.on('data', onData);
    stream.on('end', onEnd);
    stream.on('error', onError);
  });
}

export function readStdinPayload(options: ReadStdinOptions = {}): Promise<string> {
  const timeout =
    options.firstByteTimeoutMs ??
    parsePositiveInt(process.env.COUNCIL_HOOK_STDIN_TIMEOUT_MS) ??
    DEFAULT_STDIN_TIMEOUT_MS;
  return readStdinPayloadFrom(process.stdin, timeout);
}

function parsePositiveInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}
