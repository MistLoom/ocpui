#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(label, args) {
  const result = spawnSync('pnpm', ['exec', 'vitest', 'run', ...args], {
    cwd: PKG_ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  console.log(`[${label}] ok`);
}

run('check-doc-compile', ['src/__tests__/doc-ci.spec.ts', '-t', 'check-doc-compile']);
run('check-doc-sanitize', ['src/__tests__/doc-ci.spec.ts', '-t', 'check-doc-sanitize']);
