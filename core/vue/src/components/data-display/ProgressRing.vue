&lt;!--
环形进度条组件

Props:
- completed: number - 完成数量
- total: number - 总数量
- size?: number - 尺寸，默认值：80
- strokeWidth?: number - 线宽，默认值：8
- trackColor?: string - 轨道颜色，默认值：'hsl(var(--surface-container-high))'
- showTooltip?: boolean - 是否显示tooltip，默认值：true
- label?: string - 标签
- showDetails?: boolean - 是否显示详情，默认值：true
- strokeLinecap?: 'round' | 'butt' | 'square' - 线帽样式，默认值：'round'
- colorFn?: (percentage: number) =&gt; string - 自定义颜色函数

Slots:
- default - 中心内容插槽
- tooltip - tooltip详情插槽

Usage:
&lt;ProgressRing
  :completed="75"
  :total="100"
  :size="100"
  label="完成度"
/&gt;

&lt;ProgressRing
  :completed="15"
  :total="20"
  :strokeWidth="6"
  :colorFn="(pct) =&gt; pct &gt; 70 ? 'hsl(142, 76%, 36%)' : 'hsl(38, 92%, 50%)'"
&gt;
  &lt;div class="custom-content"&gt;
    &lt;span class="text-sm"&gt;15/20&lt;/span&gt;
  &lt;/div&gt;
&lt;/ProgressRing&gt;
--&gt;
<template>
  <div class="progress-ring" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg
      :width="size"
      :height="size"
      class="progress-ring-svg"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <!-- 背景圆环 -->
      <circle
        class="progress-ring-track"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="trackColor"
        :stroke-width="strokeWidth"
      />
      
      <!-- 进度圆环 -->
      <circle
        class="progress-ring-fill"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        :stroke-linecap="strokeLinecap"
        :transform="`rotate(-90, ${center}, ${center})`"
      />
    </svg>
    
    <!-- 中心内容 -->
    <div class="progress-ring-content">
      <slot>
        <span class="progress-percentage" :style="{ color: progressColor }">
          {{ Math.round(displayPercentage) }}%
        </span>
      </slot>
    </div>
    
    <!-- Tooltip -->
    <Transition name="tooltip">
      <div
        v-if="showTooltip && isHovered"
        class="progress-ring-tooltip"
      >
        <div v-if="label" class="tooltip-label">{{ label }}</div>
        <div class="tooltip-value" :style="{ color: progressColor }">
          {{ Math.round(displayPercentage) }}%
        </div>
        <div v-if="showDetails" class="tooltip-details">
          <slot name="tooltip">
            <span>{{ completed }} / {{ total }}</span>
          </slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTweenedValue } from '../../composables/useTweenedValue';

export interface ProgressRingProps {
  /** 完成数量 */
  completed: number;
  /** 总数量 */
  total: number;
  /** 尺寸 */
  size?: number;
  /** 线宽 */
  strokeWidth?: number;
  /** 轨道颜色 */
  trackColor?: string;
  /** 是否显示tooltip */
  showTooltip?: boolean;
  /** 标签 */
  label?: string;
  /** 是否显示详情 */
  showDetails?: boolean;
  /** 线帽样式 */
  strokeLinecap?: 'round' | 'butt' | 'square';
  /** 自定义颜色函数 */
  colorFn?: (percentage: number) => string;
}

const props = withDefaults(defineProps<ProgressRingProps>(), {
  size: 80,
  strokeWidth: 8,
  trackColor: 'hsl(var(--surface-container-high))',
  showTooltip: true,
  label: '',
  showDetails: true,
  strokeLinecap: 'round',
  colorFn: undefined,
});

// 悬停状态
const isHovered = ref(false);

// 计算中心点和半径
const center = computed(() => props.size / 2);
const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);

// 计算百分比
const percentage = computed(() => {
  if (props.total === 0) return 0;
  return Math.min(100, Math.max(0, (props.completed / props.total) * 100));
});

// 百分比补间：统一 rAF 生命周期（挂载从 0 动到目标，SSR 渲染 0 与首帧一致）
const { value: animatedPercentage } = useTweenedValue(percentage, {
  initial: 0,
  duration: 600,
  easing: 'easeOutQuart',
  animateOnMount: true,
});

// 显示百分比（动画值）
const displayPercentage = computed(() => animatedPercentage.value);

// 计算stroke-dashoffset
const strokeDashoffset = computed(() => {
  return circumference.value - (animatedPercentage.value / 100) * circumference.value;
});

// 计算颜色
const progressColor = computed(() => {
  if (props.colorFn) {
    return props.colorFn(percentage.value);
  }
  // 默认颜色
  const pct = percentage.value;
  if (pct < 50) return 'hsl(0, 84%, 60%)';
  if (pct < 80) return 'hsl(38, 92%, 50%)';
  return 'hsl(142, 76%, 36%)';
});
</script>

<style scoped>
.progress-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.progress-ring-svg {
  transform: rotate(-90deg);
  transform-origin: center;
}

.progress-ring-track {
  transition: stroke 0.3s ease;
}

.progress-ring-fill {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.22, 0.61, 0.36, 1), stroke 0.3s ease;
}

.progress-ring-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.progress-percentage {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  transition: color 0.3s ease;
}

/* Tooltip */
.progress-ring-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: var(--shadow-sm);
  pointer-events: none;
  z-index: 100;
  min-width: 80px;
  text-align: center;
}

.tooltip-label {
  font-size: 11px;
  color: hsl(var(--text-secondary));
  margin-bottom: 4px;
}

.tooltip-value {
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.tooltip-details {
  font-size: 10px;
  color: hsl(var(--text-muted));
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid hsl(var(--border));
}

/* Tooltip动画 */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}
</style>
