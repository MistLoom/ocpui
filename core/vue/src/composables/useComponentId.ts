import { useId } from 'vue';

/**
 * 组件 DOM id 统一来源。
 *
 * - 基于 Vue 3.5 useId，SSR 服务端/客户端水合一致，跨请求不污染；
 * - 同一组件多次调用得到不同 id；禁止再用 Math.random / 模块计数器生成 DOM id。
 *
 * @param prefix id 前缀，需为合法 id 片段
 */
export function useComponentId(prefix = 'ocp'): string {
  // useId 结果可能含 ':'，统一替换为 '-' 以保证可用作 CSS 选择器
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}
