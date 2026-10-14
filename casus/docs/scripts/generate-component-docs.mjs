#!/usr/bin/env node
/**
 * 从 registry 批量生成组件文档骨架（不覆盖已有文件）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VUE_REGISTRY = path.resolve(ROOT, '../../core/vue/registry');
const ADMIN_REGISTRY = path.resolve(ROOT, '../../core/vue-admin/registry');
const OUT_ROOT = path.resolve(ROOT, 'components');

/** T0 原语优先名单 */
const PRIMITIVE_PRIORITY = new Set([
  'button', 'input', 'select', 'checkbox', 'radio', 'switch', 'textarea',
  'badge', 'tag', 'empty', 'spin', 'alert', 'modal', 'dialog', 'drawer',
]);

/** T2 / admin Shell 优先名单 */
const SHELL_PRIORITY = new Set([
  'admin-page', 'admin-work-list', 'admin-filter-toolbar', 'data-table', 'layout-sider',
]);

function listRegistryFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) {
    return results;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listRegistryFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function parseRegistryMeta(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return {};
  }
  const meta = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) {
      meta[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
    }
  }
  return meta;
}

function slugFromRegistryPath(filePath, baseDir) {
  return path.relative(baseDir, filePath).replace(/\\/g, '/').replace(/\.md$/i, '');
}

function resolveOutputPath(slug, packageName) {
  const baseName = slug.split('/').pop() ?? slug;
  if (packageName.includes('vue-admin') || slug.startsWith('shells/')) {
    return path.join(OUT_ROOT, 'shells', `${baseName}.md`);
  }
  const category = slug.includes('/') ? slug.split('/')[0] : 'misc';
  if (['primitives', 'display', 'navigation', 'feedback', 'layout', 'interaction', 'animation'].includes(category)) {
    const bucket = category === 'primitives' ? 'primitives' : 'blocks';
    return path.join(OUT_ROOT, bucket, `${baseName}.md`);
  }
  return path.join(OUT_ROOT, 'blocks', `${baseName}.md`);
}

function shouldGenerate(slug, packageName, meta) {
  const base = slug.split('/').pop() ?? slug;
  if (packageName.includes('vue-admin') || slug.startsWith('shells/')) {
    return SHELL_PRIORITY.has(base);
  }
  const tier = meta.tier ?? '';
  if (tier === 'T0' || tier === 'T1') {
    return PRIMITIVE_PRIORITY.has(base);
  }
  return false;
}

function buildSkeleton({ name, id, tier, pkg, slug }) {
  const title = name || slug.split('/').pop() || 'Component';
  return `---
title: ${title}
description: ${title} 组件
draft: true
tags: [${tier || 'T0'}, auto-generated]
---

# ${title}

Registry：\`${id || '—'}\` · \`${pkg || '@ocpui/vue'}\`

> 自动生成骨架，待补充 Demo 与 API 说明。

## 参考

- Registry：\`packages/ocpui/core/${pkg?.includes('admin') ? 'vue-admin' : 'vue'}/registry/${slug}.md\`

`;
}

function writeIfAbsent(targetPath, content) {
  if (fs.existsSync(targetPath)) {
    return false;
  }
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, 'utf8');
  return true;
}

function main() {
  const sources = [
    { dir: VUE_REGISTRY, pkg: '@ocpui/vue' },
    { dir: ADMIN_REGISTRY, pkg: '@ocpui/vue-admin' },
  ];

  let created = 0;
  let skipped = 0;

  for (const { dir, pkg } of sources) {
    for (const file of listRegistryFiles(dir)) {
      const raw = fs.readFileSync(file, 'utf8');
      const meta = parseRegistryMeta(raw);
      const slug = slugFromRegistryPath(file, dir);
      if (!shouldGenerate(slug, pkg, meta)) {
        skipped += 1;
        continue;
      }
      const outPath = resolveOutputPath(slug, pkg);
      const content = buildSkeleton({
        name: meta.name,
        id: meta.id,
        tier: meta.tier,
        pkg,
        slug,
      });
      if (writeIfAbsent(outPath, content)) {
        created += 1;
        console.log(`+ ${path.relative(ROOT, outPath)}`);
      }
    }
  }

  console.log(`\n完成：新建 ${created}，跳过 ${skipped}（非优先或未匹配）`);
}

main();
