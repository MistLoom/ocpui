&lt;!--
进度条组件

Props:
- percent: number - 进度百分比，默认值：0
- type?: 'line' | 'circle' - 进度条类型，默认值：'line'
- status?: 'default' | 'success' | 'error' | 'warning' - 进度条状态，默认值：'default'
- size?: 'sm' | 'md' | 'lg' - 进度条大小，默认值：'md'
- strokeWidth?: number - 进度条宽度，默认值：8
- showInfo?: boolean - 是否显示信息，默认值：true
- showText?: boolean - 是否显示文本，默认值：false
- textInside?: boolean - 文本是否在内部，默认值：false
- infoPosition?: 'top' | 'right' | 'bottom' - 信息位置，默认值：'right'
- label?: string - 进度条标签
- color?: string - 进度条颜色
- customClass?: string - 自定义类名
- dynamicThresholds?: Array&lt;{ threshold: number; status: 'success' | 'warning' | 'error' }&gt; - 动态颜色阈值配置，默认值：[{ threshold: 70, status: 'success' }, { threshold: 85, status: 'warning' }, { threshold: 100, status: 'error' }]
- dynamicColor?: boolean - 是否启用动态颜色，默认值：false

Usage:
&lt;Progress
  :percent="75"
  :status="'success'"
  :size="'md'"
  :showInfo="true"
  label="完成度"
/&gt;

&lt;Progress
  :percent="85"
  :dynamicColor="true"
  :showText="true"
  :textInside="true"
/&gt;
--&gt;
<template>
  <div :class="progressClass">
    <div
      v-if="showInfo && infoPosition === 'top'"
      class="progress-info progress-info-top"
    >
      <span v-if="label" class="progress-label">{{ label }}</span>
      <span class="progress-text">{{ displayPercent }}%</span>
    </div>
    <div class="progress-outer">
      <div class="progress-inner" :style="innerStyle">
        <div
          class="progress-bar"
          :class="progressBarClass"
          :style="barStyle"
        >
          <span
            v-if="showText && textInside"
            class="progress-text-inside"
          >
            {{ displayPercent }}%
          </span>
        </div>
      </div>
    </div>
    <div
      v-if="showInfo && infoPosition === 'right'"
      class="progress-info progress-info-right"
    >
      <span v-if="label" class="progress-label">{{ label }}</span>
      <span class="progress-text">{{ displayPercent }}%</span>
    </div>
    <div
      v-if="showInfo && infoPosition === 'bottom'"
      class="progress-info progress-info-bottom"
    >
      <span v-if="label" class="progress-label">{{ label }}</span>
      <span class="progress-text">{{ displayPercent }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  percent: number;
  type?: 'line' | 'circle';
  status?: 'default' | 'success' | 'error' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  strokeWidth?: number;
  showInfo?: boolean;
  showText?: boolean;
  textInside?: boolean;
  infoPosition?: 'top' | 'right' | 'bottom';
  label?: string;
  color?: string;
  customClass?: string;
  /**
   * 动态颜色阈值配置
   * 根据百分比自动计算颜色
   * 例如: [{ threshold: 70, status: 'success' }, { threshold: 85, status: 'warning' }, { threshold: 100, status: 'error' }]
   */
  dynamicThresholds?: Array<{ threshold: number; status: 'success' | 'warning' | 'error' }>;
  /**
   * 是否启用动态颜色
   */
  dynamicColor?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  percent: 0,
  type: 'line',
  status: 'default',
  size: 'md',
  strokeWidth: 8,
  showInfo: true,
  showText: false,
  textInside: false,
  infoPosition: 'right',
  label: '',
  color: '',
  customClass: '',
  dynamicThresholds: () => [
    { threshold: 70, status: 'success' },
    { threshold: 85, status: 'warning' },
    { threshold: 100, status: 'error' },
  ],
  dynamicColor: false,
});

