/// <reference types="vite/client" />

interface ImportMeta {
  readonly client?: boolean;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module 'virtual:ocp-doc-demos' {
  import type { Component } from 'vue';
  export function loadDocDemo(id: string): Promise<Component>;
}
