#!/usr/bin/env node
/**
 * UI 组件库模块拓扑检查
 *
 * 目的：把"反向 barrel import"和"barrel 双重导出"在 build 阶段就拦掉，
 * 避免再触发 Rollup 的"circular chunk dependency"警告以及运行期
 * "Failed to fetch dynamically imported module"。
 *
 * 检查项：
 *   A. leaf 组件不允许从所在 group 的子 barrel 反向 import（自引用环）
 *      形式：src/components/ui/<group>/<Leaf>.vue
 *           import { X } from '../<group>' | '../<group>/index'
 *      这条等价于"Component → barrel(export X) → Component"，是模块级环。
 *
 *   B. leaf 组件不允许从公共 barrel 反向 import
 *      形式：import { ... } from '@ocpui/vue'
 *      公共 barrel re-export 各 sub-barrel，sub-barrel 再 re-export 自己。
 *
 *   C. barrel 不允许双重导出（export { default as X } + export default { X: () => import })
 *      同一名字既被静态拉又被动态拉，Rollup 会报"dynamic+static 同时 import"。
 *
 * 用法：
 *   node scripts/check-ui-imports.mjs
 *
 * 退出码：0 = 通过，1 = 失败
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const UI_DIR = path.join(ROOT, 'src', 'components');

const errors = [];
const warnings = [];

function listFiles(dir, exts) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.refer' || entry.name === 'node_modules' || entry.name.startsWith('.')) {
      // .refer/ 目录是 tdesign / shadcn 等参考代码，只读不改，不纳入检查
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, exts));
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(full);
  }
  return out;
}

/**
 * 提取 Vue SFC 中 <script setup> 段的 import 声明。
 * 不依赖编译器，简单正则即可。
 */
function extractImports(content) {
  const imports = [];
  // 匹配三种:
  //   import X from 'path'
  //   import { a, b } from 'path'
  //   import X, { a } from 'path'
  //   import * as X from 'path'
  const re = /import\s+(?:[\w*\s{},]+\s+from\s+)?['"]([^'"]+)['"]\s*;?/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    imports.push(m[1]);
  }
  return imports;
}

function extractScript(content) {
  // 拿到 <script setup> 块（包括 lang="ts" 等属性）
  const re = /<script\b[^>]*>([\s\S]*?)<\/script>/g;
  const blocks = [];
  let m;
  while ((m = re.exec(content)) !== null) blocks.push(m[1]);
  return blocks.join('\n');
}

const leafFiles = listFiles(UI_DIR, ['.vue']);
const barrelFiles = listFiles(UI_DIR, ['.ts']).filter(
  (f) => path.basename(f) === 'index.ts'
);

// ---- A. leaf 自引用 ----
for (const file of leafFiles) {
  const relGroup = path.relative(UI_DIR, path.dirname(file));
  const fileGroup = relGroup === '' ? null : relGroup.split(path.sep)[0];
  if (!fileGroup) continue; // 顶层 .vue 不会出现"自引用"

  const content = fs.readFileSync(file, 'utf-8');
  const script = extractScript(content);
  const imports = extractImports(script);
  const rel = path.relative(ROOT, file);

  for (const imp of imports) {
    // 反向 self-ref: from '../<fileGroup>' or '../<fileGroup>/index'
    const selfRef = new RegExp(
      `^\\.\\.\\/\\.?${fileGroup}(?:\\/index(?:\.ts)?)?$`
    );
    if (selfRef.test(imp)) {
      errors.push(
        `[A 自引用] ${rel}: 不允许从所在 group 的子 barrel 反向 import ` +
          `('${imp}')。改用直引 './X.vue' 或跨 group 的子 barrel '../<otherGroup>'。`
      );
    }

    // 反向 public barrel: from '@ocpui/vue'
    if (imp === '@ocpui/vue' || imp === '@ocpui/vue/') {
      errors.push(
        `[B 公共 barrel] ${rel}: 不允许 import 公共 barrel ` +
          `('${imp}')。leaf 必须从子 barrel ('../<group>') 或直引 ('./X.vue') 拿组件。`
      );
    }

    // 反向 self-ref 的相对 './index'
    if (imp === './index' || imp === './index.ts' || imp === './') {
      warnings.push(
        `[A* 提示] ${rel}: 形如 '${imp}' 的导入在某些情况下也会形成 ` +
          `自引用。如果是 leaf 反向 import 自己，建议改用直引 './X.vue'。`
      );
    }
  }
}

// ---- C. barrel 双重导出 ----
const dualExportRe = /export\s+default\s*\{[\s\S]*?\n\}\s*;?/g;
for (const barrel of barrelFiles) {
  const rel = path.relative(ROOT, barrel);
  const content = fs.readFileSync(barrel, 'utf-8');
  if (dualExportRe.test(content)) {
    errors.push(
      `[C 双重导出] ${rel}: barrel 中存在 export default { X: () => import(...) } ` +
        `动态注册块。unplugin-vue-components 已经负责按目录自动注册，barrel 保留 ` +
        `动态 import 块会让 Rollup 报"dynamic+static 同时 import"。请删除该块。`
    );
  }
}

// ---- 报告 ----
if (warnings.length) {
  console.log(`\n=== 警告 (${warnings.length}) ===`);
  for (const w of warnings) console.log(w);
}
if (errors.length) {
  console.log(`\n=== 失败 (${errors.length}) ===`);
  for (const e of errors) console.log(e);
  console.log(
    '\n修复后重跑此脚本。规则参见：' +
      path.relative(ROOT, path.join(__dirname, '..', '.trae', 'rules', 'components.md'))
  );
  process.exit(1);
}

console.log(`[check-ui-imports] 通过：扫描 ${leafFiles.length} 个 leaf、${barrelFiles.length} 个 barrel，无违规。`);