// 计算动态状态
const computedStatus = computed(() => {
  if (!props.dynamicColor || props.status !== 'default') {
    return props.status;
  }
  
  const percent = Math.min(100, Math.max(0, props.percent));
  
  // 按阈值排序并找到对应状态
  const sortedThresholds = [...props.dynamicThresholds].sort((a, b) => a.threshold - b.threshold);
  
  for (const item of sortedThresholds) {
    if (percent <= item.threshold) {
      return item.status;
    }
  }
  
  return 'error';
});

const progressClass = computed(() => {
  const classes = ['progress', `progress-${props.type}`, `progress-${props.size}`];
  const status = computedStatus.value;
  if (status !== 'default') {
    classes.push(`progress-${status}`);
  }
  if (props.showText && props.textInside) {
    classes.push('show-text-inside');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const progressBarClass = computed(() => {
  const classes = [];
  const status = computedStatus.value;
  if (status !== 'default') {
    classes.push(`progress-bar-${status}`);
  }
  return classes.join(' ');
});

const innerStyle = computed(() => {
  if (props.type === 'circle') {
    return {
      width: `${props.strokeWidth}px`,
      height: `${props.strokeWidth}px`,
    };
  }
  return {
    height: `${props.strokeWidth}px`,
  };
});

const barStyle = computed(() => {
  const style: Record<string, string> = {
    width: `${Math.min(100, Math.max(0, props.percent))}%`,
  };
  if (props.color) {
    style.background = props.color;
  }
  return style;
});

const displayPercent = computed(() => {
  return Math.min(100, Math.max(0, Math.round(props.percent)));
});
</script>

<script lang="ts">
export default { name: 'Progress' };
</script>

<style scoped>
.progress {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.progress-line {
  flex-direction: row;
}

.progress-line.progress-info-top,
.progress-line.progress-info-bottom {
  flex-direction: column;
  align-items: stretch;
}

.progress-outer {
  flex: 1;
  overflow: hidden;
}

.progress-inner {
  background: hsl(var(--surface-container-high));
  border-radius: 10px;
  overflow: hidden;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.progress-bar {
  height: 100%;
  background: hsl(var(--primary));
  border-radius: 10px;
  transition: width 0.6s cubic-bezier(0.22, 0.61, 0.36, 1), background-color 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  position: relative;
}

.progress-bar-success {
  background: hsl(var(--success));
}

.progress-bar-error {
  background: hsl(var(--error));
}

.progress-bar-warning {
  background: hsl(var(--warning));
}

.progress-text-inside {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--primary-foreground));
  white-space: nowrap;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-info-top,
.progress-info-bottom {
  justify-content: space-between;
}

.progress-info-right {
  flex-direction: column;
  align-items: flex-end;
  min-width: 50px;
}

.progress-label {
  font-size: 13px;
  color: hsl(var(--text-secondary));
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--text));
  transition: color 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.progress-sm .progress-inner {
  height: 4px !important;
}

.progress-sm .progress-text {
  font-size: 12px;
}

.progress-sm .progress-text-inside {
  display: none;
}

/* 当显示内部文字时的高度调整 */
.progress-line.show-text-inside .progress-inner {
  height: auto !important;
  min-height: 20px;
}

.progress-line.show-text-inside.progress-md .progress-inner {
  min-height: 20px;
}

.progress-line.show-text-inside.progress-lg .progress-inner {
  min-height: 24px;
}

.progress-line.show-text-inside .progress-bar {
  display: flex;
  align-items: center;
  min-height: 20px;
}

.progress-line.show-text-inside.progress-lg .progress-bar {
  min-height: 24px;
}

.progress-lg .progress-text-inside {
  font-size: 14px;
}

.progress-success .progress-text {
  color: hsl(var(--success));
}

.progress-error .progress-text {
  color: hsl(var(--error));
}

.progress-warning .progress-text {
  color: hsl(var(--warning));
}
</style>
