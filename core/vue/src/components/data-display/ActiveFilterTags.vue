&lt;!--
活动过滤标签组件

职责：展示已生效筛选条件（Tag + 清除），仅负责行内 label ↔ chips 对齐。
对外 margin / padding 由容器（AdminPage #toolbar、筛选区 Stack）承担。

Props:
- filters: ActiveFilter[] - 过滤标签列表
- size: sm | md | lg - 与 FilterTagGroup / SizeScope 对齐
- showLabel: boolean - 是否显示「当前筛选」标签
- label: string - 覆盖默认 label 文案

Events:
- remove: (filter: ActiveFilter) - 移除单个过滤标签
- clearAll: [] - 清除所有过滤标签

Slots:
- label - 自定义行首标签

Usage:
&lt;ActiveFilterTags
  :filters="activeFilters"
  @remove="handleRemoveFilter"
  @clearAll="handleClearAllFilters"
/&gt;
--&gt;
<template>
  <div v-if="filters.length > 0" :class="rootClass">
    <span v-if="showLabel" class="ocp-filter-row__label">
      <slot name="label">{{ resolvedLabel }}</slot>
    </span>
    <div class="ocp-filter-row__controls">
      <Tag
        v-for="filter in filters"
        :key="filter.key"
        variant="primary"
        :size="tagSize"
        closable
        @close="handleRemove(filter)"
      >
        <template #icon>
          <Icon :name="filter.icon || 'filter'" :size="tagIconSize" />
        </template>
        {{ filter.label }}: {{ filter.valueLabel }}
      </Tag>
      <button
        type="button"
        class="ocp-filter-row__clear"
        @click="handleClearAll"
      >
        <Icon name="x" :size="tagIconSize" />
        {{ t('components.dataDisplay.activeFilterTags.clearAll') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import Tag from './Tag.vue';
import { Icon } from '../utility';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useComponentSize } from '../composables/useComponentSize';
import type { ComponentSize, TagSize } from '@ocpui/vue/types';
import type { ActiveFilter } from '../types/filter';

const { uiT: t } = useUiT();

interface Props {
  filters: ActiveFilter[];
  size?: ComponentSize;
  showLabel?: boolean;
  label?: string;
  customClass?: string;
  block?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: undefined,
  showLabel: true,
  label: '',
  customClass: '',
  block: false,
});

const emit = defineEmits<{
  'remove': [filter: ActiveFilter];
  'clearAll': [];
}>();

const resolvedSize = useComponentSize(toRef(props, 'size'));

const resolvedLabel = computed(
  () => props.label || t('components.dataDisplay.activeFilterTags.currentFilters'),
);

const tagSize = computed((): TagSize => {
  if (resolvedSize.value === 'lg') return 'lg';
  if (resolvedSize.value === 'sm') return 'sm';
  return 'sm';
});

const tagIconSize = computed(() => (resolvedSize.value === 'lg' ? 14 : 12));

const rootClass = computed(() => {
  const classes = [
    'ocp-filter-row',
    'active-filter-tags',
    `ocp-filter-row--${resolvedSize.value}`,
    `active-filter-tags--${resolvedSize.value}`,
  ];
  if (props.showLabel) classes.push('ocp-filter-row--labeled');
  if (props.block) classes.push('ocp-filter-row--block');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const handleRemove = (filter: ActiveFilter) => {
  emit('remove', filter);
};

const handleClearAll = () => {
  emit('clearAll');
};
</script>

<style scoped>
/* 组件仅保留语义钩子；布局与 pill 尺寸见 themes/filter-row.css */
.active-filter-tags {
  /* 禁止对外 margin / padding，避免容器居中与栅格失准 */
}
</style>
