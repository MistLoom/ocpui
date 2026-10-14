import type { OcpMarkdownPlugin, OcpMarkdownPluginId } from '../types.js';
import { createShikiPlugin } from './shiki.js';

function isShikiPlugin(entry: OcpMarkdownPluginId | OcpMarkdownPlugin): boolean {
  return entry === 'shiki' || (typeof entry === 'object' && entry.id === 'shiki');
}

/** 将插件 id 列表转为预编译用列表（shiki 静态注入，避免 Vite/浏览器 load 失败） */
export function resolvePrecompilePluginList(
  ids: OcpMarkdownPluginId[],
): (OcpMarkdownPluginId | OcpMarkdownPlugin)[] {
  return ids.map((id) => (id === 'shiki' ? createShikiPlugin() : id));
}

/** 浏览器运行时编译：剔除 shiki（语言包动态加载在 Vite 下不稳定，高亮由 SSG 预编译承担） */
export function resolveBrowserCompilePluginList(
  plugins: (OcpMarkdownPluginId | OcpMarkdownPlugin)[],
): (OcpMarkdownPluginId | OcpMarkdownPlugin)[] {
  return plugins.filter((entry) => !isShikiPlugin(entry));
}

/** 编译产物是否含 shiki 彩色 token */
export function isSyntaxHighlightedHtml(html: string): boolean {
  return /--shiki-light:|--shiki-dark:/i.test(html)
    || /<pre[\s\S]*?<code[\s\S]*?style="[^"]*color:/i.test(html)
    || /<pre[\s\S]*?<code[\s\S]*?<span[\s\S]*?style="[^"]*color:/i.test(html);
}
