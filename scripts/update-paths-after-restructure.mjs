#!/usr/bin/env node
/**
 * 目录重组后批量更新 monorepo 内路径引用（UTF-8 安全）
 * core/ tool/ casus/ 结构见 packages/ocpui/README.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OCPUI_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(OCPUI_ROOT, '../..');

const ABS_REPLACEMENTS = [
  ['packages/ocpui/vue-admin/', 'packages/ocpui/core/vue-admin/'],
  ['packages/ocpui/vue-docs/', 'packages/ocpui/core/vue-docs/'],
  ['packages/ocpui/vue/', 'packages/ocpui/core/vue/'],
  ['packages/ocpui/markdown-core/', 'packages/ocpui/tool/markdown-core/'],
  ['packages/ocpui/docgen/', 'packages/ocpui/tool/docgen/'],
  ['packages/ocpui/docs/', 'packages/ocpui/casus/docs/'],
  ['packages/ocpui/playground', 'packages/ocpui/casus/playground'],
];

/** core/tool 包内相对链接 → casus */
const REL_FROM_CORE_TOOL = [
  [/\(\.\.\/docs\//g, '(../../casus/docs/'],
  [/\(\.\.\/playground/g, '(../../casus/playground'],
  [/\(\.\.\/docgen/g, '(../../tool/docgen'],
];

/** core/vue/docs 等更深一层 */
const REL_FROM_CORE_NESTED = [
  [/\(\.\.\/\.\.\/docs\//g, '(../../../casus/docs/'],
];

const SKIP_DIR = new Set(['node_modules', 'dist', '.git', '.vite', '.turbo']);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else if (/\.(md|mjs|ts|json|vue|yaml|yml)$/.test(ent.name)) out.push(full);
  }
  return out;
}

function transform(file, content) {
  let next = content;
  for (const [from, to] of ABS_REPLACEMENTS) {
    next = next.split(from).join(to);
  }

  const rel = path.relative(OCPUI_ROOT, file).replace(/\\/g, '/');
  if (rel.startsWith('core/') || rel.startsWith('tool/')) {
    for (const [re, rep] of REL_FROM_CORE_TOOL) next = next.replace(re, rep);
    for (const [re, rep] of REL_FROM_CORE_NESTED) next = next.replace(re, rep);
  }

  if (file.startsWith(REPO_ROOT + path.sep + 'apps')) {
    next = next
      .split('packages/ocpui/vue-admin').join('packages/ocpui/core/vue-admin')
      .split('packages/ocpui/vue/').join('packages/ocpui/core/vue/');
  }

  return next;
}

let changed = 0;
const roots = [OCPUI_ROOT, path.join(REPO_ROOT, 'apps')];
for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  for (const file of walk(root)) {
    if (file.includes(`${path.sep}scripts${path.sep}update-paths-after-restructure.mjs`)) continue;
    const raw = fs.readFileSync(file, 'utf8');
    const next = transform(file, raw);
    if (next !== raw) {
      fs.writeFileSync(file, next, 'utf8');
      changed += 1;
    }
  }
}

console.log(`[update-paths] ${changed} files updated`);
