#!/usr/bin/env node
/** @ocpui/vue-admin 间距契约（复用 vue 脚本，扫描 T2–T3 Shell） */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ADMIN_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VUE_SCRIPT = path.resolve(ADMIN_ROOT, '../vue/scripts/check-spacing-contract.mjs');

const result = spawnSync(process.execPath, [VUE_SCRIPT], {
  stdio: 'inherit',
  env: {
    ...process.env,
    SPACING_CONTRACT_ROOT: ADMIN_ROOT,
    SPACING_CONTRACT_COMPONENTS: path.join(ADMIN_ROOT, 'src', 'components'),
  },
});

process.exit(result.status ?? 1);
