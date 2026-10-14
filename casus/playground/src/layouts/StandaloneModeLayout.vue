<template>
  <div class="playground-shell">
    <nav class="playground-nav">
      <span class="playground-nav__brand">OCP Playground</span>
      <span class="playground-nav__mode-tag">独立模式</span>
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/standalone/gallery">组件画廊</RouterLink>
      <RouterLink to="/standalone/type-gallery">类型矩阵</RouterLink>
      <RouterLink to="/standalone/combination-patterns">组合模式</RouterLink>
      <RouterLink to="/standalone/consumer">C 端组件</RouterLink>
      <RouterLink to="/standalone/embedded">局部嵌入</RouterLink>
      <RouterLink to="/standalone/doc-wiki">文档 Wiki</RouterLink>
      <RouterLink to="/standalone/doc-reader">单页阅读</RouterLink>
      <RouterLink to="/standalone/doc-editor">文档编辑</RouterLink>
      <RouterLink to="/full/consumer-app">→ C 端完整模式</RouterLink>
    </nav>
    <main class="playground-main">
      <div class="playground-banner playground-banner--standalone">
        独立模式：无 UiRoot 包裹，T0 组件可直接使用；全局 toast/dialog 走组件内 fallback，可按需局部包 UiRoot。
      </div>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>
