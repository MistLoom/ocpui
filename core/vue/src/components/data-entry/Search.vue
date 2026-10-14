&lt;!--
Search 组件

功能：搜索组件，支持实时搜索、结果展示和键盘导航

属性：
- modelValue: string - 当前搜索值
- placeholder?: string - 占位文本
- clearable?: boolean - 是否可清除
- results?: SearchResult[] - 搜索结果列表
  - id: string - 结果ID
  - title: string - 结果标题
  - subtitle?: string - 结果副标题
  - icon?: any - 结果图标
- noResultsText?: string - 无结果提示文本
- inputClass?: string - 输入框自定义类名
- resultsStyle?: Record&lt;string, string&gt; - 结果面板自定义样式
- autofocus?: boolean - 是否自动聚焦
- ariaLabel?: string - 无障碍标签

事件：
- update:modelValue - 值变化时触发
- search - 搜索时触发
- select - 选择结果时触发
- focus - 聚焦时触发
- blur - 失焦时触发

使用方式：
```vue
&lt;Search
  v-model="searchQuery"
  :results="searchResults"
  placeholder="搜索..."
  @search="handleSearch"
  @select="handleSelect"
/&gt;
```
--&gt;
<template>
  <div ref="rootRef" class="search-component" :class="{ 'search-focused': isFocused, 'search-has-query': localSearchQuery }">
    <div class="search-input-wrapper">
      <Input
        ref="searchInputRef"
        v-model="localSearchQuery"
        :placeholder="placeholder"
        :clearable="clearable"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.esc="handleEscape"
        @keydown.enter="handleEnter"
        @keydown.down.prevent="navigateResults(1)"
        @keydown.up.prevent="navigateResults(-1)"
        @input="handleInput"
        :class="inputClass"
        :aria-label="ariaLabel"
      >
        <template #prefix>
          <Icon name="search" :size="16" />
        </template>
      </Input>
    </div>
    
    <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200"
      leave-active-class="transition-all duration-150"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="showResults && localSearchQuery"
        ref="resultsRef"
        class="search-results"
        :style="{ ...floatingBaseStyle, ...resultsStyle }"
        role="listbox"
        :aria-label="ariaLabel + ' results'"
      >
        <!-- 搜索结果头部 -->
        <div v-if="filteredResults.length > 0" class="search-results-header">
          <span class="search-results-count">{{ t('components.searchComponent.resultCount', { count: filteredResults.length }) }}</span>
          <span class="search-results-hint">{{ t('components.searchComponent.keyboardHint') }}</span>
        </div>

        <!-- 分类结果列表 -->
        <div v-if="filteredResults.length > 0">
          <div v-for="(group, groupIndex) in groupedResults" :key="groupIndex">
            <div v-if="group.label" class="search-result-group-label">{{ t(`components.searchComponent.group.${group.label}`) }}</div>
            <div
              v-for="(result, idx) in group.items"
              :key="result.id"
              @click="handleResultClick(result)"
              @mouseenter="selectedResultIndex = getGlobalIndex(groupIndex, idx)"
              :class="[
                'search-result-item',
                selectedResultIndex === getGlobalIndex(groupIndex, idx) ? 'search-result-active' : ''
              ]"
              role="option"
              :aria-selected="selectedResultIndex === getGlobalIndex(groupIndex, idx)"
              :id="`search-result-${getGlobalIndex(groupIndex, idx)}`"
              tabindex="-1"
            >
              <div class="search-result-icon" :class="[result.type ? `search-result-icon--${result.type}` : '']">
                <component :is="result.icon" v-if="result.icon" class="w-4 h-4" />
                <Icon v-else name="file-text" :size="14" />
              </div>
              <div class="search-result-content">
                <div class="search-result-title">
                  {{ result.title }}
                  <span v-if="result.type" class="search-result-type-badge" :class="`search-result-type-badge--${result.type}`">{{ result.type }}</span>
                </div>
                <div class="search-result-subtitle" v-if="result.subtitle">{{ result.subtitle }}</div>
              </div>
              <div class="search-result-action-hint">
                <kbd>↵</kbd>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 无结果提示 -->
        <div
          v-else
          class="search-no-results"
          role="alert"
          aria-live="polite"
        >
          <div class="search-no-results-icon">
            <Icon name="search-x" :size="24" />
          </div>
          <div class="search-no-results-text">
            {{ noResultsText }}
          </div>
          <div class="search-no-results-hint">
            {{ t('components.searchComponent.tryOtherKeywords') }}
          </div>
        </div>

        <!-- 搜索面板底部 -->
        <div class="search-footer">
          <span class="search-footer-hint">
            <kbd>↑</kbd> <kbd>↓</kbd> {{ t('components.searchComponent.footer.navigate') }}
          </span>
          <span class="search-footer-hint">
            <kbd>↵</kbd> {{ t('components.searchComponent.footer.select') }}
          </span>
          <span class="search-footer-hint">
            <kbd>Esc</kbd> {{ t('components.searchComponent.footer.close') }}
          </span>
        </div>
      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import Input from './Input.vue';
