<!--
Icon 组件
功能：统一图标入口，优先解析 lucide-vue-next；仅 svg 属性用于自定义图形。

公开属性：
- name: string - 图标名称（kebab / PascalCase；与 svg 二选一）
- svg: string - 自定义 SVG 字符串（优先级更高）
- size: IconSize | number - xs–3xl 或像素
- color: IconColor - 语义色
- spin: boolean - 旋转动画
- rotate: number - 旋转角度
- customClass: string - 自定义类名
-->

<template>
  <span
    v-if="lucideComponent || svgContent"
    :class="iconClass"
    :style="iconStyle"
    v-bind="$attrs"
  >
    <component
      v-if="lucideComponent"
      :is="lucideComponent"
      :size="pixelSize"
      color="currentColor"
      :fill="filled ? 'currentColor' : 'none'"
    />
    <span v-else class="icon-raw" v-html="svgContent" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { isFilledIconName, resolveLucideIcon } from './resolve-icon';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
type IconColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default' | 'muted';

interface Props {
  name?: string;
  svg?: string;
  size?: IconSize | number;
  color?: IconColor;
  spin?: boolean;
  rotate?: number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  svg: '',
  size: 'md',
  color: 'default',
  spin: false,
  rotate: 0,
  customClass: '',
});

const sizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

const colorMap: Record<IconColor, string> = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--text-secondary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  error: 'hsl(var(--error))',
  info: 'hsl(var(--primary))',
  default: 'hsl(var(--text))',
  muted: 'hsl(var(--text-muted))',
};

const pixelSize = computed(() => {
  let size = props.size;
  if (typeof size === 'string') {
    if (sizeMap[size as IconSize]) {
      size = sizeMap[size as IconSize];
    } else if (!Number.isNaN(Number(size))) {
      size = Number(size);
    } else {
      size = sizeMap.md;
    }
  }
  return size as number;
});

const lucideComponent = computed(() => {
  if (props.svg || !props.name) return null;
  const resolved = resolveLucideIcon(props.name);
  if (!resolved && import.meta.env.DEV) {
    console.warn(`[Icon] 未定义的图标名: "${props.name}"`);
  }
  return resolved;
});

const filled = computed(() => Boolean(props.name) && isFilledIconName(props.name));

const svgContent = computed(() => props.svg || '');

const iconClass = computed(() => {
  const classes = ['icon'];
  if (filled.value) classes.push('icon--filled');
  if (props.spin) classes.push('icon--spin');
  if (props.customClass) classes.push(props.customClass);
  return classes.join(' ');
});

const iconStyle = computed(() => {
  const style: Record<string, string> = {
    width: `${pixelSize.value}px`,
    height: `${pixelSize.value}px`,
  };

  if (props.color !== 'default') {
    style.color = colorMap[props.color];
  }

  if (props.rotate) {
    style.transform = `rotate(${props.rotate}deg)`;
  }

  return style;
});
</script>

<style>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  flex-shrink: 0;
  color: inherit;
  transition: color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1),
              transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1),
              opacity 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.icon svg,
.icon-raw,
.icon-raw svg {
  width: 100%;
  height: 100%;
  display: block;
  color: inherit;
}

/* Lucide 默认 fill="none"；若 fill 被抹掉，SVG 会按规范填成黑色 */
.icon:not(.icon--filled) svg {
  fill: none;
  stroke: currentColor;
}

.icon--filled svg {
  fill: currentColor;
  stroke: none;
}

.icon--spin {
  animation: icon-spin 1s linear infinite;
}

@keyframes icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
