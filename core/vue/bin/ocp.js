#!/usr/bin/env node
/**
 * OCP CLI — 组件 registry 分发与本地覆盖
 *
 *   ocp list [--id C:NAME] [--tier T3]
 *   ocp add <name> [--dir <path>]
 *   ocp diff <name> [--dir <path>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatterId } from '../scripts/registry-id.mjs';
import {
  collectRelativeDeps,
  copyWithBanner,
  diffText,
  findOverrideFile,
  loadJson,
  readOcpConfig,
  stripOcpBanner,
} from './ocp-lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(PKG_ROOT, 'registry', 'manifest.json');

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('[ocp] manifest 不存在，请先运行 pnpm --filter @ocpui/vue registry:build');
    process.exit(1);
  }
  return loadJson(MANIFEST_PATH);
}

function findEntry(manifest, name) {
  return manifest.components.find(
    (c) => c.name.toLowerCase() === name.toLowerCase() || c.name === name,
  );
}

function findEntryById(manifest, id) {
  for (const c of manifest.components) {
    const root =
      c.package === '@ocpui/vue-admin'
        ? path.resolve(PKG_ROOT, '..', 'vue-admin')
        : PKG_ROOT;
    const regPath = path.join(root, c.registry);
    if (!fs.existsSync(regPath)) continue;
    const raw = fs.readFileSync(regPath, 'utf8');
    if (parseFrontmatterId(raw) === id) return c;
  }
  return null;
}

function pkgRootFor(entry) {
  return entry.package === '@ocpui/vue-admin'
    ? path.resolve(PKG_ROOT, '..', 'vue-admin')
    : PKG_ROOT;
}

function readEntryId(entry) {
  const regPath = path.join(pkgRootFor(entry), entry.registry);
  if (!fs.existsSync(regPath)) return '-';
  return parseFrontmatterId(fs.readFileSync(regPath, 'utf8')) ?? '-';
}

function cmdList(opts) {
  const m = loadManifest();
  for (const c of m.components) {
    const id = readEntryId(c);
    if (opts.id && id !== opts.id) continue;
    if (opts.tier && c.tier !== opts.tier) continue;
    console.log(`${id}\t${c.name}\t${c.package}\t${c.tier}\t${c.registry}`);
  }
}

function cmdAdd(name, opts) {
  const m = loadManifest();
  const entry = findEntry(m, name);
  if (!entry) {
    console.error(`[ocp] 未找到组件: ${name}`);
    process.exit(1);
  }
  const pkgRoot = pkgRootFor(entry);
  const srcFile = path.join(pkgRoot, entry.source);
  if (!fs.existsSync(srcFile)) {
    console.error(`[ocp] 源文件不存在: ${srcFile}`);
    process.exit(1);
  }

  const outDir = path.resolve(opts.dir);
  const componentDir = path.dirname(srcFile);
  const deps = collectRelativeDeps(srcFile);
  const version = process.env.npm_package_version ?? '0.1.0';
  const banner = `@ocpSourceVersion ${entry.package}@${version}`;

  for (const dep of deps) {
    const relFromComponent = path.relative(componentDir, dep).replace(/\\/g, '/');
    const dest = path.join(outDir, relFromComponent);
    copyWithBanner(dep, dest, banner);
    console.log(`[ocp] 复制 ${relFromComponent} → ${dest}`);
  }
  console.log(`[ocp] ${entry.name} 完成（${deps.length} 个文件）`);
}

function cmdDiff(name, opts) {
  const m = loadManifest();
  const entry = findEntry(m, name);
  if (!entry) {
    console.error(`[ocp] 未找到组件: ${name}`);
    process.exit(1);
  }
  const pkgRoot = pkgRootFor(entry);
  const srcFile = path.join(pkgRoot, entry.source);
  const override = findOverrideFile(entry.name, path.resolve(opts.dir));
  if (!override) {
    console.error(`[ocp] 覆盖文件不存在: ${opts.dir}/${entry.name}.vue`);
    process.exit(1);
  }

  const source = fs.readFileSync(srcFile, 'utf8');
  const local = stripOcpBanner(fs.readFileSync(override, 'utf8'));
  const changes = diffText(source, local);

  if (!changes.length) {
    console.log(`[ocp] ${entry.name}: 与包内源码一致`);
    return;
  }
  console.log(`[ocp] ${entry.name}: ${changes.length} 行差异`);
  for (const c of changes.slice(0, 30)) {
    console.log(`  L${c.line}`);
    if (c.source) console.log(`    - ${c.source}`);
    if (c.override) console.log(`    + ${c.override}`);
  }
  if (changes.length > 30) console.log(`  ... 另有 ${changes.length - 30} 行`);
}

const args = process.argv.slice(2);
const sub = args[0];
const cfg = readOcpConfig(process.cwd());
const opts = { dir: cfg.overridesDir ?? 'src/ui-overrides', id: undefined, tier: undefined };

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir' && args[i + 1]) opts.dir = args[++i];
  else if (args[i] === '--id' && args[i + 1]) opts.id = args[++i];
  else if (args[i] === '--tier' && args[i + 1]) opts.tier = args[++i];
}

if (sub === 'list') cmdList(opts);
else if (sub === 'add' && args[1]) cmdAdd(args[1], opts);
else if (sub === 'diff' && args[1]) cmdDiff(args[1], opts);
else {
  console.log(`用法:
  ocp list [--id C:NAME] [--tier T3]
  ocp add <ComponentName> [--dir src/ui-overrides]
  ocp diff <ComponentName> [--dir src/ui-overrides]`);
  process.exit(sub ? 1 : 0);
}
