<!--
风险徽章组件

Props:
- level: 'critical' | 'high' | 'medium' | 'low' | 'info' - 风险级别
- size?: 'sm' | 'md' - 徽章尺寸，默认值：'md'
- customClass?: string - 自定义类名

Usage:
<RiskBadge level="critical" />
<RiskBadge level="high" size="sm" />
<RiskBadge level="medium" />
<RiskBadge level="low" />
<RiskBadge level="info" />
-->
<template>
  <span :class="badgeClass" :style="badgeStyle">
    {{ displayText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

interface Props {
  level: RiskLevel;
  size?: 'sm' | 'md';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  customClass: '',
});

// 风险级别配置
const riskConfig: Record<RiskLevel, { text: string; color: string; bgColor: string }> = {
  critical: {
    text: '严重',
    color: 'hsl(var(--error))',
    bgColor: 'hsl(var(--error) / 0.12)',
  },
  high: {
    text: '高危',
    color: 'hsl(var(--warning))',
    bgColor: 'hsl(var(--warning) / 0.12)',
  },
  medium: {
    text: '中危',
    color: 'hsl(var(--warning))',
    bgColor: 'hsl(var(--warning) / 0.12)',
  },
  low: {
    text: '低危',
    color: 'hsl(var(--success))',
    bgColor: 'hsl(var(--success) / 0.12)',
  },
  info: {
    text: '信息',
    color: 'hsl(var(--info))',
    bgColor: 'hsl(var(--info) / 0.12)',
  },
};

const config = computed(() => riskConfig[props.level]);

const displayText = computed(() => config.value.text);

const badgeClass = computed(() => {
  const classes: string[] = ['risk-badge'];
  classes.push(`risk-badge-${props.size}`);
  classes.push(`risk-badge-${props.level}`);
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const badgeStyle = computed(() => ({
  color: config.value.color,
  backgroundColor: config.value.bgColor,
}));
</script>

<script lang="ts">
export default { name: 'RiskBadge' };
</script>

<style scoped>
.risk-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 尺寸 */
.risk-badge-sm {
  height: 20px;
  padding: 0 8px;
  font-size: 12px;
}

.risk-badge-md {
  height: 24px;
  padding: 0 12px;
  font-size: 13px;
}
</style>
