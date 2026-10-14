&lt;!--
SearchHistory 搜索历史组件

## 组件说明
用于显示和管理搜索历史记录，支持选择、删除和清除操作。

## 公开属性
- history: string[] - 搜索历史数组
- title: string - 组件标题，默认为 '最近搜索'
- emptyText: string - 空状态文本，默认为 '暂无搜索历史'
- maxItems: number - 最大显示数量，默认为 10

## 事件
- select: 选择历史项时触发，参数为选中的历史项
- delete: 删除历史项时触发，参数为 (item, index)
- clear: 清除全部历史时触发

## 使用方式
```vue
&lt;SearchHistory
  :history="searchHistory"
  @select="handleHistorySelect"
  @delete="handleHistoryDelete"
  @clear="handleHistoryClear"
/&gt;
```
--&gt;

<template>
  <div class="search-history">
    <div class="search-history-header">
      <span class="search-history-title">{{ displayTitle }}</span>
      <Button
        v-if="displayHistory.length > 0"
        variant="text"
        size="sm"
        @click="handleClear"
      >
        {{ t('components.interaction.searchHistory.clearAll') }}
      </Button>
    </div>
    
    <div v-if="displayHistory.length === 0" class="search-history-empty">
      {{ displayEmptyText }}
    </div>
    
    <div v-else class="search-history-list">
      <div
        v-for="(item, index) in displayHistory"
        :key="index"
        class="search-history-item"
        @click="handleSelect(item)"
        @keydown.enter="handleSelect(item)"
        @keydown.delete="handleDelete(item, index)"
        tabindex="0"
      >
        <Icon name="clock" :size="14" class="search-history-icon" />
        <span class="search-history-text">{{ item }}</span>
        <button
          class="search-history-delete"
          @click.stop="handleDelete(item, index)"
          :title="t('components.interaction.searchHistory.delete')"
        >
          <Icon name="x" :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Button, Icon } from '../utility';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

export interface SearchHistoryProps {
  history?: string[];
  title?: string;
  emptyText?: string;
  maxItems?: number;
}

const props = withDefaults(defineProps<SearchHistoryProps>(), {
  history: () => [],
  title: '',
  emptyText: '',
  maxItems: 10,
});

const emit = defineEmits<{
  select: [item: string];
  delete: [item: string, index: number];
  clear: [];
}>();

// 限制显示的历史记录数量
const displayHistory = computed(() => {
  return props.history.slice(0, props.maxItems);
});

const displayTitle = computed(() => props.title || t('components.interaction.searchHistory.defaultTitle'));
const displayEmptyText = computed(() => props.emptyText || t('components.interaction.searchHistory.defaultEmptyText'));

const handleSelect = (item: string) => {
  emit('select', item);
};

const handleDelete = (item: string, index: number) => {
  emit('delete', item, index);
};

const handleClear = () => {
  emit('clear');
};
</script>

<style scoped>
.search-history {
  display: flex;
  flex-direction: column;
}

.search-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid hsl(var(--border) / 0.5);
}

.search-history-title {
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--text-muted));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.search-history-empty {
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: hsl(var(--text-muted));
}

.search-history-list {
  display: flex;
  flex-direction: column;
}

.search-history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.search-history-item:hover {
  background: hsl(var(--surface-hover));
}

.search-history-icon {
  color: hsl(var(--text-muted));
  flex-shrink: 0;
}

.search-history-text {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-history-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: hsl(var(--text-muted));
  cursor: pointer;
  opacity: 0;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.search-history-item:hover .search-history-delete {
  opacity: 1;
}

.search-history-delete:hover {
  background: hsl(var(--error) / 0.1);
  color: hsl(var(--error));
}
</style>
