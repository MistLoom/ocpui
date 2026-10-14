#!/usr/bin/env node
/** 从 registry-meta.json 生成 registry 条目与 manifest */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const META_PATH = path.join(PKG_ROOT, 'registry', 'registry-meta.json');
const REGISTRY_DIR = path.join(PKG_ROOT, 'registry', 'components');
const MANIFEST_PATH = path.join(PKG_ROOT, 'registry', 'manifest.json');

const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
fs.mkdirSync(REGISTRY_DIR, { recursive: true });

const components = [];

for (const [name, entry] of Object.entries(meta)) {
  const slug = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const rel = `components/${slug}.md`;
  const filePath = path.join(REGISTRY_DIR, `${slug}.md`);

  const frontmatter = {
    type: 'Component',
    id: entry.id,
    name,
    tier: entry.tier,
    package: '@ocpui/vue-docs',
    status: 'stable',
    surfaces: ['editorial'],
    scenes: ['editor'],
    requires: ['UiRoot'],
    composes: entry.composes ?? [],
    duty: entry.duty,
    since: '0.1.0',
  };

  if (entry.handlesStates) {
    frontmatter.handlesStates = entry.handlesStates;
  }
  if (entry.dispatchRole) {
    frontmatter.dispatchRole = entry.dispatchRole;
  }
  if (entry.presentationMode) {
    frontmatter.presentationMode = entry.presentationMode;
  }
  if (entry.motion) {
    frontmatter.motion = entry.motion;
  }

  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length && typeof value[0] === 'object') {
          return `${key}:\n${value.map((item) => `  - trigger: ${item.trigger}\n    purpose: ${item.purpose}\n    tier: ${item.tier}${item.mustNot ? `\n    mustNot: [${item.mustNot.join(', ')}]` : ''}`).join('\n')}`;
        }
        return `${key}: [${value.join(', ')}]`;
      }
      if (typeof value === 'string') {
        return `${key}: "${value}"`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');

  const body = `# ${name}

源码：\`${entry.source}\`

## 职责

${entry.duty}
`;

  fs.writeFileSync(filePath, `---\n${yaml}\n---\n${body}`, 'utf8');

  components.push({
    name,
    id: entry.id,
    tier: entry.tier,
    package: '@ocpui/vue-docs',
    source: entry.source,
    registry: `registry/${rel}`,
  });
}

fs.writeFileSync(
  MANIFEST_PATH,
  `${JSON.stringify({ version: 1, components }, null, 2)}\n`,
  'utf8',
);

console.log(`[vue-docs registry:build] ${components.length} entries → registry/manifest.json`);
