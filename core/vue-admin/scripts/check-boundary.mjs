#!/usr/bin/env node
/** @ocpui/vue-admin 包边界：禁止引用 apps/* 与应用层 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');

const FORBIDDEN = [
  /apps\/admin/,
  /apps\/web/,
  /@\/(?:components\/ui|global|logic|themes|i18n)/,
  /['"]admin\./,
  /from ['"]@aiepoch\//,
  /from ['"]\.\.\/\.\.\/\.\.\/apps\//,
];

const ALLOWED_OCPUI_IMPORT = /^@ocpui\/vue(?:\/|$)/;

const errors = [];

function stripComments(text, ext) {
  if (ext === '.vue') {
    return text.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  }
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full);
    else if (/\.(vue|ts|js|mjs)$/.test(name)) checkFile(full);
  }
}

function checkFile(full) {
  const raw = fs.readFileSync(full, 'utf8');
  const ext = path.extname(full);
  const text = stripComments(raw, ext);
  const rel = path.relative(ROOT, full);

  for (const re of FORBIDDEN) {
    if (re.test(text)) {
      errors.push(`${rel}: 禁止引用 ${re}`);
    }
  }

  const importRe = /from ['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRe.exec(text))) {
    const spec = match[1];
    if (spec.startsWith('@ocpui/') && !ALLOWED_OCPUI_IMPORT.test(spec)) {
      errors.push(`${rel}: 仅允许 @ocpui/vue 依赖，禁止 ${spec}`);
    }
  }
}

walk(SRC);

if (errors.length) {
  console.error('[check-boundary] 失败:\n' + errors.slice(0, 30).join('\n'));
  process.exit(1);
}
console.log('[check-boundary] ok');
