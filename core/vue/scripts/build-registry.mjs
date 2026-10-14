#!/usr/bin/env node

/**

 * 从组件源码生成 registry 条目 + CLI manifest（全量 T0–T3）

 * 语义字段合并 registry-meta.json

 */

import fs from 'node:fs';

import path from 'node:path';

import { fileURLToPath } from 'node:url';
import { componentSemanticId, parseFrontmatterId } from './registry-id.mjs';

function extractMotionBlock(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return '';
  const fm = m[1];
  const idx = fm.search(/^motion:/m);
  if (idx < 0) return '';
  const tail = fm.slice(idx);
  const after = tail.indexOf('\n', 'motion:'.length);
  if (after < 0) return tail.trimEnd();
  const rest = tail.slice(after + 1);
  const next = rest.search(/\n[a-z][a-zA-Z0-9-]*:/);
  if (next < 0) return tail.trimEnd();
  return tail.slice(0, after + 1 + next).trimEnd();
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VUE_ROOT = path.resolve(__dirname, '..');

const ADMIN_ROOT = path.resolve(VUE_ROOT, '..', 'vue-admin');

const META_PATH = path.join(VUE_ROOT, 'registry', 'registry-meta.json');



const META = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));



const ADMIN_ONLY = new Set([

  'AdminPage',

  'AdminWorkList',

  'SizeScope',

  'LayoutSider',

  'DataTable',

  'ChatMessage',

  'ChatSender',

  'ChatThinking',

]);



const TIER_MAP = {

  AdminPage: 'T3',

  AdminWorkList: 'T3',

  DataTable: 'T3',

  LayoutSider: 'T3',

  SizeScope: 'T1',

  ChatMessage: 'T2',

  ChatSender: 'T2',

  ChatThinking: 'T2',

};



function pascalFromFile(file) {

  return file.replace(/\.vue$/, '').replace(/(^\w|-\w)/g, (s) =>

    s.replace('-', '').toUpperCase(),

  );

}



function listVueFiles(dir, base = dir) {

  const out = [];

  if (!fs.existsSync(dir)) return out;

  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {

    if (ent.name.startsWith('.') || ent.name === '__tests__' || ent.name === '__demos__') continue;

    const full = path.join(dir, ent.name);

    if (ent.isDirectory()) out.push(...listVueFiles(full, base));

    else if (ent.name.endsWith('.vue')) {

      out.push({

        abs: full,

        rel: path.relative(base, full).replace(/\\/g, '/'),

        name: pascalFromFile(ent.name),

      });

    }

  }

  return out;

}



function inferTier(name) {

  return META.tierOverrides?.[name] ?? TIER_MAP[name] ?? META.components?.[name]?.tier ?? 'T0';

}



function registrySubdir(pkg, rel) {

  if (pkg === '@ocpui/vue-admin') return 'shells';

  const top = rel.split('/')[0];

  const map = {

    'data-entry': 'primitives',

    'data-display': 'display',

    feedback: 'feedback',

    navigation: 'navigation',

    layout: 'layout',

    utility: 'primitives',

    animation: 'animation',

    interaction: 'interaction',

  };

  return map[top] ?? 'primitives';

}



function categoryKey(pkg, rel) {

  if (pkg === '@ocpui/vue-admin') return 'shells';

  return rel.split('/')[0];

}



function yamlArray(arr) {

  if (!arr?.length) return '[]';

  if (arr.length === 1) return `[${arr[0]}]`;

  return `\n${arr.map((v) => `  - "${String(v).replace(/"/g, '\\"')}"`).join('\n')}`;

}



function resolveMeta(comp) {

  const explicit = META.components?.[comp.name] ?? {};

  const cat = META.categoryDefaults?.[categoryKey(comp.package, comp.rel)] ?? {};

  return {

    surfaces: explicit.surfaces ?? cat.surfaces ?? ['list', 'form'],

    scenes: explicit.scenes ?? cat.scenes ?? ['workbench'],

    composes: explicit.composes ?? [],

    slots: explicit.slots ?? [],

    antiPatterns: explicit.antiPatterns ?? cat.antiPatterns ?? [],

    replaces: explicit.replaces ?? [],

    localeKeys: explicit.localeKeys ?? [],

    // v2 语义字段（真值源 registry-meta.json，中文随 JSON 读取）
    duty: explicit.duty ?? null,

    dispatchRole: explicit.dispatchRole ?? null,

    focusPolicy: explicit.focusPolicy ?? null,

    handlesStates: explicit.handlesStates ?? null,

    feedbackChannel: explicit.feedbackChannel ?? null,

    decisions: explicit.decisions ?? null,

    stateEntry: explicit.stateEntry ?? null,

  };

}

function yamlScalarLines(key, arr) {

  return `${key}:\n${arr.map((v) => `  - ${String(v)}`).join('\n')}`;

}

function decisionsYaml(list) {

  const items = list

    .map(

      (d) => `  - intent: "${d.intent}"
    sceneRef: "${d.sceneRef}"
    manifestation: "${d.manifestation}"`,

    )

    .join('\n');

  return `decisions:\n${items}`;

}



