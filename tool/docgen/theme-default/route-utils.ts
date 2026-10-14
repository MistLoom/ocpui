import type { DocManifest } from '@ocpui/markdown-core';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

/** 折叠重复斜杠并去掉末尾 / */
export function normalizeDocRoutePath(path: string): string {
  const collapsed = path.replace(/\/+/g, '/');
  if (collapsed.length > 1 && collapsed.endsWith('/')) {
    return collapsed.slice(0, -1);
  }
  return collapsed || '/';
}

/** 由当前路由解析 sourceId，优先 meta / name，再精确匹配 manifest */
export function resolveSourceIdFromRoute(
  route: RouteLocationNormalizedLoaded,
  manifest: DocManifest | undefined,
): string {
  const metaSourceId = route.meta.sourceId;
  if (typeof metaSourceId === 'string' && metaSourceId) {
    return metaSourceId;
  }
  if (typeof route.name === 'string' && route.name) {
    return route.name.replace(/--edit$/, '');
  }
  if (!manifest) {
    return '';
  }
  const currentPath = normalizeDocRoutePath(route.path.replace(/\/edit$/, '') || '/');
  const matched = manifest.routes.find((item) => {
    const routePath = normalizeDocRoutePath(item.path);
    return routePath === currentPath;
  });
  return matched?.sourceId ?? '';
}

/** 当前路由是否为编辑态 */
export function resolveEditModeFromRoute(route: RouteLocationNormalizedLoaded): boolean {
  return route.meta.mode === 'edit';
}

/** 将 manifest 绝对路径转为编辑态 vue-router push 路径 */
export function resolveEditRouterPath(manifest: DocManifest | undefined, targetPath: string): string {
  const readPath = resolveRouterPath(manifest, targetPath);
  return readPath === '/' ? '/edit' : `${readPath}/edit`;
}

/** 将 manifest 绝对路径转为 vue-router push 路径 */
export function resolveRouterPath(manifest: DocManifest | undefined, targetPath: string): string {
  if (!manifest) {
    return normalizeDocRoutePath(targetPath);
  }
  const raw =
    manifest.basePath === '/'
      ? targetPath
      : targetPath.startsWith(manifest.basePath)
        ? targetPath.slice(manifest.basePath.length) || '/'
        : targetPath;
  return normalizeDocRoutePath(raw);
}
