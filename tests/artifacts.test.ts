import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { assembleArtifacts } from '../src/artifacts.js';

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'council-artifacts-'));
});
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

function write(rel: string, content: string | Buffer) {
  const full = path.join(dir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

describe('assembleArtifacts - file collection', () => {
  it('attaches a single explicit file with a labeled block', () => {
    write('plan.md', 'hello plan');
    const bundle = assembleArtifacts({ files: ['plan.md'], cwd: dir });

    expect(bundle.blocks).toHaveLength(1);
    expect(bundle.blocks[0].label).toBe('--- plan.md (10 B) ---');
    expect(bundle.blocks[0].content).toBe('hello plan');
    expect(bundle.blocks[0].truncated).toBe(false);
    expect(bundle.warnings).toEqual([]);
  });

  it('warns and continues when an explicit file is missing', () => {
    write('a.md', 'A');
    const bundle = assembleArtifacts({ files: ['nope.md', 'a.md'], cwd: dir });

    expect(bundle.blocks).toHaveLength(1);
    expect(bundle.warnings[0]).toContain('nope.md');
  });

  it('expands a directory, sorted, skipping node_modules and .git', () => {
    write('src/b.ts', 'B');
    write('src/a.ts', 'A');
    write('src/node_modules/x/index.js', 'junk');
    write('src/.git/config', 'junk');
    const bundle = assembleArtifacts({ files: ['src'], cwd: dir });

    expect(bundle.blocks.map((b) => b.label)).toEqual([
      '--- src/a.ts (1 B) ---',
      '--- src/b.ts (1 B) ---',
    ]);
  });

  it('respects .gitignore including negation', () => {
    write('pkg/.gitignore', '*.log\n!keep.log\n');
    write('pkg/debug.log', 'skip me');
    write('pkg/keep.log', 'keep me');
    write('pkg/code.ts', 'code');
    const bundle = assembleArtifacts({ files: ['pkg'], cwd: dir });

    const labels = bundle.blocks.map((b) => b.label);
    expect(labels).toContain('--- pkg/keep.log (7 B) ---');
    expect(labels).toContain('--- pkg/code.ts (4 B) ---');
    expect(labels.some((l) => l.includes('debug.log'))).toBe(false);
  });

  it('skips binary files with a warning', () => {
    write('bin.dat', Buffer.from([0x89, 0x50, 0x00, 0x47]));
    write('text.md', 'text');
    const bundle = assembleArtifacts({ files: ['bin.dat', 'text.md'], cwd: dir });

    expect(bundle.blocks).toHaveLength(1);
    expect(bundle.warnings[0]).toContain('bin.dat');
    expect(bundle.warnings[0]).toContain('binary');
  });

  it('skips UTF-16 BOM files with a warning', () => {
    write('utf16.txt', Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('hi', 'utf16le')]));
    const bundle = assembleArtifacts({ files: ['utf16.txt'], cwd: dir });

    expect(bundle.blocks).toHaveLength(0);
    expect(bundle.warnings[0]).toContain('utf16.txt');
  });
});
