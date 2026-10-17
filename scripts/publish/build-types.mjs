#!/usr/bin/env node
/**
 * 生成 .d.ts 到 dist/（vue-tsc emitDeclarationOnly）
 *
 * 现状：部分 SFC 的 Props 未导出（TS4082）、少量推断类型不可移植（TS2742），
 * vue-tsc 仍会产出声明但退出码非 0。这里不吞错误：打印诊断数量，
 * 并以「入口 .d.ts 是否全部生成」作为硬门禁。严格模式（OCPUI_STRICT_DTS=1）下诊断即失败。
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
const r = spawnSync('npx', ['vue-tsc', '-p', 'tsconfig.build.json'], { cwd, encoding: 'utf8' });
const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
const diags = out.split('\n').filter((l) => /error TS\d+/.test(l));

const missing = [];
for (const target of Object.values(pkg.publishConfig?.exports ?? {})) {
  if (target && typeof target === 'object' && target.types && !target.types.includes('*')) {
    if (!fs.existsSync(path.join(cwd, target.types))) missing.push(target.types);
  }
}

if (diags.length) {
  console.warn(`[build-types] ${pkg.name}: vue-tsc 报告 ${diags.length} 条声明诊断（声明仍已生成）`);
  for (const l of diags.slice(0, 20)) console.warn('  ' + l);
}
if (missing.length) {
  console.error(`[build-types] 缺少入口声明:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}
if (diags.length && process.env.OCPUI_STRICT_DTS === '1') process.exit(1);
console.log(`[build-types] ${pkg.name}: ok`);
