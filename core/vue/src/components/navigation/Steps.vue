<template>
  <div :class="stepsClass" role="list" :aria-label="t('components.navigation.steps.ariaLabel')">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="step"
      :class="{
        'step-active': index === current,
        'step-finished': index < current,
        'step-disabled': step.disabled,
        'step-clickable': !step.disabled && clickable
      }"
      :aria-current="index === current ? 'step' : undefined"
      :aria-disabled="step.disabled"
      role="listitem"
      @click="handleStepClick(index)"
      @keydown="handleStepKeydown(index, $event)"
      :tabindex="!step.disabled && clickable ? 0 : -1"
    >
      <div class="step-header">
        <div class="step-icon-wrapper">
          <div class="step-icon" :aria-label="t('components.navigation.steps.stepLabel', { index: index + 1 })">
            <template v-if="step.icon && index < current">
              <component :is="step.icon" class="step-custom-icon" aria-hidden="true" />
            </template>
            <span v-else-if="index >= current" class="step-number">{{ index + 1 }}</span>
            <svg v-else viewBox="0 0 12 12" fill="currentColor" class="step-check" aria-hidden="true">
              <path d="M2 6L4.5 8.5L10 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div v-if="index < steps.length - 1" class="step-line" aria-hidden="true" />
      </div>
      <div class="step-content">
        <div class="step-title">{{ step.title }}</div>
        <div v-if="step.description" class="step-description">
          {{ step.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

/**
 * 步骤条组件，用于显示操作步骤
 * 
 * @props steps - 步骤数组
 * @props current - 当前步骤索引，默认为 0
 * @props direction - 排列方向，可选 'horizontal' | 'vertical'，默认为 'horizontal'
 * @props size - 尺寸，可选 'sm' | 'md' | 'lg'，默认为 'md'
 * @props customClass - 自定义类名
 * @props clickable - 是否可点击，默认为 true
 * 
 * @emits change - 点击步骤时触发，参数为步骤索引
 * 
 * @usage
 * <Steps
 *   :steps="[
 *     { title: '步骤1', description: '第一步描述' },
 *     { title: '步骤2', description: '第二步描述' },
 *     { title: '步骤3', description: '第三步描述' }
 *   ]"
 *   :modelValue="1"
 *   @change="handleStepChange"
 * />
 */

export interface Step {
  title: string;
  description?: string;
  icon?: string | object | Function;
  disabled?: boolean;
}

export interface Props {
  steps: Step[];
  current?: number;
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  customClass?: string;
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  steps: () => [],
  current: 0,
  direction: 'horizontal',
  size: 'md',
  customClass: '',
  clickable: true,
});

const emit = defineEmits<{
  change: [index: number];
}>();

const stepsClass = computed(() => {
  const classes = ['steps', `steps-${props.direction}`, `steps-${props.size}`];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const handleStepClick = (index: number) => {
  if (props.clickable && index >= 0 && index < props.steps.length && !props.steps[index]?.disabled) {
    emit('change', index);
  }
};

const handleStepKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleStepClick(index);
  }
};
</script>

<style scoped>
/* ===== 基础布局 ===== */
.steps {
  display: flex;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.steps-horizontal {
  flex-direction: row;
  gap: 48px;  /* 增加步骤项之间的间距，拉长连接线 */
}

.steps-vertical {
  flex-direction: column;
}

/* ===== 步骤项基础样式 ===== */
.step {
  display: flex;
  position: relative;
  transition: background-color var(--duration-medium) var(--ease-standard),
              border-color var(--duration-medium) var(--ease-standard);
}

.steps-horizontal .step {
  flex: 1;
  flex-direction: column;
  align-items: center;
  min-width: 20px;  /* 设置最小宽度，确保线条有足够长度 */
}

.steps-vertical .step {
  padding-bottom: 24px;
}

/* 可点击状态 */
.step-clickable {
  cursor: pointer;
}

.step-clickable:hover .step-icon {
  border-color: hsl(var(--primary) / 0.5);
}

/* 禁用状态 */
.step-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.step-disabled:hover {
  transform: none;
}

.step-disabled .step-icon {
  background: hsl(var(--surface-container-high));
  border-color: hsl(var(--border));
  color: hsl(var(--text-muted));
}

/* ===== 步骤头部布局 ===== */
.step-header {
  display: flex;
  align-items: center;
  width: 100%;
}

.steps-horizontal .step-header {
  flex-direction: row;
  justify-content: center;
  position: relative;
}

.steps-vertical .step-header {
  flex-direction: column;
  align-items: flex-start;
}

/* ===== 图标包装器 ===== */
.step-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.steps-horizontal .step-icon-wrapper {
  position: relative;
  z-index: 1;
}

/* ===== 步骤图标 ===== */
.step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: hsl(var(--surface-container-high));
  border: 2px solid hsl(var(--border));
  color: hsl(var(--text-muted));
  font-size: 14px;
  font-weight: 600;
  transition: color var(--duration-slow) var(--ease-standard);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

/* 步骤数字 */
.step-number {
  position: relative;
  z-index: 1;
}

/* 激活状态 */
.step-active .step-icon {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--surface));
}

/* 完成状态 */
.step-finished .step-icon {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--surface));
}

/* 完成图标动画 */
.step-check {
  width: 14px;
  height: 14px;
  position: relative;
  z-index: 1;
  animation: checkIn 0.25s var(--ease-out);
}

@keyframes checkIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ===== 连接线 ===== */
.step-line {
  height: 2px;
  background: hsl(var(--border));
  transition: background-color var(--duration-slow) var(--ease-standard);
  position: relative;
  overflow: hidden;
  pointer-events: none;
  flex: 1;
}

