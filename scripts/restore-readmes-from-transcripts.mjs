/**
 * 从 agent transcript 恢复损坏的 README
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OCPUI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const transcriptsRoot =
  'C:/Users/Loom/.cursor/projects/d-Project-AIEPOCH-WWW/agent-transcripts';

const best = {
  vueAdmin: null,
  docgen: null,
};

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.jsonl')) parse(p);
  }
}

function parse(p) {
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    if (!line.includes('Write') || !line.includes('README.md')) continue;
    try {
      const j = JSON.parse(line);
      for (const c of j.message?.content || []) {
        if (c.type !== 'tool_use' || c.name !== 'Write') continue;
        const fp = String(c.input?.path || '');
        const contents = c.input?.contents;
        if (!contents) continue;
        if (fp.includes('vue-admin') && fp.endsWith('README.md')) {
          if (!best.vueAdmin || contents.length > best.vueAdmin.length) {
            best.vueAdmin = contents;
            best.vueAdminPath = fp;
          }
        }
        if (fp.includes('docgen') && fp.endsWith('README.md')) {
          if (!best.docgen || contents.length > best.docgen.length) {
            best.docgen = contents;
            best.docgenPath = fp;
          }
        }
      }
    } catch {
      /* ignore */
    }
  }
}

function transform(content) {
  return content
    .split('packages/ocpui-vue/')
    .join('packages/ocpui/core/vue/')
    .split('packages/ocpui-vue-admin/')
    .join('packages/ocpui/core/vue-admin/')
    .split('../ocpui-vue/')
    .join('../vue/')
    .split('../ocpui-playground/')
    .join('../../casus/playground/')
    .split('../../docs/ocpui/')
    .join('../../casus/docs/spec/')
    .split('docs/ocpui/')
    .join('casus/docs/spec/')
    .split('packages/ocpui/vue/')
    .join('packages/ocpui/core/vue/')
    .split('packages/ocpui/vue-admin/')
    .join('packages/ocpui/core/vue-admin/')
    .split('packages/ocpui/docs/')
    .join('packages/ocpui/casus/docs/')
    .split('packages/ocpui/playground')
    .join('packages/ocpui/casus/playground')
    .split('packages/ocpui/docgen/')
    .join('packages/ocpui/tool/docgen/')
    .split('../../ocpui-docs/')
    .join('../../casus/docs/')
    .split('../ocpui-docs/')
    .join('../../casus/docs/');
}

walk(transcriptsRoot);

if (best.vueAdmin) {
  const out = transform(best.vueAdmin);
  fs.writeFileSync(path.join(OCPUI, 'core/vue-admin/README.md'), out, 'utf8');
  console.log(
    'vue-admin',
    best.vueAdminPath,
    out.length,
    'fffd',
    (out.match(/\uFFFD/g) || []).length,
  );
} else {
  console.log('vue-admin: not found');
}

if (best.docgen) {
  const out = transform(best.docgen);
  fs.writeFileSync(path.join(OCPUI, 'tool/docgen/README.md'), out, 'utf8');
  console.log(
    'docgen',
    best.docgenPath,
    out.length,
    'fffd',
    (out.match(/\uFFFD/g) || []).length,
  );
} else {
  console.log('docgen: not found');
}
