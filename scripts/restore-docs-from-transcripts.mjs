/**
 * 从 Cursor agent transcript 恢复 casus/docs 中截断文档
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OCPUI_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(OCPUI_ROOT, 'casus/docs');
const transcriptsRoot =
  'C:/Users/Loom/.cursor/projects/d-Project-AIEPOCH-WWW/agent-transcripts';

const files = new Map();

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.jsonl')) parse(p);
  }
}

function parse(p) {
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    if (!line.includes('Write') || !line.includes('ocpui')) continue;
    try {
      const j = JSON.parse(line);
      for (const c of j.message?.content || []) {
        if (c.type !== 'tool_use' || c.name !== 'Write') continue;
        const fp = String(c.input?.path || '').replace(/\\/g, '/');
        const contents = c.input?.contents;
        if (!contents) continue;
        let rel = null;
        if (fp.includes('/packages/ocpui/casus/docs/')) {
          rel = fp.split('/packages/ocpui/casus/docs/')[1];
        } else if (fp.includes('/packages/ocpui/docs/')) {
          rel = fp.split('/packages/ocpui/docs/')[1];
        }
        if (!rel) continue;
        const prev = files.get(rel);
        if (!prev || contents.length >= prev.length) files.set(rel, contents);
      }
    } catch {
      /* ignore malformed lines */
    }
  }
}

function transform(content) {
  return content
    .split('packages/ocpui-vue/')
    .join('packages/ocpui/core/vue/')
    .split('packages/ocpui-vue-admin/')
    .join('packages/ocpui/core/vue-admin/')
    .split('packages/ocpui/vue/')
    .join('packages/ocpui/core/vue/')
    .split('packages/ocpui/vue-admin/')
    .join('packages/ocpui/core/vue-admin/')
    .split('packages/ocpui/docs/')
    .join('packages/ocpui/casus/docs/')
    .split('packages/ocpui/playground')
    .join('packages/ocpui/casus/playground');
}

function countEolYu(text) {
  return (text.match(/与$/gm) || []).length;
}

walk(transcriptsRoot);

let restored = 0;
const report = [];
for (const [rel, contents] of [...files.entries()].sort()) {
  const target = path.join(outDir, rel);
  if (!fs.existsSync(target)) {
    report.push(`SKIP_MISSING ${rel}`);
    continue;
  }
  const current = fs.readFileSync(target, 'utf8');
  const curBad = countEolYu(current);
  const fixed = transform(contents);
  const fixBad = countEolYu(fixed);
  if (curBad === 0) continue;
  if (fixBad < curBad || (fixBad === 0 && fixed.length > 0)) {
    fs.writeFileSync(target, fixed, 'utf8');
    restored += 1;
    report.push(`OK ${rel} ${curBad}->${fixBad}`);
  } else {
    report.push(
      `KEEP ${rel} curBad=${curBad} fixBad=${fixBad} curLen=${current.length} fixLen=${fixed.length}`,
    );
  }
}

console.log(report.join('\n'));
console.log(
  JSON.stringify(
    {
      transcriptFiles: files.size,
      restored,
      componentGuide: [...files.keys()]
        .filter((k) => k.startsWith('components/') || k.startsWith('guide/'))
        .sort(),
    },
    null,
    2,
  ),
);
