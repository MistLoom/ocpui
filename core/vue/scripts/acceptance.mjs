#!/usr/bin/env node
/**
 * OCP UI 包级验收：exports 可解析 + registry 同步 + 门禁脚本
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const REQUIRED_EXPORTS = [
  '.',
  './types',
  './utility',
  './feedback',
  './feedback-context',
  './themes',
  './styles',
  './validation',
  './utils',
  './vite',
  './registry',
  './docs/SELECTION',
  './nuxt',
];

function readPkg() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
}

function checkExports() {
  const pkg = readPkg();
  const errors = [];
  for (const key of REQUIRED_EXPORTS) {
    const target = pkg.exports?.[key];
    if (!target) {
      errors.push(`exports 缺失: ${key}`);
      continue;
    }
    const filePath = path.join(ROOT, String(target).replace(/^\.\//, ''));
    if (!fs.existsSync(filePath)) {
      errors.push(`exports 目标不存在: ${key} -> ${target}`);
    }
  }
  const manifest = path.join(ROOT, 'registry', 'manifest.json');
  if (!fs.existsSync(manifest)) {
    errors.push('registry/manifest.json 不存在，请先运行 pnpm registry:build');
  }
  if (errors.length) {
    console.error('[acceptance] exports 检查失败:\n' + errors.join('\n'));
    process.exit(1);
  }
  console.log('[acceptance] exports ok');
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

checkExports();
run('pnpm', ['check']);

const ocpBin = path.join(ROOT, 'bin', 'ocp.js');
const list = spawnSync('node', [ocpBin, 'list'], { cwd: ROOT, encoding: 'utf8' });
if (list.status !== 0 || !list.stdout?.includes('Button')) {
  console.error('[acceptance] ocp list 失败');
  process.exit(1);
}
console.log('[acceptance] ocp list ok');

const tmpDir = path.join(ROOT, '.acceptance-overrides');
fs.rmSync(tmpDir, { recursive: true, force: true });
const add = spawnSync('node', [ocpBin, 'add', 'Button', '--dir', tmpDir], {
  cwd: ROOT,
  encoding: 'utf8',
});
if (add.status !== 0 || !fs.existsSync(path.join(tmpDir, 'Button.vue'))) {
  console.error('[acceptance] ocp add 失败');
  process.exit(1);
}
const diff = spawnSync('node', [ocpBin, 'diff', 'Button', '--dir', tmpDir], {
  cwd: ROOT,
  encoding: 'utf8',
});
if (diff.status !== 0) {
  console.error('[acceptance] ocp diff 失败');
  process.exit(1);
}
fs.rmSync(tmpDir, { recursive: true, force: true });
console.log('[acceptance] ocp add/diff ok');
