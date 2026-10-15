/// <reference types="vite/client" />

/** Nuxt / 同构运行时由构建工具注入；playground 源码引用 @ocpui/vue 时需可见 */
interface ImportMeta {
  readonly client?: boolean;
}

declare module 'virtual:playground-doc-collection' {
  import type { DocCollection } from '@ocpui/markdown-core';
  export const PLAYGROUND_DOC_COLLECTION: DocCollection;
}

// playground 经源码引用 @ocpui/vue-docs，其内部依赖该 Vite 虚拟模块
declare module 'virtual:ocp-doc-demos' {
  import type { Component } from 'vue';
  export function loadDocDemo(id: string): Promise<Component>;
}
