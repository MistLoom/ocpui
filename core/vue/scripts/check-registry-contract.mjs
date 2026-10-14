#!/usr/bin/env node

/** registry frontmatter 契约校验 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VUE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ADMIN_ROOT = path.resolve(VUE_ROOT, '..', 'vue-admin');
const MANIFEST = path.join(VUE_ROOT, 'registry', 'manifest.json');

const REQUIRED_SCALAR = ['type', 'name', 'tier', 'package', 'status', 'since'];
const REQUIRED_ARRAY = ['surfaces', 'scenes', 'requires'];

const MIN_BODY_LINES = { T3: 20, default: 15 };

const CARD_WRAP_ANTI = 'Card wrapping DataTable';
const CARD_WRAP_ALLOWED = new Set(['DataTable', 'AdminPage', 'AdminWorkList']);

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;

  const fm = {};
  const lines = m[1].split('\n');
  let key = null;
  let list = null;

  for (const line of lines) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      if (list && key) {
        fm[key] = list;
        list = null;
      }
      key = kv[1];
      const val = kv[2].trim();
      if (val === '') {
        list = [];
      } else if (val.startsWith('[')) {
        fm[key] = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        key = null;
      } else {
        fm[key] = val.replace(/^["']|["']$/g, '');
        key = null;
      }
      continue;
    }

    const item = line.match(/^\s+-\s+(.+)$/);
    if (item && list) {
      list.push(item[1].replace(/^["']|["']$/g, ''));
    }
  }

  if (list && key) fm[key] = list;
  return fm;
}

function hasItems(v) {
  return Array.isArray(v) && v.length > 0;
}

function getBody(raw) {
  return raw.split('---').slice(2).join('---');
}

function countBodyLines(body) {
  return body.split('\n').filter((line) => line.trim()).length;
}

function hasSection(body, title) {
  return new RegExp(`^##\\s+${title}\\s*$`, 'm').test(body);
}

function collectAntiPatterns(fm, body) {
  const fromFm = Array.isArray(fm.antiPatterns) ? fm.antiPatterns : [];
  const fromBody = [...body.matchAll(/^-\s+(.+)$/gm)].map((m) => m[1].trim());
  return [...fromFm, ...fromBody];
}

const { components } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const errors = [];

for (const c of components) {
  const root = c.package === '@ocpui/vue-admin' ? ADMIN_ROOT : VUE_ROOT;
  const regPath = path.join(root, c.registry);

  if (!fs.existsSync(regPath)) {
    errors.push(`${c.name}: registry 文件缺失`);
    continue;
  }

  const raw = fs.readFileSync(regPath, 'utf8');
  const fm = parseFrontmatter(raw);
  const body = getBody(raw);

  if (!fm) {
    errors.push(`${c.name}: frontmatter 解析失败`);
    continue;
  }

  for (const k of REQUIRED_SCALAR) {
    if (!fm[k]) errors.push(`${c.name}: 缺少 ${k}`);
  }

  for (const k of REQUIRED_ARRAY) {
    if (!hasItems(fm[k])) errors.push(`${c.name}: 缺少非空 ${k}`);
  }

  if (fm.tier !== c.tier) {
    errors.push(`${c.name}: tier 不一致 manifest=${c.tier} fm=${fm.tier}`);
  }

  if (c.tier === 'T3') {
    if (!hasItems(fm.antiPatterns)) errors.push(`${c.name}: T3 缺少 antiPatterns`);
    if (!hasItems(fm.composes)) errors.push(`${c.name}: T3 缺少 composes`);
  }

  if (!hasSection(body, '选用')) {
    errors.push(`${c.name}: registry 正文缺少「选用」章节`);
  }

  if (!hasSection(body, '反模式')) {
    errors.push(`${c.name}: registry 正文缺少「反模式」章节`);
  }

  if (c.tier === 'T3') {
    if (!hasSection(body, '组合')) {
      errors.push(`${c.name}: registry 正文缺少「组合」章节`);
    }
  } else if (!hasSection(body, 'Props')) {
    errors.push(`${c.name}: registry 正文缺少「Props」章节`);
  }

  const minLines = MIN_BODY_LINES[c.tier] ?? MIN_BODY_LINES.default;
  if (countBodyLines(body) < minLines) {
    errors.push(`${c.name}: registry 正文不足 ${minLines} 行（当前 ${countBodyLines(body)}）`);
  }

  const antiPatterns = collectAntiPatterns(fm, body);
  if (
    antiPatterns.some((p) => p === CARD_WRAP_ANTI) &&
    !CARD_WRAP_ALLOWED.has(c.name)
  ) {
    errors.push(`${c.name}: 禁止在非列表 Shell 使用 antiPattern「${CARD_WRAP_ANTI}」`);
  }
}

if (errors.length) {
  console.error('[check-registry-contract] 失败:\n' + errors.slice(0, 40).join('\n'));
  if (errors.length > 40) console.error(`... 另有 ${errors.length - 40} 条`);
  process.exit(1);
}

console.log(`[check-registry-contract] ok (${components.length} components)`);
