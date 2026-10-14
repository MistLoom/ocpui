/**
 * 阻断新增 transition: all
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const dirs = [
  path.join(ROOT, 'src/components'),
  path.resolve(ROOT, '../vue-admin/src/components'),
];

const pattern = /transition\s*:\s*all\b/;
const violations = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.vue')) {
      const lines = fs.readFileSync(full, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (pattern.test(line) && !line.trim().startsWith('//') && !line.includes('*')) {
          violations.push(`${path.relative(ROOT, full)}:${i + 1}`);
        }
      });
    }
  }
}

for (const d of dirs) walk(d);

if (violations.length) {
  console.error('发现 transition: all 违规:\n' + violations.join('\n'));
  process.exit(1);
}
console.log('✓ 无 transition: all 违规');
