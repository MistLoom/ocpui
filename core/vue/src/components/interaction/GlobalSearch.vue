&lt;!--
GlobalSearch 全局搜索组件

## 组件说明
用于创建全局搜索功能，支持搜索历史、分类筛选、键盘导航等功能。

## 公开属性
- placeholder: string - 搜索输入框占位符，默认为 '搜索...'
- results: SearchResult[] - 搜索结果数组
- categories: SearchCategory[] - 搜索分类数组
- history: string[] - 搜索历史数组
- loading: boolean - 加载状态，默认为 false
- maxHistory: number - 最大历史记录数量，默认为 10

## 事件
- search: 搜索时触发，参数为搜索关键词
- select: 选择搜索结果时触发，参数为选中的结果
- history-change: 历史记录变化时触发，参数为历史记录数组

## 暴露方法
- open: 打开搜索面板
- close: 关闭搜索面板
- search: 执行搜索，参数为搜索关键词

## 使用方式
```vue
&lt;GlobalSearch
  :results="searchResults"
  :categories="searchCategories"
  :history="searchHistory"
  @search="handleSearch"
  @select="handleSelect"
  @history-change="handleHistoryChange"
/&gt;
```

## 搜索结果类型
```typescript
interface SearchResult {
  id: string;           // 结果唯一标识
  title: string;        // 结果标题
  description?: string;  // 结果描述
  category: string;      // 结果分类
  icon?: string;         // 结果图标
}

interface SearchCategory {
  key: string;          // 分类键
  label: string;        // 分类标签
  count: number;        // 分类结果数量
}
```
--&gt;