.step-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0;
  background: hsl(var(--primary));
  transition: width 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* 水平方向连接线 - 修复定位，确保左右边距一致 */
.steps-horizontal .step-line {
  position: absolute;
  left: calc(50% + 28px);
  width: calc(100% + 48px - 56px);
  top: 50%;
  transform: translateY(-50%);
  height: 2px;
  flex: none;
  margin: 0;
}

.steps-horizontal .step:last-child .step-line {
  display: none;
}

/* 垂直方向连接线 */
.steps-vertical .step-line {
  width: 2px;
  position: absolute;
  left: 15px;
  top: 40px;
  bottom: 8px;
  height: auto;
  flex: none;
}

/* 完成状态的连接线 */
.step-finished .step-line::after {
  width: 100%;
}

.step-finished .step-line {
  background: hsl(var(--primary) / 0.3);
}

/* ===== 步骤内容区 ===== */
.step-content {
  padding-left: 12px;
}

.steps-vertical .step-content {
  padding-left: 16px;
  padding-top: 4px;
}

.steps-horizontal .step-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 0;
  margin-top: 12px;
  text-align: center;
}

/* ===== 步骤标题 ===== */
.step-title {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
  line-height: 1.5;
  transition: color var(--duration-normal) var(--ease-standard);
}

.step-content:hover .step-title {
  color: hsl(var(--primary));
}

.step-active .step-title {
  color: hsl(var(--primary));
  font-weight: 600;
}

/* ===== 步骤描述 ===== */
.step-description {
  font-size: 13px;
  color: hsl(var(--text-secondary));
  margin-top: 4px;
  line-height: 1.5;
  transition: opacity 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.step-content:hover .step-description {
  opacity: 0.8;
}

/* ===== 尺寸变体 - 小 ===== */
.steps-sm .step-icon {
  width: 28px;
  height: 28px;
  font-size: 12px;
}

.steps-sm .step-title {
  font-size: 13px;
}

.steps-sm .step-description {
  font-size: 12px;
}

.steps-sm .step-content {
  margin-top: 8px;
}

.steps-sm.steps-horizontal {
  gap: 40px;  /* 小尺寸时间距稍小 */
}

.steps-sm.steps-horizontal .step {
  min-width: 20px;
}

.steps-sm.steps-vertical .step {
  padding-bottom: 16px;
}

.steps-sm.steps-vertical .step-line {
  left: 13px;
  top: 36px;
  bottom: 8px;
}

.steps-sm.steps-horizontal .step-line {
  left: calc(50% + 28px);
  width: calc(100% + 40px - 56px);
}

/* ===== 尺寸变体 - 大 ===== */
.steps-lg .step-icon {
  width: 40px;
  height: 40px;
  font-size: 16px;
}

.steps-lg .step-title {
  font-size: 16px;
}

.steps-lg .step-description {
  font-size: 14px;
}

.steps-lg .step-content {
  margin-top: 16px;
}

.steps-lg.steps-horizontal {
  gap: 64px;  /* 大尺寸时间距更大 */
}

.steps-lg.steps-horizontal .step {
  min-width: 20px;
}

.steps-lg.steps-vertical .step {
  padding-bottom: 32px;
}

.steps-lg.steps-vertical .step-line {
  left: 19px;
  top: 52px;
  bottom: 8px;
}

.steps-lg.steps-horizontal .step-line {
  left: calc(50% + 28px);
  width: calc(100% + 64px - 56px);
}

/* ===== 焦点状态（可访问性） ===== */
.step-clickable:focus-visible {
  
  outline-offset: 4px;
  border-radius: 4px;
}

/* ===== 深色模式适配 ===== */
@media (prefers-color-scheme: dark) {
  .step-icon {
    background: hsl(var(--surface));
    border-color: hsl(var(--border));
  }
}

/* ===== 减少动画（可访问性） ===== */
@media (prefers-reduced-motion: reduce) {
  .step,
  .step-icon,
  .step-number,
  .step-title,
  .step-description,
  .step-line,
  .step-line::after {
    transition: none;
    animation: none;
  }
  
  .step-check {
    animation: none;
  }
}

/* ===== 响应式样式 ===== */
@media (max-width: 767.98px) {
  .steps-horizontal {
    gap: 32px;
  }
  
  .steps-horizontal .step-line {
    width: calc(100% + 32px - 56px);
  }
  
  .step-title {
    font-size: 13px;
  }
  
  .step-description {
    font-size: 12px;
  }
}

@media (max-width: 575.98px) {
  .steps-horizontal {
    gap: 24px;
  }
  
  .steps-horizontal .step-line {
    width: calc(100% + 24px - 56px);
  }
  
  .step-icon {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  .step-check {
    width: 12px;
    height: 12px;
  }
  
  .steps-vertical .step-line {
    left: 13px;
  }
  
  .step-content {
    padding-left: 8px;
  }
  
  .steps-vertical .step-content {
    padding-left: 12px;
  }
  
  .steps-horizontal .step-content {
    margin-top: 8px;
  }
  
  .step-title {
    font-size: var(--font-size-sm);
  }
  
  .step-description {
    font-size: 11px;
  }
  
  /* 小尺寸在移动端的调整 */
  .steps-sm.steps-horizontal {
    gap: 20px;
  }
  
  .steps-sm.steps-horizontal .step-line {
    width: calc(100% + 20px - 56px);
  }
  
  /* 大尺寸在移动端的调整 */
  .steps-lg.steps-horizontal {
    gap: 28px;
  }
  
  .steps-lg.steps-horizontal .step-line {
    width: calc(100% + 28px - 56px);
  }
  
  .steps-lg .step-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .steps-lg .step-content {
    margin-top: 12px;
  }
}
</style>
