<template>
  <div>
    <h2 style="margin-top: 0">局部嵌入</h2>
    <p style="color: hsl(var(--muted-foreground)); font-size: 0.875rem; max-width: 560px">
      模拟第三方页面中的一块 UI：外层无 UiRoot，内层可选 mini UiRoot 以启用 dialog / notify 等全局通道。
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem">
      <div class="playground-standalone-panel">
        <h3 style="margin-top: 0">纯局部（无 UiRoot）</h3>
        <MetricCard title="嵌入指标" :value="18" unit="ms" trend="down" trend-value="-2ms" />
        <Button size="sm" style="margin-top: 0.75rem" @click="localToast">局部 Toast</Button>
      </div>

      <UiRoot locale-code="zh" theme-style="editorial" class="playground-standalone-panel">
        <h3 style="margin-top: 0">mini UiRoot 包裹</h3>
        <MetricCard title="带反馈通道" :value="99" unit="%" trend="up" trend-value="+1%" />
        <Button size="sm" style="margin-top: 0.75rem" @click="channelToast">系统通道 Toast</Button>
      </UiRoot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button, MetricCard, toast, UiRoot } from '@ocpui/vue';
import { useUiActionFeedback } from '@ocpui/vue/system';

const action = useUiActionFeedback();

function localToast() {
  toast.info('fallback toast');
}

function channelToast() {
  action.message.success('通过 UiRoot 注入的 action 通道');
}
</script>

<style scoped>
@media (max-width: 720px) {
  div[style*='grid-template-columns'] {
    grid-template-columns: 1fr !important;
  }
}
</style>