function buildRegistryBody(comp, meta) {
  const lines = [
    `# ${comp.name}`,
    '',
    `源码：\`${comp.source}\``,
    '',
    '## 选用',
    '',
    `- **Tier**：${comp.tier}`,
    `- **Surface**：${meta.surfaces.join('、')}`,
    `- **Scene**：${meta.scenes.join('、')}`,
    ...(meta.stateEntry ? [`- 状态入口：\`${meta.stateEntry}\` 统一状态语义（F:STATE-SYSTEM）`] : []),
    '',
  ];
  if (meta.composes.length) {
    lines.push('## 组合', '', meta.composes.map((c) => `- ${c}`).join('\n'), '');
  }
  if (meta.slots.length) {
    lines.push('## 插槽', '', meta.slots.map((s) => `- \`#${s}\``).join('\n'), '');
  }
  if (meta.antiPatterns.length) {
    lines.push('## 反模式', '', meta.antiPatterns.map((a) => `- ${a}`).join('\n'), '');
  }
  if (meta.replaces.length) {
    lines.push('## 替代', '', meta.replaces.map((r) => `- ${r}`).join('\n'), '');
  }
  if (meta.localeKeys.length) {
    lines.push('## i18n', '', meta.localeKeys.map((k) => `- \`${k}\``).join('\n'), '');
  }
  lines.push('## 安装', '', '```bash', `ocp add ${comp.name}`, '```', '');
  return lines.join('\n');
}

function writeRegistryEntry(comp) {

  const sub = registrySubdir(comp.package, comp.rel);

  const regDir = path.join(

    comp.package === '@ocpui/vue-admin' ? ADMIN_ROOT : VUE_ROOT,

    'registry',

    sub,

  );

  fs.mkdirSync(regDir, { recursive: true });

  const slug = comp.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  const mdPath = path.join(regDir, `${slug}.md`);
  const registryRel = `registry/${sub}/${slug}.md`;
  const existingRaw = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : '';
  const semanticId =
    parseFrontmatterId(existingRaw) ?? componentSemanticId(comp.name, registryRel);
  const motionBlock = extractMotionBlock(existingRaw);

  const meta = resolveMeta(comp);

  const v2Fields = [];
  if (meta.duty) v2Fields.push(`duty: "${meta.duty}"`);
  if (meta.dispatchRole) v2Fields.push(`dispatchRole: ${meta.dispatchRole}`);
  if (meta.focusPolicy) v2Fields.push(`focusPolicy: ${meta.focusPolicy}`);
  if (meta.handlesStates?.length) v2Fields.push(yamlScalarLines('handlesStates', meta.handlesStates));
  if (meta.feedbackChannel) v2Fields.push(`feedbackChannel: ${meta.feedbackChannel}`);
  if (meta.decisions?.length) v2Fields.push(decisionsYaml(meta.decisions));
  const v2Block = v2Fields.length ? `${v2Fields.join('\n')}\n` : '';

  const fm = `---

type: Component

id: ${semanticId}

name: ${comp.name}

tier: ${comp.tier}

package: "${comp.package}"

status: stable

surfaces: ${yamlArray(meta.surfaces)}

scenes: ${yamlArray(meta.scenes)}

requires: [UiRoot]

composes: ${yamlArray(meta.composes)}

${meta.slots.length ? `slots: ${yamlArray(meta.slots)}\n` : ''}antiPatterns:${yamlArray(meta.antiPatterns)}

${meta.replaces.length ? `replaces: ${yamlArray(meta.replaces)}\n` : ''}${meta.localeKeys.length ? `localeKeys: ${yamlArray(meta.localeKeys)}\n` : ''}${v2Block}${motionBlock ? `${motionBlock}\n` : ''}since: "0.1.0"

---

${buildRegistryBody(comp, meta)}
`;

  fs.writeFileSync(mdPath, fm);

  return path.relative(

    comp.package === '@ocpui/vue-admin' ? ADMIN_ROOT : VUE_ROOT,

    mdPath,

  ).replace(/\\/g, '/');

}



const vueFiles = listVueFiles(path.join(VUE_ROOT, 'src', 'components'));

const adminFiles = listVueFiles(path.join(ADMIN_ROOT, 'src', 'components'));



const components = [];



for (const f of vueFiles) {

  if (ADMIN_ONLY.has(f.name)) continue;

  const tier = inferTier(f.name);

  const pkg = '@ocpui/vue';

  const source = `src/components/${f.rel}`;

  const entry = { name: f.name, package: pkg, tier, source, rel: f.rel };

  entry.registry = writeRegistryEntry(entry);

  components.push(entry);

}



for (const f of adminFiles) {

  const tier = inferTier(f.name);

  const pkg = '@ocpui/vue-admin';

  const source = `src/components/${f.rel}`;

  const entry = { name: f.name, package: pkg, tier, source, rel: f.rel };

  entry.registry = writeRegistryEntry(entry);

  components.push(entry);

}



components.sort((a, b) => a.name.localeCompare(b.name));



const indexMd = `# OCP UI Registry



组件总数：${components.length}



## 组件索引



${components.map((c) => `- [${c.name}](${c.registry}) — ${c.package} (${c.tier})`).join('\n')}

`;



fs.writeFileSync(path.join(VUE_ROOT, 'registry', 'index.md'), indexMd);

fs.writeFileSync(

  path.join(VUE_ROOT, 'registry', 'manifest.json'),

  JSON.stringify({ components }, null, 2),

);



console.log(`[registry:build] ${components.length} entries`);

await import('./enrich-registry-bodies.mjs');

