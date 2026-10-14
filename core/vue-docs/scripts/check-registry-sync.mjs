#!/usr/bin/env node
/** registry manifest 与源码 1:1 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(PKG_ROOT, 'registry', 'manifest.json');

if (!fs.existsSync(MANIFEST)) {
  console.error('[vue-docs check:registry] manifest 缺失，运行 pnpm registry:build');
  process.exit(1);
}

const { components } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const errors = [];

for (const item of components) {
  const src = path.join(PKG_ROOT, item.source);
  const reg = path.join(PKG_ROOT, item.registry);
  if (!fs.existsSync(src)) {
    errors.push(`缺失源码: ${item.source}`);
  }
  if (!fs.existsSync(reg)) {
    errors.push(`缺失 registry: ${item.registry}`);
  }
  if (!item.id?.startsWith('C:')) {
    errors.push(`${item.name}: id 必须以 C: 开头`);
  }
  if (item.tier !== 'T0' && !item.handlesStates && item.tier === 'T2') {
    // handlesStates 在 registry md frontmatter，manifest 可选携带
  }
}

if (errors.length) {
  console.error('[vue-docs check:registry] 失败:\n' + errors.join('\n'));
  process.exit(1);
}

console.log(`[vue-docs check:registry] ok (${components.length} components)`);
