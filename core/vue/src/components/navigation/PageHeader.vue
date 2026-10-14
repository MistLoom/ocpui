<template>
  <div :class="pageHeaderClass" v-bind="$attrs">
    <button v-if="hasBack" type="button" class="page-header-back" @click="handleBack">
      <slot name="back">
        <Icon name="arrow-left" :size="16" />
        <span class="page-header-back-text">{{ backText }}</span>
      </slot>
    </button>
    
    <div class="page-header-content">
      <div v-if="title || $slots.title" class="page-header-title">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
      
      <div v-if="subtitle || $slots.subtitle" class="page-header-subtitle">
        <slot name="subtitle">
          {{ subtitle }}
        </slot>
      </div>
      
      <div v-if="$slots.content" class="page-header-body">
        <slot name="content" />
      </div>
    </div>
    
    <div v-if="$slots.extra" class="page-header-extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { Icon } from '../utility';

/**
 * 页面头部组件，用于显示页面标题和相关操作
 * 
 * @props title - 页面标题
 * @props subtitle - 页面副标题
 * @props backText - 返回按钮文本，默认为 '返回'
 * @props showBack - 是否显示返回按钮，默认为 false
 * @props customClass - 自定义类名
 * 
 * @emits back - 点击返回按钮时触发
 * 
 * @slots back - 返回按钮内容
 * @slots title - 标题内容
 * @slots subtitle - 副标题内容
 * @slots content - 额外内容
 * @slots extra - 右侧额外操作区
 */

interface Props {
  title?: string;
  subtitle?: string;
  backText?: string;
  showBack?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  backText: '返回',
  showBack: false,
  customClass: '',
});

const emit = defineEmits<{
  'back': [];
}>();

const slots = useSlots();

const hasBack = computed(() => {
  return props.showBack || slots.back;
});

const pageHeaderClass = computed(() => {
  const classes = ['page-header'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const handleBack = () => {
  emit('back');
};

</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.page-header-back {
  display: flex;
  align-items: center;
  margin-right: 16px;
  padding: 8px 12px;
  font-size: 14px;
  color: hsl(var(--text-muted));
  cursor: pointer;
  border-radius: 8px;
  transition:
    color var(--duration-normal) var(--ease-standard),
    background-color var(--duration-normal) var(--ease-standard);
  border: none;
  background: transparent;
}

.page-header-back:hover {
  color: hsl(var(--primary));
  background: hsl(var(--surface-hover));
}

.page-header-back-text {
  margin-left: 4px;
}

.page-header-content {
  flex: 1;
  min-width: 0;
}

.page-header-title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 600;
  color: hsl(var(--text));
  line-height: 1.4;
  text-wrap: balance;
}

.page-header-subtitle {
  margin: 6px 0 0;
  max-width: 40rem;
  font-size: 0.875rem;
  color: hsl(var(--text-muted));
  line-height: 1.5;
}

.page-header-body {
  margin-top: 12px;
  font-size: 14px;
  color: hsl(var(--text));
  line-height: 1.6;
}

.page-header-extra {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
</style>
