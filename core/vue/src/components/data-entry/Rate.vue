&lt;!--
Rate 组件

功能：评分组件，支持整数和半星评分

属性：
- modelValue: number - 当前评分值
- max: number - 最大评分值
- disabled: boolean - 是否禁用
- allowHalf: boolean - 是否允许半星评分
- showText: boolean - 是否显示评分文本
- texts: string[] - 评分文本数组
- starSize: number - 星星大小
- customClass: string - 自定义类名
- ariaLabel: string - 无障碍标签

事件：
- update:modelValue - 值变化时触发
- change - 值变化时触发
- hover-change - 鼠标悬停时触发

使用方式：
```vue
&lt;Rate v-model="score" :max="5" showText /&gt;

&lt;Rate v-model="score" :max="10" allowHalf /&gt;

&lt;Rate v-model="score" disabled /&gt;
```
--&gt;
<template>
  <div 
    :class="rateClass" 
    v-bind="$attrs"
    role="slider"
    :aria-valuenow="modelValue"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-label="ariaLabel"
    :aria-disabled="disabled"
    tabindex="0"
    @keydown="handleKeyDown"
  >
    <span
      v-for="(_, index) in max"
      :key="index"
      class="rate-star"
      :class="getStarClass(index)"
      @click="handleClick(index)"
      @mouseenter="handleMouseEnter(index)"
      @mouseleave="handleMouseLeave"
      :aria-hidden="true"
    >
      <Icon :name="getStarIcon(index)" :size="resolvedStarSize" />
    </span>
    <span v-if="showText" class="rate-text" aria-live="polite">
      {{ displayText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue';
import Icon from '../utility/Icon.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useComponentSize } from '../composables/useComponentSize';
import type { ComponentSize } from '@ocpui/vue/types';

interface Props {
  modelValue?: number;
  max?: number;
  disabled?: boolean;
  allowHalf?: boolean;
  showText?: boolean;
  texts?: string[];
  size?: ComponentSize;
  starSize?: number;
  customClass?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  max: 5,
  disabled: false,
  allowHalf: false,
  showText: false,
  texts: undefined,
  size: undefined,
  starSize: undefined,
  customClass: '',
  ariaLabel: 'Rating',
});

const { uiT: t } = useUiT();
const resolvedSize = useComponentSize(toRef(props, 'size'));
const resolvedStarSize = computed(() => {
  if (typeof props.starSize === 'number') return props.starSize;
  const map: Record<ComponentSize, number> = { sm: 16, md: 20, lg: 24 };
  return map[resolvedSize.value];
});
const resolvedTexts = computed(() => props.texts ?? [
  t('components.dataEntry.rate.poor'),
  t('components.dataEntry.rate.disappointed'),
  t('components.dataEntry.rate.average'),
  t('components.dataEntry.rate.satisfied'),
  t('components.dataEntry.rate.excellent'),
]);

const emit = defineEmits<{
  'update:modelValue': [value: number];
  'change': [value: number];
  'hover-change': [value: number];
}>();

const hoverValue = ref(0);

const rateClass = computed(() => {
  const classes = ['rate'];
  if (props.disabled) {
    classes.push('rate--disabled');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const currentValue = computed(() => {
  return hoverValue.value || props.modelValue;
});

const displayText = computed(() => {
  if (!props.showText) return '';
  const index = Math.min(Math.ceil(currentValue.value) - 1, resolvedTexts.value.length - 1);
  return resolvedTexts.value[index] || '';
});

const getStarClass = (index: number) => {
  const classes = [];
  const value = currentValue.value;
  const starValue = index + 1;
  
  if (value >= starValue) {
    classes.push('rate-star--full');
  } else if (props.allowHalf && value >= starValue - 0.5) {
    classes.push('rate-star--half');
  } else {
    classes.push('rate-star--empty');
  }
  
  return classes.join(' ');
};

const getStarIcon = (index: number) => {
  const value = currentValue.value;
  const starValue = index + 1;
  
  if (value >= starValue) {
    return 'star-filled';
  } else if (props.allowHalf && value >= starValue - 0.5) {
    return 'star-half';
  } else {
    return 'star';
  }
};

const handleClick = (index: number) => {
  if (props.disabled) return;

  let value = index + 1;
  if (props.allowHalf) {
    const half = index + 0.5;
    const full = index + 1;
    if (props.modelValue === half) value = full;
    else if (props.modelValue === full) value = index;
    else value = half;
  }

  emit('update:modelValue', value);
  emit('change', value);
};

const handleMouseEnter = (index: number) => {
  if (props.disabled) return;
  
  let value = index + 1;
  if (props.allowHalf) {
    value = index + 0.5;
  }
  
  hoverValue.value = value;
  emit('hover-change', value);
};

const handleMouseLeave = () => {
  hoverValue.value = 0;
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  
  let newValue = props.modelValue;
  const step = props.allowHalf ? 0.5 : 1;
  
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      newValue = Math.min(newValue + step, props.max);
      break;
    case 'ArrowLeft':
    case 'ArrowDown':
      newValue = Math.max(newValue - step, 0);
      break;
    case 'Home':
      newValue = 0;
      break;
    case 'End':
      newValue = props.max;
      break;
    default:
      return;
  }
  
  event.preventDefault();
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== undefined) {
      // 确保值在有效范围内
      const clampedValue = Math.max(0, Math.min(newValue, props.max));
      if (clampedValue !== props.modelValue) {
        emit('update:modelValue', clampedValue);
        emit('change', clampedValue);
      }
    }
  }
);
</script>

<style scoped>
.rate {
  display: inline-flex;
  align-items: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.rate-star {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.rate-star:hover {
  transform: scale(1.15);
}

.rate-star:last-child {
  margin-right: 0;
}

.rate-star--full :deep(.icon) {
  color: hsl(var(--warning));
}

.rate-star--half :deep(.icon) {
  color: hsl(var(--warning));
}

.rate-star--empty :deep(.icon) {
  color: hsl(var(--text-muted));
  opacity: 0.55;
}

.rate--disabled .rate-star {
  cursor: not-allowed;
  opacity: 0.5;
}

.rate--disabled .rate-star:hover {
  transform: none;
}

.rate-text {
  margin-left: 8px;
  font-size: 14px;
  color: hsl(var(--text-muted));
}
</style>
