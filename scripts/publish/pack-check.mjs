#!/usr/bin/env node
/**
 * 发布形态校验（替代 npm pack --dry-run）
 *
 * npm pack 不认 pnpm 的 publishConfig.exports，看不到真实发布清单。
 * 这里用 pnpm pack 打出真实 tarball，解包后检查：
 *   1. package.json 的 exports 已被 publishConfig 覆盖为 dist 产物；
 *   2. 每个固定导出目标在 tarball 内存在；
 *   3. 不含 workspace: 协议残留。
 * 前置：已执行 pnpm build。
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cwd = process.cwd();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ocpui-pack-'));
try {
  execFileSync('pnpm', ['pack', '--pack-destination', tmp], { cwd, stdio: 'pipe' });
  const tgz = fs.readdirSync(tmp).find((f) => f.endsWith('.tgz'));
  execFileSync('tar', ['-xzf', path.join(tmp, tgz), '-C', tmp]);
  const root = path.join(tmp, 'package');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const errors = [];

  const targets = [];
  for (const [key, v] of Object.entries(pkg.exports ?? {})) {
    if (typeof v === 'string') targets.push([key, v]);
    else for (const t of Object.values(v)) targets.push([key, t]);
  }
  if (!String(pkg.exports?.['.']?.import ?? pkg.exports?.['.'] ?? '').startsWith('./dist/')) {
    errors.push('exports["."] 未指向 dist（publishConfig.exports 未生效？）');
  }
  for (const [key, t] of targets) {
    if (t.includes('*')) {
      const dir = path.join(root, t.slice(0, t.indexOf('*')));
      if (!fs.existsSync(dir)) errors.push(`通配导出目录缺失: ${key} -> ${t}`);
    } else if (!fs.existsSync(path.join(root, t))) {
      errors.push(`导出目标缺失: ${key} -> ${t}`);
    }
  }
  const raw = fs.readFileSync(path.join(root, 'package.json'), 'utf8');
  if (raw.includes('workspace:')) errors.push('package.json 残留 workspace: 协议');

  const files = execFileSync('tar', ['-tzf', path.join(tmp, tgz)], { encoding: 'utf8' }).trim().split('\n');
  const size = fs.statSync(path.join(tmp, tgz)).size;
  console.log(`[pack-check] ${pkg.name}@${pkg.version}: ${files.length} files, ${(size / 1024).toFixed(1)} KiB, ${targets.length} export targets`);
  if (errors.length) {
    console.error('[pack-check] 失败:\n  ' + errors.join('\n  '));
    process.exit(1);
  }
  console.log('[pack-check] ok');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
