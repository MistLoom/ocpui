<template>
  <UiRoot locale-code="zh" :theme-style="themeStyle" presentation-mode="summary">
    <div class="playground-shell">
      <nav class="playground-nav">
        <span class="playground-nav__brand">OCP Playground</span>
        <span class="playground-nav__mode-tag">完整模式</span>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/full/command-center">指挥台</RouterLink>
        <RouterLink to="/full/consumer-app">C 端应用</RouterLink>
        <RouterLink to="/full/list">列表</RouterLink>
        <RouterLink to="/full/dashboard">仪表</RouterLink>
        <RouterLink to="/full/table">表格</RouterLink>
        <RouterLink to="/full/progressive">分步</RouterLink>
        <RouterLink to="/full/interaction">交互</RouterLink>
        <RouterLink to="/standalone/combination-patterns">组合模式</RouterLink>
        <RouterLink to="/standalone/type-gallery">类型矩阵</RouterLink>
        <RouterLink to="/standalone/gallery">→ 独立模式</RouterLink>
        <div class="playground-nav__theme">
          <button type="button" class="playground-nav__theme-btn" @click="onToggleTheme">
            {{ themeStyle }}
          </button>
        </div>
      </nav>
      <main
        class="playground-main"
        :class="isConsumerRoute ? 'playground-main--consumer' : 'playground-main--wide'"
      >
        <div class="playground-banner playground-banner--full">
          完整模式：UiRoot 注入反馈双通道、场景上下文、动效降级；Shell 与业务组件遵循容器链与 10 态编排。
        </div>
        <RouterView />
      </main>
    </div>
  </UiRoot>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { UiRoot, useTheme, type ThemeStyleId } from '@ocpui/vue';

const route = useRoute();
const isConsumerRoute = computed(() => route.path.includes('/consumer-app'));

const { themeStyle: themeStyleState, toggleThemeStyle } = useTheme();
const themeStyle = ref<ThemeStyleId>(themeStyleState.value ?? 'editorial');

watch(themeStyleState, (v) => {
  if (v) themeStyle.value = v;
});

function onToggleTheme() {
  const next = toggleThemeStyle();
  if (next) themeStyle.value = next;
}
</script>

<style scoped>
.playground-nav__theme {
  margin-left: auto;
}

.playground-nav__theme-btn {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid hsl(var(--border));
  background: hsl(var(--surface));
  font-size: 12px;
  cursor: pointer;
}
</style>
