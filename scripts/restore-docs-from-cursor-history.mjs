import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const historyRoot = 'C:/Users/Loom/AppData/Roaming/Cursor/User/History';
const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../casus/docs');

const historyMap = new Map();
for (const dir of fs.readdirSync(historyRoot)) {
  const entriesPath = path.join(historyRoot, dir, 'entries.json');
  if (!fs.existsSync(entriesPath)) continue;
  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
  } catch {
    continue;
  }
  const resource = entries.resource || '';
  const m = resource.match(/packages\/ocpui\/docs\/(.+)$/);
  if (!m) continue;
  const rel = decodeURIComponent(m[1]);
  const sorted = [...(entries.entries || [])].sort((a, b) => b.timestamp - a.timestamp);
  const latest = sorted[0];
  if (!latest) continue;
  const backup = path.join(historyRoot, dir, latest.id);
  if (!fs.existsSync(backup)) continue;
  historyMap.set(rel.replace(/\//g, path.sep), backup);
}

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

const ABS_REPLACEMENTS = [
  ['packages/ocpui/core/vue-admin/', 'packages/ocpui/core/vue-admin/'],
  ['packages/ocpui/core/vue-docs/', 'packages/ocpui/core/vue-docs/'],
  ['packages/ocpui/core/vue/', 'packages/ocpui/core/vue/'],
  ['packages/ocpui/tool/markdown-core/', 'packages/ocpui/tool/markdown-core/'],
  ['packages/ocpui/tool/docgen/', 'packages/ocpui/tool/docgen/'],
  ['packages/ocpui/casus/docs/', 'packages/ocpui/casus/docs/'],
  ['packages/ocpui/casus/playground', 'packages/ocpui/casus/playground'],
];

function applyPathUpdates(content) {
  let next = content;
  for (const [from, to] of ABS_REPLACEMENTS) next = next.split(from).join(to);
  return next
    .replace(/\(\.\.\/docs\//g, '(../../casus/docs/')
    .replace(/\(\.\.\/\.\.\/docs\//g, '(../../../casus/docs/')
    .replace(/\(\.\.\/playground/g, '(../../casus/playground');
}

let restored = 0;
for (const file of walk(docsRoot)) {
  const t = fs.readFileSync(file, 'utf8');
  if (!(t.match(/\uFFFD/g) || []).length) continue;
  const rel = path.relative(docsRoot, file);
  const backup = historyMap.get(rel);
  if (!backup) {
    console.log('no backup:', rel);
    continue;
  }
  const bt = fs.readFileSync(backup, 'utf8');
  if ((bt.match(/\uFFFD/g) || []).length) {
    console.log('backup also bad:', rel);
    continue;
  }
  fs.writeFileSync(file, applyPathUpdates(bt), 'utf8');
  restored++;
  console.log('restored:', rel);
}

console.log('total restored', restored);
