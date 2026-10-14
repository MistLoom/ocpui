<!--
ThemeToggle 组件

功能：主题切换按钮。整页过渡走 View Transitions API；图标在按钮内交叉淡入。

属性：
- size: 'sm' | 'md' | 'lg' - 按钮尺寸，默认 'md'
- variant: 'default' | 'ghost' | 'outline' - 按钮样式，默认 'default'
- showLabel: boolean - 是否显示文字标签，默认 false

事件：
- mode-change: 模式变化事件，返回新的模式
-->

<template>
  <button
    ref="buttonRef"
    type="button"
    :class="buttonClasses"
    :aria-label="ariaLabel"
    :aria-pressed="isDark"
    @click="handleToggle"
  >
    <span class="theme-toggle-icon-wrapper" aria-hidden="true">
      <Icon
        name="sun"
        :size="iconSize"
        custom-class="theme-toggle-icon theme-toggle-icon--sun"
      />
      <Icon
        name="moon"
        :size="iconSize"
        custom-class="theme-toggle-icon theme-toggle-icon--moon"
      />
    </span>

    <span v-if="showLabel" class="theme-toggle-label">
      {{ isDark ? t('components.utility.themeToggle.darkMode') : t('components.utility.themeToggle.lightMode') }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import type { ColorMode } from '@ocpui/vue/themes';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useThemeTransition } from '../../themes/composables/useThemeTransition';
import { useComponentSize } from '../composables/useComponentSize';
import Icon from './Icon.vue';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: undefined,
  variant: 'default',
  showLabel: false,
});

const emit = defineEmits<{
  'mode-change': [mode: ColorMode];
}>();

const { uiT: t } = useUiT();
const resolvedSize = useComponentSize(toRef(props, 'size'));
const { isDark, isTransitioning, currentMode, toggleModeWithTransition } = useThemeTransition();

const ariaLabel = computed(() =>
  isDark.value
    ? t('components.utility.themeToggle.switchToLight')
    : t('components.utility.themeToggle.switchToDark'),
);

const iconSize = computed(() => {
  const map = { sm: 16, md: 20, lg: 24 } as const;
  return map[resolvedSize.value];
});

const buttonClasses = computed(() => {
  const classes = [
    'theme-toggle',
    `theme-toggle--${resolvedSize.value}`,
    `theme-toggle--${props.variant}`,
  ];
  if (isTransitioning.value) classes.push('theme-toggle--transitioning');
  if (isDark.value) classes.push('theme-toggle--dark');
  return classes;
});

const handleToggle = async (event: MouseEvent) => {
  await toggleModeWithTransition(event);
  emit('mode-change', currentMode.value);
};
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  transition: background-color 0.2s cubic-bezier(0.2, 0, 0, 1),
              color 0.2s cubic-bezier(0.2, 0, 0, 1),
              border-color 0.2s cubic-bezier(0.2, 0, 0, 1),
              box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1),
              transform 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.theme-toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.25);
}

.theme-toggle:active:not(:disabled) {
  transform: scale(0.96);
}

.theme-toggle--sm {
  padding: 6px;
  min-width: 32px;
  height: 32px;
}

.theme-toggle--md {
  padding: 8px;
  min-width: 40px;
  height: 40px;
}

.theme-toggle--lg {
  padding: 12px 16px;
  min-width: 48px;
  height: 48px;
}

.theme-toggle--default {
  background: hsl(var(--surface));
  color: hsl(var(--text));
  box-shadow: var(--shadow-sm);
}

.theme-toggle--default:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
}

.theme-toggle--ghost {
  background: transparent;
  color: hsl(var(--text-secondary));
}

.theme-toggle--ghost:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  color: hsl(var(--text));
}

.theme-toggle--outline {
  background: transparent;
  color: hsl(var(--text));
  border: 1px solid hsl(var(--border));
}

.theme-toggle--outline:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
}

.theme-toggle-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
}

.theme-toggle--sm .theme-toggle-icon-wrapper {
  width: 16px;
  height: 16px;
}

.theme-toggle--md .theme-toggle-icon-wrapper {
  width: 20px;
  height: 20px;
}

.theme-toggle--lg .theme-toggle-icon-wrapper {
  width: 24px;
  height: 24px;
}

.theme-toggle-icon-wrapper :deep(.theme-toggle-icon) {
  position: absolute;
  inset: 0;
  transition: opacity 0.3s cubic-bezier(0.2, 0, 0, 1),
              transform 0.3s cubic-bezier(0.2, 0, 0, 1),
              filter 0.3s cubic-bezier(0.2, 0, 0, 1);
}

.theme-toggle-icon-wrapper :deep(.theme-toggle-icon--sun) {
  opacity: 1;
  transform: scale(1);
  filter: blur(0);
}

.theme-toggle-icon-wrapper :deep(.theme-toggle-icon--moon) {
  opacity: 0;
  transform: scale(0.25);
  filter: blur(4px);
}

.theme-toggle--dark :deep(.theme-toggle-icon--sun) {
  opacity: 0;
  transform: scale(0.25);
  filter: blur(4px);
}

.theme-toggle--dark :deep(.theme-toggle-icon--moon) {
  opacity: 1;
  transform: scale(1);
  filter: blur(0);
}

.theme-toggle-label {
  font-size: 14px;
  white-space: nowrap;
}

.theme-toggle--dark.theme-toggle--default {
  background: hsl(var(--surface-container-high));
}

@media (prefers-reduced-motion: reduce) {
  .theme-toggle,
  .theme-toggle-icon {
    transition: none;
  }
}
</style>