<template>
  <div class="global-search">
    <!-- 搜索输入框 -->
    <button type="button" class="global-search-trigger" :aria-label="t('components.interaction.globalSearch.openSearch')" @click="openSearch">
      <slot name="trigger">
        <div class="search-trigger-content">
          <Icon name="search" :size="18" />
          <span class="search-trigger-text">{{ displayPlaceholder }}</span>
          <ShortcutLabel shortcut="Ctrl+K" size="sm" />
        </div>
      </slot>
    </button>

    <!-- 搜索面板 -->
    <Teleport to="body">
      <Transition name="global-search">
        <div ref="panelRef" v-if="visible" v-bind="overlayDispatch" class="global-search-panel" @click="handleOverlayClick">
          <div class="global-search-content" @click.stop>
            <!-- 搜索头部 -->
            <div class="global-search-header">
              <div class="global-search-input-wrapper">
                <Icon name="search" :size="20" class="global-search-icon" />
                <input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  type="text"
                  class="global-search-input"
                  :placeholder="displayPlaceholder"
                  @keydown.esc="closeSearch"
                  @keydown.enter="handleSearch"
                  @keydown.down.prevent="navigateResults(1)"
                  @keydown.up.prevent="navigateResults(-1)"
                  @input="handleInput"
                />
                <button
                  v-if="searchQuery"
                  type="button"
                  class="global-search-clear"
                  @click="clearSearch"
                >
                  <Icon name="x" :size="16" />
                </button>
              </div>
              <button type="button" class="global-search-close" @click="closeSearch">
                <Icon name="x" :size="20" />
              </button>
            </div>

            <!-- 搜索内容 -->
            <div class="global-search-body">
              <!-- 加载状态 -->
              <div v-if="loading" class="global-search-loading">
                <div class="loading-spinner" />
                <span>{{ t('components.interaction.globalSearch.searching') }}</span>
              </div>

              <!-- 搜索历史 -->
              <SearchHistory
                v-else-if="!searchQuery && searchHistory.length > 0"
                :history="searchHistory"
                @select="handleHistorySelect"
                @delete="handleHistoryDelete"
                @clear="handleHistoryClear"
              />

              <!-- 搜索结果 -->
              <template v-else-if="searchQuery">
                <!-- 分类标签 -->
                <div v-if="categories.length > 0" class="global-search-categories">
                  <Tag
                    v-for="cat in categories"
                    :key="cat.key"
                    :variant="activeCategory === cat.key ? 'primary' : 'default'"
                    size="sm"
                    clickable
                    @click="activeCategory = cat.key"
                  >
                    {{ cat.label }} ({{ cat.count }})
                  </Tag>
                </div>

                <!-- 结果列表 -->
                <div v-if="filteredResults.length > 0" class="global-search-results">
                  <div
                    v-for="(result, index) in filteredResults"
                    :key="result.id"
                    :class="resultClass(index)"
                    @click="handleResultClick(result)"
                    @mouseenter="selectedIndex = index"
                  >
                    <div v-if="result.icon" class="result-icon">
                      <component :is="result.icon" />
                    </div>
                    <div class="result-content">
                      <div class="result-title">
                        <Highlight
                          :text="result.title"
                          :keywords="searchQuery"
                          highlight-style="primary"
                        />
                      </div>
                      <div v-if="result.description" class="result-description">
                        <Highlight
                          :text="result.description"
                          :keywords="searchQuery"
                        />
                      </div>
                    </div>
                    <div class="result-category">{{ result.category }}</div>
                  </div>
                </div>

                <!-- 无结果 -->
                <div v-else class="global-search-empty">
                  <Icon name="search-x" :size="48" />
                  <p>{{ t('components.interaction.globalSearch.noResults', { query: searchQuery }) }}</p>
                  <span>{{ t('components.interaction.globalSearch.tryOtherKeywords') }}</span>
                </div>
              </template>

              <!-- 空状态提示 -->
              <div v-else class="global-search-tip">
                <Icon name="keyboard" :size="32" />
                <p>{{ t('components.interaction.globalSearch.startSearch') }}</p>
                <div class="search-shortcuts">
                  <div class="shortcut-item">
                    <ShortcutLabel shortcut="↑↓" size="sm" />
                    <span>{{ t('components.interaction.globalSearch.select') }}</span>
                  </div>
                  <div class="shortcut-item">
                    <ShortcutLabel shortcut="Enter" size="sm" />
                    <span>{{ t('components.interaction.globalSearch.confirm') }}</span>
                  </div>
                  <div class="shortcut-item">
                    <ShortcutLabel shortcut="Esc" size="sm" />
                    <span>{{ t('components.interaction.globalSearch.close') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 搜索底部 -->
            <div class="global-search-footer">
              <span class="search-result-count">
                {{ t('components.interaction.globalSearch.resultCount', { count: filteredResults.length }) }}
              </span>
              <div class="search-footer-actions">
                <Button variant="text" size="sm" @click="closeSearch">
                  {{ t('components.interaction.globalSearch.close') }}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { Icon, Button } from '../utility';
import { Tag, Highlight } from '../data-display';
import ShortcutLabel from './ShortcutLabel.vue';
import SearchHistory from './SearchHistory.vue';
import type { SearchResult, SearchCategory } from '../types';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { shellDispatchAttrs, useOverlayLayer } from '@ocpui/vue/system';

const { uiT: t } = useUiT();

const overlayDispatch = shellDispatchAttrs('overlay-host', 'restore-trigger');

export interface GlobalSearchProps {
  placeholder?: string;
  results?: SearchResult[];
  categories?: SearchCategory[];
  history?: string[];
  loading?: boolean;
  maxHistory?: number;
}

const props = withDefaults(defineProps<GlobalSearchProps>(), {
  placeholder: '',
  results: () => [],
  categories: () => [],
  history: () => [],
  loading: false,
  maxHistory: 10,
});

const emit = defineEmits<{
  search: [query: string];
  select: [result: SearchResult];
  'history-change': [history: string[]];
}>();

const visible = ref(false);
const searchQuery = ref('');
const searchInputRef = ref<HTMLInputElement>();
const panelRef = ref<HTMLElement>();
const selectedIndex = ref(-1);
const activeCategory = ref<string>('all');
const searchHistory = ref<string[]>([...props.history]);

let searchTimeout: ReturnType<typeof setTimeout> | undefined;

/* overlay 统一收口：滚动锁 + W4 降焦 + 背景 inert + 焦点 trap/恢复；
   Esc 由输入框自身处理，关闭即释放（无离场收尾依赖） */
useOverlayLayer(visible, {
  container: panelRef,
  initialFocus: searchInputRef,
  closeOnEscape: false,
  releaseWhenHidden: true,
});

const displayPlaceholder = computed(() => props.placeholder || t('components.interaction.globalSearch.defaultPlaceholder'));

// 监听外部历史变化
watch(() => props.history, (newHistory) => {
  searchHistory.value = [...newHistory];
}, { deep: true });

const filteredResults = computed(() => {
  let results = props.results;
  
  // 按分类筛选
  if (activeCategory.value !== 'all') {
    results = results.filter(r => r.category === activeCategory.value);
  }
  
  return results;
});

const resultClass = (index: number) => {
  const classes = ['global-search-result'];
  if (index === selectedIndex.value) {
    classes.push('global-search-result--active');
  }
  return classes;
};

const openSearch = () => {
  visible.value = true;
  nextTick(() => {
    searchInputRef.value?.focus();
  });
};

const closeSearch = () => {
  visible.value = false;
  searchQuery.value = '';
  selectedIndex.value = -1;
  activeCategory.value = 'all';
};

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'k' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    if (visible.value) {
      closeSearch();
    } else {
      openSearch();
    }
  }
};

const handleOverlayClick = () => {
  closeSearch();
};

const handleInput = () => {
  selectedIndex.value = -1;
  // 防抖处理，避免频繁触发搜索
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    emit('search', searchQuery.value);
  }, 300);
};

