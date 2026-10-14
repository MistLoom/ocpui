<template>
  <div class="collapse-panel" :class="{ 'collapse-panel-active': isActive, 'collapse-panel-disabled': disabled }">
    <button
      type="button"
      class="collapse-panel-header"
      :aria-expanded="isActive"
      :disabled="disabled"
      @click="handleClick"
    >
      <span class="collapse-panel-arrow">
        <svg viewBox="0 0 12 12" fill="currentColor">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="collapse-panel-title">{{ title }}</span>
      <span v-if="$slots.extra || extra" class="collapse-panel-extra">
        <slot name="extra">{{ extra }}</slot>
      </span>
    </button>
    <Transition name="collapse-panel">
      <div v-show="isActive" class="collapse-panel-content">
        <div class="collapse-panel-content-inner">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type ComputedRef } from 'vue';

/**
 * 折叠面板项组件，用于 Collapse 组件中
 * 
 * @props name - 面板的唯一标识，优先级高于 key
 * @props key - 面板的唯一标识，作为 name 的备选
 * @props title - 面板标题
 * @props extra - 面板右侧的额外内容
 * @props disabled - 是否禁用，默认为 false
 * 
 * @usage
 * <CollapsePanel title="面板1" name="1">
 *   面板内容
 * </CollapsePanel>
 */

interface Props {
  name?: string | number;
  key?: string | number;
  title: string;
  extra?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  name: undefined,
  key: undefined,
  disabled: false,
});

// 注入 Collapse 组件提供的状态
const _activeKey = inject<ComputedRef<(string | number)[]>>(
  'collapseActiveKey',
  computed<(string | number)[]>(() => []),
);
const _accordion = inject<boolean>('collapseAccordion', false);
const updateActiveKey = inject<(key: string | number) => void>('collapseUpdateActiveKey', () => {});
const isActiveCheck = inject<(key: string | number) => boolean>('collapseIsActive', () => false);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
void _activeKey;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
void _accordion;

const panelKey = computed(() => props.name ?? props.key ?? '');

const isActive = computed(() => {
  return isActiveCheck ? isActiveCheck(panelKey.value) : false;
});

const handleClick = () => {
  if (props.disabled) return;
  updateActiveKey(panelKey.value);
};
</script>

<style scoped>
.collapse-panel {
  border-bottom: 1px solid hsl(var(--border));
}

.collapse-panel:last-child {
  border-bottom: none;
}

.collapse-panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  background: hsl(var(--surface));
  transition-property: background-color;
  transition-duration: 0.25s;
  transition-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
  width: 100%;
  border: none;
  text-align: left;
}

.collapse-panel-header:hover {
  background: hsl(var(--surface-hover));
}

.collapse-panel-active .collapse-panel-header {
  background: hsl(var(--primary) / 0.05);
}

.collapse-panel-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: hsl(var(--text-muted));
  transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.collapse-panel-arrow svg {
  width: 12px;
  height: 12px;
}

.collapse-panel-active .collapse-panel-arrow {
  transform: rotate(180deg);
}

.collapse-panel-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
}

.collapse-panel-extra {
  font-size: 13px;
  color: hsl(var(--text-muted));
}

.collapse-panel-content {
  overflow: hidden;
  background: hsl(var(--surface-container-high));
}

.collapse-panel-content-inner {
  padding: 16px;
}

/* 动画 */
.collapse-panel-enter-active,
.collapse-panel-leave-active {
  transition-property: opacity, max-height;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
}

.collapse-panel-enter-from,
.collapse-panel-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-panel-enter-to,
.collapse-panel-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
