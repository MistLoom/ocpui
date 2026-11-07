// 由 enhanceDocDemos.ts 通过 /// <reference> 显式拉入，保证源码直出（exports→src）的消费方程序也能解析该虚拟模块
declare module 'virtual:ocp-doc-demos' {
  import type { Component } from 'vue';
  export function loadDocDemo(id: string): Promise<Component>;
}
