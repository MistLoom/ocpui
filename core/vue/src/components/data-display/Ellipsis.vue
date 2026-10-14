<!--
Ellipsis 文本省略组件

## 组件说明
文本省略组件，用于处理文本溢出显示省略号的情况，支持多行省略和展开功能

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| rows | number | 1 | 显示的行数 |
| expandable | boolean | false | 是否可展开 |
| tooltip | boolean \| 'hover' \| 'always' | 'hover' | 提示方式 |
| customClass | string | '' | 自定义类名 |

## 事件
| 事件名 | 参数 | 说明 |
|-------|------|------|
| expand | expanded: boolean | 展开状态变化事件 |

## 暴露方法
| 方法名 | 说明 |
|-------|------|
| refresh | 刷新省略状态 |
| isOverflowing | 是否溢出 |

## 使用示例
```vue
<template>
  <Ellipsis :rows="2" :expandable="true" tooltip="hover">
    这是一段很长的文本，当超过指定行数时会显示省略号，并且可以点击展开查看完整内容。
  </Ellipsis>
</template>

<script setup lang="ts">
import Ellipsis from './Ellipsis.vue';
</script>
```
-->
<template>
  <div :class="ellipsisClass" v-bind="$attrs">
    <span 
      ref="textRef" 
      class="ellipsis-text"
      :style="textStyle"
    >
      <slot />
    </span>
    
    <!-- 展开/收起按钮 -->
    <button
      v-if="expandable && isOverflowing"
      class="ellipsis-expand-btn"
      @click="toggleExpand"
      type="button"
    >
      {{ expanded ? t('components.dataDisplay.ellipsis.collapse') : t('components.dataDisplay.ellipsis.expand') }}
    </button>
    
    <!-- 工具提示 -->
    <div v-if="showTooltip && isOverflowing && !expanded" class="ellipsis-tooltip">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface Props {
  rows?: number;
  expandable?: boolean;
  tooltip?: boolean | 'hover' | 'always';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  rows: 1,
  expandable: false,
  tooltip: 'hover',
  customClass: '',
});

const emit = defineEmits<{
  'expand': [expanded: boolean];
}>();

const textRef = ref<HTMLElement>();
const isOverflowing = ref(false);
const expanded = ref(false);

const showTooltip = computed(() => {
  return props.tooltip === 'always' || (props.tooltip === 'hover' && isOverflowing.value);
});

const ellipsisClass = computed(() => {
  const classes = ['ellipsis'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  if (expanded.value) {
    classes.push('ellipsis--expanded');
  }
  return classes.join(' ');
});

const textStyle = computed(() => {
  if (expanded.value) {
    return {};
  }
  
  const style: Record<string, string> = {};
  
  if (props.rows === 1) {
    style.whiteSpace = 'nowrap';
    style.overflow = 'hidden';
    style.textOverflow = 'ellipsis';
  } else {
    style.display = '-webkit-box';
    style.webkitBoxOrient = 'vertical';
    style.webkitLineClamp = props.rows.toString();
    style.overflow = 'hidden';
    style.textOverflow = 'ellipsis';
  }
  
  return style;
});

const toggleExpand = () => {
  expanded.value = !expanded.value;
  emit('expand', expanded.value);
};

const checkOverflow = () => {
  if (!textRef.value) return;

  if (props.rows === 1) {
    isOverflowing.value = textRef.value.scrollWidth > textRef.value.clientWidth;
  } else {
    isOverflowing.value = textRef.value.scrollHeight > textRef.value.clientHeight;
  }
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  nextTick(() => {
    checkOverflow();
    if (textRef.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        nextTick(checkOverflow);
      });
      resizeObserver.observe(textRef.value);
    }
  });
  window.addEventListener('resize', checkOverflow);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  window.removeEventListener('resize', checkOverflow);
});

watch(
  () => [props.rows, expanded.value],
  () => {
    nextTick(checkOverflow);
  }
);

const refresh = () => {
  checkOverflow();
};

defineExpose({
  refresh,
  isOverflowing,
});
</script>

<style scoped>
.ellipsis {
  position: relative;
  display: inline-block;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  max-width: 100%;
  min-width: 0;
}

.ellipsis-text {
  display: inline-block;
  max-width: 100%;
  min-width: 0;
}

.ellipsis--expanded .ellipsis-text {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  -webkit-line-clamp: unset;
}

/* 展开/收起按钮 */
.ellipsis-expand-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  margin-left: 8px;
  background: transparent;
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  font-size: 12px;
  color: hsl(var(--primary));
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  line-height: 1.2;
  vertical-align: middle;
}

.ellipsis-expand-btn:hover {
  background: hsl(var(--primary) / 0.05);
  border-color: hsl(var(--primary));
}

/* 工具提示 */
.ellipsis-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: var(--z-tooltip);
  max-width: 300px;
  padding: 8px 12px;
  margin-top: 4px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  box-shadow: 0 4px 16px hsl(var(--shadow));
  font-size: 13px;
  color: hsl(var(--text));
  line-height: 1.5;
  white-space: normal;
  word-wrap: break-word;
  opacity: 0;
  visibility: hidden;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  pointer-events: none;
}

.ellipsis:hover .ellipsis-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(4px);
}
</style>