import Icon from '../utility/Icon.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useFloatingPosition } from '../composables/useFloatingPosition';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  icon?: any;
  type?: string;
  [key: string]: any;
}

interface ResultGroup {
  label: string;
  items: SearchResult[];
}

const { uiT: t } = useUiT();

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  clearable?: boolean;
  results?: SearchResult[];
  noResultsText?: string;
  inputClass?: string;
  resultsStyle?: Record<string, string>;
  autofocus?: boolean;
  ariaLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'search', query: string): void;
  (e: 'select', result: SearchResult): void;
  (e: 'focus'): void;
  (e: 'blur'): void;
}>();

const searchInputRef = ref<InstanceType<typeof Input> | null>(null);
const rootRef = ref<HTMLElement>();
const resultsRef = ref<HTMLElement>();
const localSearchQuery = ref(props.modelValue);
const isFocused = ref(false);
const showResults = ref(false);
const selectedResultIndex = ref(-1);
const floatingBaseStyle = { position: 'fixed' as const };

const floating = useFloatingPosition({
  reference: rootRef,
  floating: resultsRef,
  placement: 'bottom-start',
  matchWidth: true,
  offsetPx: 4,
});

const ariaLabel = computed(() => props.ariaLabel || 'Search');

watch(() => props.autofocus, (shouldFocus) => {
  if (shouldFocus && searchInputRef.value) {
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
}, { immediate: true });

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  localSearchQuery.value = newValue;
});

// 监听本地值变化
watch([showResults, localSearchQuery], () => {
  if (showResults.value && localSearchQuery.value) {
    nextTick(() => {
      floating.start();
    });
  } else {
    floating.stop();
  }
});

watch(localSearchQuery, (newValue) => {
  emit('update:modelValue', newValue);
  emit('search', newValue);
});

const filteredResults = computed(() => {
  if (!props.results || !localSearchQuery.value) {
    return [];
  }
  
  const query = localSearchQuery.value.toLowerCase();
  return props.results.filter(result => 
    result.title.toLowerCase().includes(query) ||
    (result.subtitle && result.subtitle.toLowerCase().includes(query))
  );
});

// 按 type 分组结果
const groupedResults = computed(() => {
  const groups: Record<string, SearchResult[]> = {};
  const order: string[] = [];
  
  for (const result of filteredResults.value) {
    const type = result.type || 'general';
    if (!groups[type]) {
      groups[type] = [];
      order.push(type);
    }
    groups[type].push(result);
  }
  
  return order.map(type => ({
    label: type === 'general' ? '' : type,
    items: groups[type],
  })) as ResultGroup[];
});

const getGlobalIndex = (groupIndex: number, itemIndex: number): number => {
  let idx = 0;
  for (let g = 0; g < groupIndex; g++) {
    idx += groupedResults.value[g]?.items.length || 0;
  }
  return idx + itemIndex;
};

const handleFocus = () => {
  isFocused.value = true;
  showResults.value = true;
  emit('focus');
};

const handleBlur = () => {
  isFocused.value = false;
  // 延迟关闭结果面板，以便点击结果时能够触发点击事件
  setTimeout(() => {
    showResults.value = false;
  }, 200);
  emit('blur');
};

const handleEscape = () => {
  showResults.value = false;
  if (searchInputRef.value) {
    // @ts-ignore
    searchInputRef.value.blur();
  }
};

const handleEnter = () => {
  if (filteredResults.value.length > 0 && selectedResultIndex.value >= 0) {
    handleResultClick(filteredResults.value[selectedResultIndex.value]);
  }
};

const handleInput = () => {
  selectedResultIndex.value = -1;
  showResults.value = true;
};

