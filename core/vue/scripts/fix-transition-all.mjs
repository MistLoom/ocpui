#!/usr/bin/env node
/**
 * 批量将 transition: all 替换为指定属性列表（make-interfaces-feel-better 合规）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const REPLACEMENT =
  'background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard)';

const dirs = [
  path.join(ROOT, 'src/components'),
  path.resolve(ROOT, '../vue-admin/src/components'),
];

const pattern = /transition\s*:\s*all\s+([^;]+);/g;

let fileCount = 0;
let replaceCount = 0;

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.vue')) {
      let content = fs.readFileSync(full, 'utf8');
      const matches = content.match(pattern);
      if (!matches?.length) continue;
      const next = content.replace(pattern, `transition: ${REPLACEMENT};`);
      if (next !== content) {
        fs.writeFileSync(full, next);
        fileCount++;
        replaceCount += matches.length;
      }
    }
  }
}

for (const d of dirs) walk(d);
console.log(`已处理 ${fileCount} 个文件，替换 ${replaceCount} 处 transition: all`);
