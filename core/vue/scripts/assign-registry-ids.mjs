#!/usr/bin/env node

/** S1：为全部 registry 条目分配 C: 语义 ID */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  componentSemanticId,
  insertOrUpdateFrontmatterId,
  parseFrontmatterId,
} from './registry-id.mjs';

const VUE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ADMIN_ROOT = path.resolve(VUE_ROOT, '..', 'vue-admin');
const MANIFEST = path.join(VUE_ROOT, 'registry', 'manifest.json');

const { components } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

const nameCounts = components.reduce((acc, c) => {
  acc[c.name] = (acc[c.name] ?? 0) + 1;
  return acc;
}, {});

const ids = new Map();
let updated = 0;

for (const c of components) {
  const root = c.package === '@ocpui/vue-admin' ? ADMIN_ROOT : VUE_ROOT;
  const regPath = path.join(root, c.registry);
  if (!fs.existsSync(regPath)) {
    console.warn(`[assign-registry-ids] 跳过缺失: ${c.name} ${c.registry}`);
    continue;
  }

  const disambiguate = nameCounts[c.name] > 1;
  const id = componentSemanticId(c.name, c.registry, disambiguate);
  if (ids.has(id)) {
    console.error(`[assign-registry-ids] ID 冲突: ${id} (${c.name})`);
    process.exit(1);
  }
  ids.set(id, c.name);

  const raw = fs.readFileSync(regPath, 'utf8');
  const existing = parseFrontmatterId(raw);
  if (existing === id) continue;

  fs.writeFileSync(regPath, insertOrUpdateFrontmatterId(raw, id));
  updated += 1;
}

console.log(`[assign-registry-ids] ok ${components.length} 组件, 更新 ${updated} 条`);
