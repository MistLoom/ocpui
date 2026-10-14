import fs from 'node:fs'
import path from 'node:path'
import { defineNuxtModule, addVitePlugin } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { Alias, AliasOptions, Plugin, UserConfig } from 'vite'
import {
  VUE_PKG,
  ocpuiVitePlugins,
  ocpuiViteAliases,
  resolveOcpuiExportPath,
} from '../vite/index'

export interface OcpuiNuxtOptions {
  /**
   * 注入样式（绝对路径，SSR 安全）。
   * - `full`（默认）：globals + styles/full
   * - `base`：仅 globals
   * - `false`：不注入
   */
  css?: 'full' | 'base' | false
  /**
   * overrides 目录（相对 srcDir，不存在时回退 rootDir）。
   * `false` 关闭。默认 `ui-overrides`
   */
  overridesDir?: string | false
  /** 扫描 @ocpui/vue-admin，默认 false */
  includeAdmin?: boolean
  /** 额外扫描目录（相对 rootDir；同时尝试 srcDir） */
  extraDirs?: string[]
  /** components.d.ts；`false` 关闭。默认 `<rootDir>/ocpui-components.d.ts` */
  dts?: string | boolean
  /** transpile @ocpui/vue，默认 true */
  transpile?: boolean
}

function pushUniqueCss(
  cssList: Array<string | { src?: string }>,
  file: string,
) {
  const norm = file.replace(/\\/g, '/')
  const exists = cssList.some((item) => {
    const s = typeof item === 'string' ? item : item.src
    return typeof s === 'string' && s.replace(/\\/g, '/') === norm
  })
  if (!exists) {
    cssList.unshift(file)
  }
}

function asAliasArray(alias: AliasOptions | undefined): Alias[] {
  if (!alias) return []
  if (Array.isArray(alias)) return [...alias] as Alias[]
  return Object.entries(alias).map(([find, replacement]) => ({
    find,
    replacement,
  }))
}

function applyViteAliases(config: Pick<UserConfig, 'resolve'>) {
  config.resolve ??= {}
  const aliases = asAliasArray(config.resolve.alias as AliasOptions | undefined).filter((a) => {
    return !(typeof a.find === 'string' && a.find === '@ocpui/vue')
  })
  aliases.unshift(...ocpuiViteAliases(VUE_PKG))
  config.resolve.alias = aliases
}

function resolveOverridesDir(
  options: OcpuiNuxtOptions,
  root: string,
  srcDir: string,
): string | undefined {
  if (options.overridesDir === false || options.overridesDir == null) {
    return undefined
  }
  if (path.isAbsolute(options.overridesDir)) {
    return options.overridesDir
  }
  const candSrc = path.join(srcDir, options.overridesDir)
  const candRoot = path.join(root, options.overridesDir)
  if (fs.existsSync(candSrc)) return candSrc
  if (fs.existsSync(candRoot)) return candRoot
  return candSrc
}

function resolveExtraDirs(
  dirs: string[],
  root: string,
  srcDir: string,
): string[] {
  const out: string[] = []
  for (const d of dirs) {
    if (path.isAbsolute(d)) {
      out.push(d)
      continue
    }
    const a = path.join(srcDir, d)
    const b = path.join(root, d)
    if (fs.existsSync(a)) out.push(a)
    else if (fs.existsSync(b)) out.push(b)
    else out.push(a)
  }
  return out
}

export default defineNuxtModule<OcpuiNuxtOptions>({
  meta: {
    name: '@ocpui/vue',
    configKey: 'ocpui',
    compatibility: { nuxt: '>=3.8.0' },
  },
  defaults: {
    css: 'full',
    overridesDir: 'ui-overrides',
    includeAdmin: false,
    extraDirs: [],
    dts: true,
    transpile: true,
  },
  setup(options: OcpuiNuxtOptions, nuxt: Nuxt) {
    const root = nuxt.options.rootDir
    const srcDir = nuxt.options.srcDir

    if (options.css === 'full' || options.css === 'base') {
      pushUniqueCss(nuxt.options.css, resolveOcpuiExportPath('styles')!)
      if (options.css === 'full') {
        pushUniqueCss(nuxt.options.css, resolveOcpuiExportPath('styles/full')!)
      }
    }

    if (options.transpile !== false) {
      const transpile = nuxt.options.build.transpile as (string | RegExp)[]
      if (
        !transpile.some(
          (t) =>
            t === '@ocpui/vue' ||
            (t instanceof RegExp && t.test('@ocpui/vue')),
        )
      ) {
        transpile.push('@ocpui/vue')
      }
    }

    nuxt.options.alias = nuxt.options.alias || {}
    delete (nuxt.options.alias as Record<string, string>)['@ocpui/vue']
    nuxt.options.alias['@ocpui/vue/styles'] = resolveOcpuiExportPath('styles')!
    nuxt.options.alias['@ocpui/vue/styles/full'] =
      resolveOcpuiExportPath('styles/full')!

    const overridesDir = resolveOverridesDir(options, root, srcDir)
    const extraDirs = resolveExtraDirs(options.extraDirs ?? [], root, srcDir)

    const dts =
      options.dts === false
        ? false
        : typeof options.dts === 'string'
          ? path.isAbsolute(options.dts)
            ? options.dts
            : path.join(root, options.dts)
          : path.join(root, 'ocpui-components.d.ts')

    for (const plugin of ocpuiVitePlugins({
      root,
      pkgRoot: VUE_PKG,
      overridesDir,
      includeAdmin: options.includeAdmin,
      adminExtraDirs: extraDirs,
      dts,
    })) {
      addVitePlugin(plugin as Plugin)
    }

    nuxt.hook('vite:extendConfig', (config: UserConfig) => {
      applyViteAliases(config)
    })
  },
})

/** 供类型提示：nuxt.config 中 `ocpui: { ... }` */
export type { OcpuiNuxtOptions as ModuleOptions }
