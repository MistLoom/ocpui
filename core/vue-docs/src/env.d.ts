/// <reference types="vite/client" />

interface ImportMeta {
  readonly client?: boolean;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

// virtual:ocp-doc-demos 声明已拆至 src/utils/virtual-doc-demos.d.ts，由 enhanceDocDemos.ts /// <reference> 拉入，
// 本 tsconfig 的 include 覆盖 src/**/*.d.ts，消费方程序也能解析该虚拟模块
