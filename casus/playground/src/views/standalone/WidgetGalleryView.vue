<template>
  <div class="playground-standalone-panel">
    <h2 style="margin-top: 0">组件画廊</h2>
    <p style="color: hsl(var(--muted-foreground)); font-size: 0.875rem">
      直接 import @ocpui/vue 组件，无 UiRoot。Toast 等行为使用组件内 fallback。
    </p>

    <section style="margin-top: 1.25rem">
      <h3>交互原语</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem">
        <Button @click="onClick">主要按钮</Button>
        <Button variant="secondary">次要</Button>
        <Button variant="text" @click="showToast">Toast（fallback）</Button>
      </div>
    </section>

    <section>
      <h3>仪表组件</h3>
      <div class="playground-grid playground-grid--metrics">
        <MetricCard
          title="独立 MetricCard"
          :value="42"
          unit="%"
          trend="up"
          trend-value="+3%"
          :show-chart="true"
          :chart-data="[30, 35, 38, 40, 42]"
        />
        <div class="playground-card" style="display: flex; justify-content: center">
          <GaugeChart :value="72" :min="0" :max="100" unit="%" label="独立 Gauge" :size="160" />
        </div>
      </div>
    </section>

    <section style="margin-top: 1.25rem">
      <h3>状态展示</h3>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
        <StatusTag status="success" />
        <StatusTag status="warning" />
        <StatusTag status="error" />
        <Empty title="独立 Empty" description="无 Shell 包裹" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Button, Empty, GaugeChart, MetricCard, StatusTag, toast } from '@ocpui/vue';

function onClick() {
  toast.info('独立模式：直接调用 toast API');
}

function showToast() {
  toast.success('操作成功');
}
</script>
