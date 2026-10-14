import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Alias, Plugin } from 'vite'
import Components from 'unplugin-vue-components/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** 定位 @ocpui/vue 包根（兼容 jiti 改写 import.meta.url） */
function findVuePkgRoot(): string {
  let dir = __dirname
  for (let i = 0; i < 6; i++) {
    const pkgJson = path.join(dir, 'package.json')
    try {
      if (
        fs.existsSync(pkgJson) &&
        JSON.parse(fs.readFileSync(pkgJson, 'utf8')).name === '@ocpui/vue'
      ) {
        return dir
      }
    } catch {
      /* 继续上溯 */
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return path.resolve(__dirname, '../..')
}

export const VUE_PKG = findVuePkgRoot()
const ADMIN_PKG = path.resolve(VUE_PKG, '..', 'vue-admin')

/** 转为 unplugin 可扫描的相对路径（统一 /，支持 workspace 包在 root 外） */
function toScanDir(viteRoot: string, absDir: string): string {
  const rel = path.relative(viteRoot, path.resolve(absDir)).replace(/\\/g, '/')
  return rel.startsWith('.') ? rel : `./${rel}`
}

/** package.json exports 中的固定子路径 → 相对 VUE_PKG 的文件 */
const EXPORT_FILE_MAP: Record<string, string> = {
  '': 'src/index.ts',
  types: 'src/types/index.ts',
  utility: 'src/components/utility/index.ts',
  feedback: 'src/components/feedback/index.ts',
  'feedback-context': 'src/feedback/index.ts',
  'navigation/types': 'src/components/navigation/types.ts',
  themes: 'src/themes/index.ts',
  styles: 'src/themes/globals.css',
  'styles/full': 'src/themes/styles.css',
  'themes/editorial': 'src/themes/editorial/index.css',
  'themes/tech': 'src/themes/tech/index.css',
  validation: 'src/validation/index.ts',
  system: 'src/system/index.ts',
  'themes/composables': 'src/themes/composables/index.ts',
  'themes/animation-tokens': 'src/themes/animation-tokens.ts',
  utils: 'src/components/utils/index.ts',
  vite: 'src/vite/index.ts',
  nuxt: 'src/nuxt/module.ts',
}

/** 与 package.json exports 对齐的通配前缀 */
const EXPORT_PREFIX_MAP: Array<{ prefix: string; to: string }> = [
  { prefix: 'utility/', to: 'src/components/utility/' },
  { prefix: 'feedback/', to: 'src/components/feedback/' },
  { prefix: 'data-display/', to: 'src/components/data-display/' },
  { prefix: 'layout/', to: 'src/components/layout/' },
  { prefix: 'composables/', to: 'src/composables/' },
  { prefix: 'locale/', to: 'src/locale/' },
]

const EXT_CANDIDATES = [
  '',
  '.ts',
  '.js',
  '.mjs',
  '.vue',
  '.css',
  '/index.ts',
  '/index.js',
]

function resolveExisting(absBase: string): string | null {
  for (const ext of EXT_CANDIDATES) {
    const candidate = absBase + ext
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate
      }
    } catch {
      /* 忽略 */
    }
  }
  return null
}

/**
 * 将 `@ocpui/vue[/sub]` 解析为包内绝对路径。
 * Nuxt SSR / vite-node 注入 css、alias 时使用。
 */