const handleSearch = () => {
  if (filteredResults.value.length > 0 && selectedIndex.value >= 0) {
    handleResultClick(filteredResults.value[selectedIndex.value]);
  } else if (searchQuery.value.trim()) {
    addToHistory(searchQuery.value);
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  selectedIndex.value = -1;
  searchInputRef.value?.focus();
  emit('search', '');
};

const navigateResults = (direction: number) => {
  const maxIndex = filteredResults.value.length - 1;
  if (maxIndex < 0) return;
  
  selectedIndex.value += direction;
  if (selectedIndex.value < 0) {
    selectedIndex.value = maxIndex;
  } else if (selectedIndex.value > maxIndex) {
    selectedIndex.value = 0;
  }
  
  // 滚动到选中项
  const selectedElement = document.querySelector('.global-search-result--active');
  if (selectedElement) {
    selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

const handleResultClick = (result: SearchResult) => {
  addToHistory(searchQuery.value);
  emit('select', result);
  closeSearch();
};

const addToHistory = (query: string) => {
  if (!query.trim()) return;
  
  const trimmedQuery = query.trim();
  const index = searchHistory.value.indexOf(trimmedQuery);
  if (index > -1) {
    searchHistory.value.splice(index, 1);
  }
  searchHistory.value.unshift(trimmedQuery);
  
  if (searchHistory.value.length > props.maxHistory) {
    searchHistory.value = searchHistory.value.slice(0, props.maxHistory);
  }
  
  emit('history-change', [...searchHistory.value]);
};

const handleHistorySelect = (item: string) => {
  searchQuery.value = item;
  emit('search', item);
};

const handleHistoryDelete = (_item: string, index: number) => {
  searchHistory.value.splice(index, 1);
  emit('history-change', [...searchHistory.value]);
};

const handleHistoryClear = () => {
  searchHistory.value = [];
  emit('history-change', []);
};

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown);
  clearTimeout(searchTimeout);
});

defineExpose({
  open: openSearch,
  close: closeSearch,
  search: (query: string) => {
    searchQuery.value = query;
    emit('search', query);
  },
});
</script>

<style scoped>
.global-search {
  display: inline-flex;
}

.global-search-trigger {
  cursor: pointer;
  border: none;
  background: transparent;
  padding: 0;
}

.search-trigger-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  color: hsl(var(--text-muted));
  transition: border-color 0.2s ease, color 0.2s ease;
}

.search-trigger-content:hover {
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

.search-trigger-text {
  flex: 1;
  font-size: 14px;
}

/* 搜索面板 */
.global-search-panel {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  background: hsl(var(--text) / 0.5);
  backdrop-filter: blur(4px);
}

.global-search-content {
  width: 600px;
  max-width: 90vw;
  max-height: 70vh;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 搜索头部 */
.global-search-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid hsl(var(--border));
}

.global-search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: hsl(var(--surface-container-high));
  border-radius: 10px;
  padding: 0 12px;
}

.global-search-icon {
  color: hsl(var(--text-muted));
}

.global-search-input {
  flex: 1;
  height: 44px;
  border: none;
  background: transparent;
  font-size: 16px;
  color: hsl(var(--text));
  outline: none;
}

.global-search-input::placeholder {
  color: hsl(var(--text-muted));
}

.global-search-clear {
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
  transition: background-color 0.2s ease, color 0.2s ease;
}

.global-search-clear:hover {
  background: hsl(var(--surface-hover));
  color: hsl(var(--text));
}

.global-search-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.global-search-close:hover {
  background: hsl(var(--surface-hover));
  color: hsl(var(--text));
}

/* 搜索内容 */
.global-search-body {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
}

.global-search-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: hsl(var(--text-muted));
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 分类标签 */
.global-search-categories {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid hsl(var(--border) / 0.5);
  flex-wrap: wrap;
}

/* 搜索结果 */
.global-search-results {
  display: flex;
  flex-direction: column;
}

.global-search-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  border-left: 2px solid transparent;
}

.global-search-result:hover,
.global-search-result--active {
  background: hsl(var(--surface-hover));
  border-left-color: hsl(var(--primary));
}

.result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: hsl(var(--surface-container-high));
  border-radius: 8px;
  color: hsl(var(--primary));
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
  margin-bottom: 2px;
}

.result-description {
  font-size: 12px;
  color: hsl(var(--text-muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-category {
  font-size: 11px;
  color: hsl(var(--text-muted));
  background: hsl(var(--surface-container-high));
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

/* 空状态 */
.global-search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: hsl(var(--text-muted));
  text-align: center;
}

.global-search-empty p {
  font-size: 14px;
  color: hsl(var(--text));
  margin: 0;
}

.global-search-empty span {
  font-size: 13px;
}

/* 提示 */
.global-search-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: hsl(var(--text-muted));
}

.global-search-tip p {
  font-size: 14px;
  color: hsl(var(--text));
  margin: 0;
}

.search-shortcuts {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

/* 搜索底部 */
.global-search-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid hsl(var(--border));
  background: hsl(var(--surface-container-high));
}

.search-result-count {
  font-size: 13px;
  color: hsl(var(--text-muted));
}

/* 动画 */
.global-search-enter-active,
.global-search-leave-active {
  transition: opacity 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.global-search-enter-from,
.global-search-leave-to {
  opacity: 0;
}

.global-search-enter-from .global-search-content,
.global-search-leave-to .global-search-content {
  transform: translateY(-20px) scale(0.96);
}

.global-search-enter-active .global-search-content,
.global-search-leave-active .global-search-content {
  transition: transform 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
}
</style>
