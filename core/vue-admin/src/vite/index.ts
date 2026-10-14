import type { Plugin } from 'vite';
import { ocpuiComponents, type OcpuiComponentsOptions } from '@ocpui/vue/vite';

export type OcpuiAdminPluginOptions = Partial<OcpuiComponentsOptions> & {
  extraDirs?: string[];
};

/**
 * @deprecated 请使用 @ocpui/vue/vite 的 ocpuiComponents（已合并 admin 扫描）
 */
export function ocpuiAdmin(options: OcpuiAdminPluginOptions = {}): Plugin {
  return ocpuiComponents({
    ...options,
    root: options.root ?? process.cwd(),
    adminExtraDirs: [
      ...(options.adminExtraDirs ?? []),
      ...(options.extraDirs ?? []),
    ],
    includeAdmin: true,
  });
}

export { ocpuiComponents };
export type { OcpuiComponentsOptions };