export function resolveOcpuiExportPath(
  subpath: string = '',
  pkgRoot: string = VUE_PKG,
): string | null {
  const root = path.resolve(pkgRoot)
  const sub = subpath.replace(/^\//, '')
  if (!sub) return path.join(root, EXPORT_FILE_MAP[''] ?? 'src/index.ts')
  const mapped = EXPORT_FILE_MAP[sub]
  if (mapped) return path.join(root, mapped)
  for (const { prefix, to } of EXPORT_PREFIX_MAP) {
    if (sub.startsWith(prefix)) {
      const rest = sub.slice(prefix.length)
      const hit = resolveExisting(path.join(root, to, rest))
      if (hit) return hit
    }
  }
  return (
    resolveExisting(path.join(root, 'src', sub)) ??
    resolveExisting(path.join(root, 'src/components', sub))
  )
}

/**
 * 解析 @ocpui/vue 子路径（Nuxt SSR / vite-node 不吃 package exports 指向的 .ts 时必需）
 * 注意：勿用字符串 alias '@ocpui/vue'（Vite 会 startsWith 劫持子路径）
 */
export function ocpuiResolve(pkgRoot: string = VUE_PKG): Plugin {
  const root = path.resolve(pkgRoot)
  return {
    name: 'ocpui-resolve',
    enforce: 'pre',
    resolveId(id) {
      if (id === '@ocpui/vue' || id.startsWith('@ocpui/vue/')) {
        const sub = id === '@ocpui/vue' ? '' : id.slice('@ocpui/vue/'.length)
        return resolveOcpuiExportPath(sub, root)
      }
      return null
    },
  }
}

export interface OcpuiComponentsOptions {
  /** Vite 项目根目录（config 所在目录） */
  root: string
  /** components.d.ts 输出路径 */
  dts?: string | boolean
  /** 消费方本地覆盖目录（ocp add 输出） */
  overridesDir?: string
  /** 是否扫描 @ocpui/vue-admin（默认 true） */
  includeAdmin?: boolean
  /** @ocpui/vue-admin 包根目录（monorepo 自定义布局时） */
  adminPkgRoot?: string
  /** 额外扫描目录（如 ui-business） */
  adminExtraDirs?: string[]
}

/**
 * OCP UI 统一自动导入插件：合并 @ocpui/vue + @ocpui/vue-admin + 覆盖目录。
 * 包内组件目录使用绝对路径（Nuxt monorepo 下相对 path 常扫不到）。
 */
export function ocpuiComponents(options: OcpuiComponentsOptions): Plugin {
  const root = path.resolve(options.root)
  const dirs: string[] = []

  if (options.overridesDir) {
    dirs.push(toScanDir(root, options.overridesDir))
  }
  // 绝对路径：避免 Nuxt 下 ../../packages/... 被 unplugin 忽略
  dirs.push(path.join(VUE_PKG, 'src', 'components'))

  if (options.includeAdmin !== false) {
    const adminRoot = options.adminPkgRoot ?? ADMIN_PKG
    dirs.push(path.join(adminRoot, 'src', 'components'))
  }
  for (const extra of options.adminExtraDirs ?? []) {
    dirs.push(
      path.isAbsolute(extra) ? extra : toScanDir(root, extra),
    )
  }

  return Components({
    dirs,
    deep: true,
    extensions: ['vue'],
    dts: options.dts ?? true,
    directoryAsNamespace: false,
    exclude: [
      /[\\/]node_modules[\\/]/,
      /[\\/]__tests__[\\/]/,
      /\.theme\.test\.vue$/,
      /[\\/]__demos__[\\/]/,
      /[\\/]\.refer[\\/]/,
    ],
  }) as Plugin
}

export interface OcpuiVitePluginsOptions extends OcpuiComponentsOptions {
  /** 包根；默认 monorepo 内 VUE_PKG */
  pkgRoot?: string
}

/** Vite / Nuxt：resolve + components */
export function ocpuiVitePlugins(options: OcpuiVitePluginsOptions): Plugin[] {
  return [ocpuiResolve(options.pkgRoot), ocpuiComponents(options)]
}

/**
 * 组装 Vite resolve.alias（供 Nuxt module / 消费方复用）
 * 不含会劫持子路径的字符串 `@ocpui/vue`
 */
export function ocpuiViteAliases(pkgRoot: string = VUE_PKG): Alias[] {
  return [
    {
      find: '@ocpui/vue/styles/full',
      replacement: resolveOcpuiExportPath('styles/full', pkgRoot)!,
    },
    {
      find: '@ocpui/vue/styles',
      replacement: resolveOcpuiExportPath('styles', pkgRoot)!,
    },
    {
      find: /^@ocpui\/vue$/,
      replacement: resolveOcpuiExportPath('', pkgRoot)!,
    },
  ]
}

export interface OcpuiPluginOptions {
  root?: string
  overridesDir?: string
  dts?: string | boolean
}

/** @deprecated 请使用 ocpuiComponents 或 ocpuiVitePlugins */
export function ocpui(options: OcpuiPluginOptions = {}): Plugin {
  return ocpuiComponents({
    root: options.root ?? process.cwd(),
    overridesDir: options.overridesDir,
    dts: options.dts,
    includeAdmin: false,
  })
}
