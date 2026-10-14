<template>
  <div class="playground-home">
    <section>
      <h1>OCP 设计系统演示</h1>
      <p style="color: hsl(var(--muted-foreground)); max-width: 640px; line-height: 1.6">
        对比完整模式与独立模式：前者通过 UiRoot + Shell + composable 运行时统一容器链、10 态、双通道与动效；后者支持碎片化嵌入。
      </p>
    </section>

    <div class="playground-home__modes">
      <article class="playground-home__mode-card playground-home__mode-card--featured">
        <h2>完整模式 · 运营指挥台</h2>
        <p>
          对标 SRE/可观测性平台：多 Tab Shell、MetricCard + TrendChart + Heatmap、事件队列批量处置、Drawer 分步 triage、Live 流系统 notify、热力图→筛选联动。
        </p>
        <div class="playground-home__links">
          <Button @click="$router.push('/full/command-center')">进入指挥台</Button>
          <Button variant="secondary" @click="$router.push('/full/list')">管理原子场景</Button>
        </div>
      </article>

      <article class="playground-home__mode-card playground-home__mode-card--consumer">
        <h2>完整模式 · 跨端内容应用</h2>
        <p>
          C 端旗舰案例：发现流 Carousel + 响应式 Grid + InfiniteScroll；编年 Timeline；移动端 BottomNav + safe-area；Drawer 详情/筛选随断点切换。
        </p>
        <div class="playground-home__links">
          <Button variant="primary" @click="$router.push('/full/consumer-app')">进入 C 端应用（推荐）</Button>
          <Button variant="secondary" @click="$router.push('/standalone/consumer')">C 端组件独立演示</Button>
        </div>
      </article>

      <article class="playground-home__mode-card">
        <h2>完整模式 · 原子场景</h2>
        <p>拆分的列表、仪表、表格、分步、交互五页，用于对照单一设计模式。</p>
        <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.875rem; color: hsl(var(--muted-foreground))">
          <li>列表 — regionState + AdminWorkList</li>
          <li>仪表 — MetricCard / GaugeChart 业务面板</li>
          <li>表格 — DataTable 可选中 + 分页</li>
          <li>分步 — presentationMode progressive + Steps</li>
          <li>交互 — GlobalSearch + SelectionToolbar</li>
        </ul>
      </article>

      <article class="playground-home__mode-card">
        <h2>文档阅读 · Doc Wiki</h2>
        <p>DocWikiShell：侧栏导航、manifest、Ctrl+K 检索、面包屑。</p>
        <div class="playground-home__links">
          <Button variant="secondary" @click="$router.push('/standalone/doc-wiki')">进入 Wiki 演示</Button>
          <Button variant="secondary" @click="$router.push('/standalone/doc-reader')">单页阅读</Button>
        </div>
      </article>

      <article class="playground-home__mode-card">
        <h2>独立模式</h2>
        <p>不依赖 UiRoot，直接 import 单组件；适合嵌入第三方页、Story、文档 demo。</p>
        <div class="playground-home__links">
          <Button variant="secondary" @click="$router.push('/standalone/gallery')">进入独立模式</Button>
        </div>
        <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.875rem; color: hsl(var(--muted-foreground))">
          <li>组件画廊 — Button / MetricCard / GaugeChart 等</li>
          <li>局部嵌入 — 单块 UI 可选包 mini UiRoot</li>
        </ul>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@ocpui/vue';
</script>
