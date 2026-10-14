/**
 * OCP CLI 共享逻辑：依赖收集、复制、diff
 */
import fs from 'node:fs';
import path from 'node:path';

const IMPORT_RE = /(?:import|export)\s+[^'"]*['"](\.[^'"]+)['"]/g;
const EXTENSIONS = ['.ts', '.tsx', '.vue', '.js', '.mjs'];

export function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function resolveRelativeImport(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec);
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
  for (const ext of EXTENSIONS) {
    const withExt = base + ext;
    if (fs.existsSync(withExt)) return withExt;
  }
  const indexTs = path.join(base, 'index.ts');
  if (fs.existsSync(indexTs)) return indexTs;
  return null;
}

/** 收集相对路径依赖（BFS） */
export function collectRelativeDeps(entryFile) {
  const queue = [path.resolve(entryFile)];
  const visited = new Set();
  const files = [];

  while (queue.length) {
    const file = queue.shift();
    if (!file || visited.has(file) || !fs.existsSync(file)) continue;
    visited.add(file);
    files.push(file);
    const text = fs.readFileSync(file, 'utf8');
    let m;
    IMPORT_RE.lastIndex = 0;
    while ((m = IMPORT_RE.exec(text))) {
      const resolved = resolveRelativeImport(file, m[1]);
      if (resolved && !visited.has(resolved)) queue.push(resolved);
    }
  }
  return files;
}

export function copyWithBanner(src, dest, banner) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  if (dest.endsWith('.vue') || dest.endsWith('.ts')) {
    const content = fs.readFileSync(dest, 'utf8');
    if (!content.includes('@ocpSourceVersion')) {
      const prefix = dest.endsWith('.vue')
        ? `<!-- ${banner} -->\n`
        : `// ${banner}\n`;
      fs.writeFileSync(dest, prefix + content);
    }
  }
}

export function stripOcpBanner(text) {
  return text
    .replace(/^<!--\s*@ocpSourceVersion[^>]*-->\s*\n?/, '')
    .replace(/^\/\/\s*@ocpSourceVersion.*\n?/, '');
}

/** 行级 diff 摘要 */
export function diffText(a, b) {
  const la = a.split('\n');
  const lb = b.split('\n');
  const max = Math.max(la.length, lb.length);
  const changed = [];
  for (let i = 0; i < max; i++) {
    const left = la[i] ?? '';
    const right = lb[i] ?? '';
    if (left !== right) changed.push({ line: i + 1, source: left, override: right });
  }
  return changed;
}

export function findOverrideFile(name, overridesDir) {
  if (!fs.existsSync(overridesDir)) return null;
  const direct = path.join(overridesDir, `${name}.vue`);
  if (fs.existsSync(direct)) return direct;
  const entries = [];
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.name.toLowerCase() === `${name.toLowerCase()}.vue`) entries.push(full);
    }
  }
  walk(overridesDir);
  return entries[0] ?? null;
}

export function readOcpConfig(cwd) {
  const cfgPath = path.join(cwd, 'ocpui.config.json');
  if (!fs.existsSync(cfgPath)) return {};
  try {
    return loadJson(cfgPath);
  } catch {
    return {};
  }
}
