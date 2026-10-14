import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const PACKAGE_ROOTS: Record<string, string> = {
  '@ocpui/vue': path.resolve(PKG_ROOT, '../../core/vue'),
  '@ocpui/vue-admin': path.resolve(PKG_ROOT, '../../core/vue-admin'),
  '@ocpui/vue-docs': path.resolve(PKG_ROOT, '../../core/vue-docs'),
  '@ocpui/markdown-core': path.resolve(PKG_ROOT, '../markdown-core'),
};

type ExportMap = Record<string, string>;

function readExportMap(root: string): ExportMap {
  const pkgJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as {
    exports?: ExportMap;
    main?: string;
  };
  return pkgJson.exports ?? { '.': pkgJson.main ?? './src/index.ts' };
}

/** 解析 package.json exports（含 * 通配） */
function resolveExportTarget(root: string, subpath: string): string | undefined {
  const exports = readExportMap(root);
  const request = subpath === '.' ? '.' : `./${subpath}`;

  if (typeof exports[request] === 'string') {
    return path.resolve(root, exports[request]);
  }

  for (const [key, target] of Object.entries(exports)) {
    if (!key.includes('*')) {
      continue;
    }
    const prefix = key.slice(0, key.indexOf('*'));
    const suffix = key.slice(key.indexOf('*') + 1);
    if (!request.startsWith(prefix) || !request.endsWith(suffix)) {
      continue;
    }
    const matched = request.slice(prefix.length, request.length - suffix.length);
    const resolvedTarget = target.replace('*', matched);
    return path.resolve(root, resolvedTarget);
  }

  return undefined;
}

/** 通过 package exports 解析 @ocpui/* 导入 */
function resolveOcpuiSpecifier(specifier: string): string | undefined {
  for (const [pkg, root] of Object.entries(PACKAGE_ROOTS)) {
    if (specifier !== pkg && !specifier.startsWith(`${pkg}/`)) {
      continue;
    }
    const subpath = specifier === pkg ? '.' : specifier.slice(pkg.length + 1);
    const resolved = resolveExportTarget(root, subpath);
    if (resolved && fs.existsSync(resolved)) {
      return resolved;
    }
  }
  return undefined;
}

/** 解析 monorepo 内 @ocpui workspace 包 */
export function ocpuiResolvePlugin(): Plugin {
  return {
    name: 'ocpui-resolve',
    enforce: 'pre',
    resolveId(source) {
      const resolved = resolveOcpuiSpecifier(source);
      return resolved ?? undefined;
    },
  };
}