const navigateResults = (direction: number) => {
  if (filteredResults.value.length === 0) return;
  
  let newIndex = selectedResultIndex.value + direction;
  if (newIndex < 0) {
    newIndex = filteredResults.value.length - 1;
  } else if (newIndex >= filteredResults.value.length) {
    newIndex = 0;
  }
  selectedResultIndex.value = newIndex;
  
  // 滚动到选中项
  const selectedElement = document.getElementById(`search-result-${newIndex}`);
  if (selectedElement) {
    selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

const handleResultClick = (result: SearchResult) => {
  emit('select', result);
  showResults.value = false;
  if (searchInputRef.value) {
    // @ts-ignore
    searchInputRef.value.blur();
  }
};
</script>

<style scoped>
.search-component {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  width: 100%;
}

.search-results {
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: 0 8px 32px hsl(var(--text) / 0.1), 0 2px 8px hsl(var(--text) / 0.06);
  max-height: 420px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: var(--z-dropdown);
}

.search-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid hsl(var(--border) / 0.5);
  flex-shrink: 0;
  background: hsl(var(--surface-container-high) / 0.5);
}

.search-results-count {
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--text-muted));
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.search-results-hint {
  font-size: 11px;
  color: hsl(var(--text-muted) / 0.7);
  font-family: 'SF Mono', 'Monaco', 'JetBrains Mono', monospace;
}

.search-result-group-label {
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--text-muted) / 0.8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 16px 4px;
  background: hsl(var(--surface-container-high) / 0.3);
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  border-bottom: 1px solid hsl(var(--border) / 0.3);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover,
.search-result-active {
  background: hsl(var(--primary) / 0.08);
  padding-left: 14px;
}

.search-result-item:hover .search-result-title,
.search-result-active .search-result-title {
  color: hsl(var(--primary));
}

.search-result-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text-muted));
  flex-shrink: 0;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.search-result-item:hover .search-result-icon,
.search-result-active .search-result-icon {
  border-color: hsl(var(--primary) / 0.3);
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.06);
}

.search-result-icon--section {
  color: hsl(var(--primary));
  border-color: hsl(var(--primary) / 0.2);
  background: hsl(var(--primary) / 0.06);
}

.search-result-icon--action {
  color: hsl(var(--warning));
  border-color: hsl(var(--warning) / 0.2);
  background: hsl(var(--warning) / 0.06);
}

.search-result-icon--user {
  color: hsl(var(--success));
  border-color: hsl(var(--success) / 0.2);
  background: hsl(var(--success) / 0.06);
}

.search-result-content {
  flex: 1;
  min-width: 0;
}

.search-result-title {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
  line-height: 1.4;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s ease;
}

.search-result-type-badge {
  display: inline-flex;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 6px;
  border-radius: 4px;
  line-height: 1.4;
}

.search-result-type-badge--section {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.search-result-type-badge--action {
  background: hsl(var(--warning) / 0.1);
  color: hsl(var(--warning));
}

.search-result-type-badge--user {
  background: hsl(var(--success) / 0.1);
  color: hsl(var(--success));
}

.search-result-subtitle {
  font-size: 12px;
  color: hsl(var(--text-muted));
  line-height: 1.3;
}

.search-result-action-hint {
  flex-shrink: 0;
}

.search-result-action-hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  font-size: 11px;
  font-family: 'SF Mono', 'Monaco', 'JetBrains Mono', monospace;
  color: hsl(var(--text-muted));
  background: hsl(var(--surface-container-high));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  opacity: 0.6;
}

.search-result-active .search-result-action-hint kbd {
  opacity: 1;
  border-color: hsl(var(--primary) / 0.3);
  color: hsl(var(--primary));
}

.search-no-results {
  padding: 40px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.search-no-results-icon {
  color: hsl(var(--text-muted) / 0.4);
  margin-bottom: 4px;
}

.search-no-results-text {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text-muted));
}

.search-no-results-hint {
  font-size: 12px;
  color: hsl(var(--text-muted) / 0.6);
}

.search-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-top: 1px solid hsl(var(--border) / 0.5);
  flex-shrink: 0;
  background: hsl(var(--surface-container-high) / 0.5);
}

.search-footer-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: hsl(var(--text-muted) / 0.6);
}

.search-footer-hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-size: 10px;
  font-family: 'SF Mono', 'Monaco', 'JetBrains Mono', monospace;
  color: hsl(var(--text-muted) / 0.7);
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border) / 0.6);
  border-radius: 3px;
}

.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: transparent;
}

.search-results::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary) / 0.3);
}
</style>