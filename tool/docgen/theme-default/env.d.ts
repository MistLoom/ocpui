/// <reference types="vite/client" />

declare module 'virtual:ocp-docgen' {
  import type { DocManifest } from '@ocpui/markdown-core';
  import type { DocgenRuntimePayload } from '../src/core/build-artifacts.js';

  const payload: DocgenRuntimePayload & { manifests: DocManifest[] };
  export default payload;
}

declare module 'virtual:ocp-doc-demos' {
  import type { Component } from 'vue';
  export function loadDocDemo(id: string): Promise<Component>;
}
