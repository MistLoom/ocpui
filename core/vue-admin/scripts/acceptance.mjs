#!/usr/bin/env node
/** @ocpui/vue-admin 包级验收 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(args) {
  const r = spawnSync('pnpm', args, { cwd: ROOT, stdio: 'inherit', shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run(['typecheck']);
run(['check:boundary']);
run(['check']);
run(['test:run']);
console.log('[acceptance] @ocpui/vue-admin ok');
