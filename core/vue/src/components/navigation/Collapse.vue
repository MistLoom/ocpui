<template>
  <div :class="collapseClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';

/**
 * 折叠面板组件，用于显示可折叠的内容区域
 * 
 * @props modelValue - 绑定值，控制展开的面板，支持单个值或数组
 * @props activeKey - 展开的面板键，优先级高于 modelValue
 * @props accordion - 是否为手风琴模式，默认为 false
 * @props customClass - 自定义类名
 * 
 * @emits update:modelValue - 当展开状态变化时触发，更新绑定值
 * @emits update:activeKey - 当展开状态变化时触发，更新 activeKey
 * @emits change - 当展开状态变化时触发，参数为当前展开的键
 * 
 * @usage
 * <Collapse v-model="activeKeys">
 *   <CollapsePanel title="面板1" name="1">内容1</CollapsePanel>
 *   <CollapsePanel title="面板2" name="2">内容2</CollapsePanel>
 * </Collapse>
 */

interface Props {
  modelValue?: string | number | (string | number)[];
  activeKey?: string | number | (string | number)[];
  accordion?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  accordion: false,
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [string | number | (string | number)[]];
  'update:activeKey': [string | number | (string | number)[]];
  'change': [string | number | (string | number)[]];
}>();

// 使用 activeKey 或 modelValue
const currentActiveKey = computed(() =>
  props.activeKey !== undefined ? props.activeKey : props.modelValue,
);

const collapseClass = computed(() => {
  const classes = ['collapse'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

// 检查键是否激活
const isActive = (key: string | number): boolean => {
  const activeKey = currentActiveKey.value;
  if (Array.isArray(activeKey)) {
    return activeKey.includes(key);
  }
  return activeKey === key;
};

// 提供给子组件的方法
const updateActiveKey = (key: string | number) => {
  if (props.accordion) {
    const newValue = isActive(key) ? '' : key;
    emit('update:modelValue', newValue);
    emit('update:activeKey', newValue);
    emit('change', newValue);
  } else {
    const currentValue = Array.isArray(currentActiveKey.value) ? [...currentActiveKey.value] : [];
    const index = currentValue.indexOf(key);
    if (index > -1) {
      currentValue.splice(index, 1);
    } else {
      currentValue.push(key);
    }
    emit('update:modelValue', currentValue);
    emit('update:activeKey', currentValue);
    emit('change', currentValue);
  }
};

// 向子组件提供状态
provide('collapseActiveKey', currentActiveKey);
provide('collapseAccordion', props.accordion);
provide('collapseUpdateActiveKey', updateActiveKey);
provide('collapseIsActive', isActive);
</script>

<style scoped>
.collapse {
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .collapse {
    border-radius: 10px;
  }
}
</style>
