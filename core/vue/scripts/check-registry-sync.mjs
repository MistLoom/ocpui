#!/usr/bin/env node
/** registry manifest 与 .vue 源码 1:1 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VUE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ADMIN_ROOT = path.resolve(VUE_ROOT, '..', 'vue-admin');
const MANIFEST = path.join(VUE_ROOT, 'registry', 'manifest.json');

if (!fs.existsSync(MANIFEST)) {
  console.error('[check-registry-sync] manifest 缺失，运行 pnpm registry:build');
  process.exit(1);
}

const { components } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const errors = [];

for (const c of components) {
  const root = c.package === '@ocpui/vue-admin' ? ADMIN_ROOT : VUE_ROOT;
  const src = path.join(root, c.source);
  if (!fs.existsSync(src)) errors.push(`缺失源码: ${c.source}`);
  const reg = path.join(root, c.registry);
  if (!fs.existsSync(reg)) errors.push(`缺失 registry: ${c.registry}`);
}

if (errors.length) {
  console.error('[check-registry-sync] 失败:\n' + errors.join('\n'));
  process.exit(1);
}
console.log(`[check-registry-sync] ok (${components.length} components)`);
