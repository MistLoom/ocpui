import type { DocManifest } from '@ocpui/markdown-core';
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

function stripEditSuffix(routePath: string): string {
  if (routePath.endsWith('/edit')) {
    const stripped = routePath.slice(0, -'/edit'.length);
    return stripped || '/';
  }
  return routePath;
}

/** 由 manifest 生成 SPA 路由（含编辑态 /edit 后缀） */
export function createDocRouter(manifest: DocManifest, options?: { editEnabled?: boolean }) {
  const basePath = manifest.basePath;
  const stripBase = (routePath: string) => {
    if (basePath === '/') {
      return routePath;
    }
    if (routePath.startsWith(basePath)) {
      return routePath.slice(basePath.length) || '/';
    }
    return routePath;
  };

  const routes: RouteRecordRaw[] = manifest.routes.flatMap((route) => {
    const readPath = stripBase(route.path);
    const records: RouteRecordRaw[] = [
      {
        path: readPath,
        name: route.sourceId,
        component: { template: '<div />' },
        meta: { sourceId: route.sourceId, mode: 'read' },
      },
    ];
    if (options?.editEnabled) {
      const editPath = readPath === '/' ? '/edit' : `${readPath}/edit`;
      records.push({
        path: editPath,
        name: `${route.sourceId}--edit`,
        component: { template: '<div />' },
        meta: { sourceId: route.sourceId, mode: 'edit' },
      });
    }
    return records;
  });

  if (!routes.some((route) => route.path === '/')) {
    routes.unshift({
      path: '/',
      redirect: routes[0]?.path ?? '/',
    });
  }

  return createRouter({
    history: createWebHistory(basePath === '/' ? '/' : `${basePath}/`),
    routes,
  });
}

export { stripEditSuffix };
