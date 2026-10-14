#!/usr/bin/env node
/** 包边界：禁止引用 apps/* */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PKGS = [
  path.join(ROOT),
  path.join(ROOT, '..', 'vue-admin'),
];

  const FORBIDDEN = [/@\/(?:components\/ui|global|logic|themes|i18n)/, /apps\/admin/, /apps\/web/, /['"]admin\./];
const errors = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.refer') continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full);
    else if (/\.(vue|ts|js|mjs)$/.test(name)) {
      const text = fs.readFileSync(full, 'utf8');
      for (const re of FORBIDDEN) {
        if (re.test(text)) {
          errors.push(`${path.relative(ROOT, full)}: 禁止引用 ${re}`);
        }
      }
    }
  }
}

for (const pkg of PKGS) walk(path.join(pkg, 'src'));

if (errors.length) {
  console.error('[check-package-boundary] 失败:\n' + errors.slice(0, 30).join('\n'));
  process.exit(1);
}
console.log('[check-package-boundary] ok');
