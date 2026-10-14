/// <reference types="vite/client" />

/** Nuxt / 同构运行时由构建工具注入 */
interface ImportMeta {
  readonly client?: boolean;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
