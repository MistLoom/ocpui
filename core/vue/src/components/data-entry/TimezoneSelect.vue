&lt;!--
TimezoneSelect 组件

功能：提供一个时区选择器，支持搜索、分组显示、当前时间预览等功能

Props:
- modelValue: string - 绑定的时区值，格式为时区区域字符串
- options: TimezoneOption[] - 时区选项列表
- placeholder: string - 占位符文本，默认 '选择时区'
- disabled: boolean - 是否禁用，默认 false
- customClass: string - 自定义类名

Events:
- update:modelValue: (value: string) - 值变化时触发
- change: (option: TimezoneOption) - 选择变化时触发，返回完整的时区选项对象

Methods:
- open() - 打开下拉面板
- close() - 关闭下拉面板
- focus() - 聚焦到触发器

TimezoneOption 接口：
- region: string - 时区区域
- label: string - 时区标签
- city: string - 城市名称
- country: string - 国家名称
- offset: number - 时区偏移（分钟）
- offsetLabel: string - 时区偏移标签
- group: string - 分组名称

使用示例：
&lt;TimezoneSelect v-model="selectedTimezone" :options="timezoneOptions" /&gt;
&lt;TimezoneSelect v-model="selectedTimezone" :options="timezoneOptions" disabled /&gt;
&lt;TimezoneSelect v-model="selectedTimezone" :options="timezoneOptions" customClass="my-timezone-select" /&gt;
--&gt;
<template>
  <div ref="rootRef" :class="selectClass">
    <!-- 触发器 -->
    <div
      ref="triggerRef"
      class="timezone-trigger"
      :class="{ 'timezone-trigger--open': isOpen, 'timezone-trigger--disabled': disabled }"
      @click="handleTriggerClick"
      @keydown="handleTriggerKeydown"
      tabindex="0"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-disabled="disabled"
      :aria-haspopup="'listbox'"
      :aria-controls="isOpen ? dropdownId : undefined"
      :aria-activedescendant="isOpen && activeOptionId ? activeOptionId : undefined"
      :aria-label="placeholder"
    >
      <div class="timezone-trigger-content">
        <template v-if="selectedOption">
          <span class="timezone-city">{{ selectedOption.city }}</span>
          <span class="timezone-offset">{{ selectedOption.offsetLabel }}</span>
        </template>
        <span v-else class="timezone-placeholder">{{ placeholder }}</span>
      </div>
      <div class="timezone-trigger-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'is-open': isOpen }">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>

    <!-- 下拉面板 -->
    <Teleport to="body">
      <Transition name="timezone-dropdown">
        <div
          v-if="isOpen"
          ref="dropdownRef"
          :id="dropdownId"
          class="timezone-dropdown"
          :style="floatingBaseStyle"
          role="listbox"
          aria-label="时区选择"
          @keydown="handleDropdownKeydown"
        >
          <!-- 搜索框 -->
          <div class="timezone-search">
            <div class="timezone-search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              class="timezone-search-input"
              placeholder="搜索城市或时区..."
              @keydown="handleSearchKeydown"
              aria-label="搜索时区"
              autocomplete="off"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="timezone-search-clear"
              @click="searchQuery = ''"
              aria-label="清除搜索"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- 当前时间预览 -->
          <div v-if="selectedOption" class="timezone-current">
            <span class="timezone-current-label">{{ t('components.dataEntry.timezoneSelect.currentTime') }}</span>
            <span class="timezone-current-time">{{ currentTimeDisplay }}</span>
          </div>

          <!-- 选项列表 -->
          <div ref="listRef" class="timezone-list" @scroll="handleListScroll" role="presentation">
            <template v-for="(group, groupIndex) in filteredGroups" :key="group.group">
              <div class="timezone-group" role="presentation">{{ group.group }}</div>
              <div
                v-for="(option, optionIndex) in group.options"
                :key="option.region"
                :ref="el => setOptionRef(el, option.region)"
                class="timezone-option"
                :class="{
                  'timezone-option--selected': modelValue === option.region,
                  'timezone-option--highlighted': highlightedIndex === getOptionIndex(groupIndex, optionIndex)
                }"
                @click="handleSelect(option)"
                @mouseenter="highlightedIndex = getOptionIndex(groupIndex, optionIndex)"
                :id="`timezone-option-${option.region}`"
                role="option"
                :aria-selected="modelValue === option.region"
                :tabindex="-1"
              >
                <div class="timezone-option-main">
                  <span class="timezone-option-city">{{ option.city }}</span>
                  <span class="timezone-option-country">{{ option.country }}</span>
                </div>
                <div class="timezone-option-meta">
                  <span class="timezone-option-offset">{{ option.offsetLabel }}</span>
                  <span class="timezone-option-time">{{ getOptionTime(option) }}</span>
                </div>
              </div>
            </template>

            <!-- 空状态 -->
            <div v-if="filteredGroups.length === 0" class="timezone-empty" role="presentation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>{{ t('components.dataEntry.timezoneSelect.noMatch') }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, type ComponentPublicInstance } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useFloatingPosition } from '../composables/useFloatingPosition';

export interface TimezoneOption {
  region: string;
  label: string;
  city: string;
  country: string;
  offset: number;
  offsetLabel: string;
  group: string;
}

interface Props {
  modelValue: string;
  options: TimezoneOption[];
  placeholder?: string;
  disabled?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '选择时区',
  disabled: false,
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [option: TimezoneOption];
}>();

const { uiT: t } = useUiT();

// Refs
const rootRef = ref<HTMLDivElement>();
const triggerRef = ref<HTMLDivElement>();
const dropdownRef = ref<HTMLDivElement>();
const listRef = ref<HTMLDivElement>();
const optionRefs = ref<Map<string, HTMLElement>>(new Map());

// State
const isOpen = ref(false);
const searchQuery = ref('');
const highlightedIndex = ref(-1);
const currentTime = ref(new Date());
const dropdownId = useComponentId('timezone-dropdown');
const floatingBaseStyle = { position: 'fixed' as const };

const floating = useFloatingPosition({
  reference: rootRef,
  floating: dropdownRef,
  placement: 'bottom-start',
  matchWidth: true,
  offsetPx: 4,
  maxHeight: 400,
});

// Current time timer
let timeTimer: ReturnType<typeof setInterval> | null = null;

// Computed
const selectClass = computed(() => {
  const classes = ['timezone-select'];
  if (props.customClass) classes.push(props.customClass);
  if (isOpen.value) classes.push('timezone-select--open');
  return classes;
});

const selectedOption = computed(() => {
  return props.options.find(opt => opt.region === props.modelValue);
});

const filteredGroups = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();

  if (!query) {
    // Group by region
    const groups = new Map<string, TimezoneOption[]>();
    props.options.forEach(option => {
      if (!groups.has(option.group)) {
        groups.set(option.group, []);
      }
      groups.get(option.group)!.push(option);
    });
    return Array.from(groups.entries()).map(([group, options]) => ({ group, options }));
  }

  // Filter by search query
  const filtered = props.options.filter(option =>
    option.city.toLowerCase().includes(query) ||
    option.country.toLowerCase().includes(query) ||
    option.region.toLowerCase().includes(query) ||
    option.offsetLabel.toLowerCase().includes(query)
  );

  // Group filtered results
  const groups = new Map<string, TimezoneOption[]>();
  filtered.forEach(option => {
    if (!groups.has(option.group)) {
      groups.set(option.group, []);
    }
    groups.get(option.group)!.push(option);
  });

  return Array.from(groups.entries()).map(([group, options]) => ({ group, options }));
});

const currentTimeDisplay = computed(() => {
  if (!selectedOption.value) return '';
  return formatTimeInTimezone(currentTime.value, selectedOption.value.offset);
});

const flatOptions = computed(() => {
  return filteredGroups.value.flatMap(g => g.options);
});

const activeOptionId = computed(() => {
  if (highlightedIndex.value < 0 || highlightedIndex.value >= flatOptions.value.length) {
    return undefined;
  }
  const option = flatOptions.value[highlightedIndex.value];
  return option ? `timezone-option-${option.region}` : undefined;
});

// Methods
const formatTimeInTimezone = (date: Date, offsetMinutes: number): string => {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const localTime = new Date(utc + (offsetMinutes * 60000));

  return localTime.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const getOptionTime = (option: TimezoneOption): string => {
  return formatTimeInTimezone(currentTime.value, option.offset);
};

const getOptionIndex = (groupIndex: number, optionIndex: number): number => {
  let index = 0;
  for (let i = 0; i < groupIndex; i++) {
    index += filteredGroups.value[i].options.length;
  }
  return index + optionIndex;
};

const setOptionRef = (el: Element | ComponentPublicInstance | null, region: string) => {
  if (el instanceof HTMLElement) {
    optionRefs.value.set(region, el);
  }
};

const handleTriggerClick = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      searchQuery.value = '';
      highlightedIndex.value = flatOptions.value.findIndex(opt => opt.region === props.modelValue);
      scrollToHighlighted();
      startTimeTimer();
      // 聚焦到搜索框
      const searchInput = dropdownRef.value?.querySelector('.timezone-search-input') as HTMLInputElement;
      searchInput?.focus();
    });
  } else {
    stopTimeTimer();
  }
};

const handleTriggerKeydown = (e: KeyboardEvent) => {
  if (props.disabled) return;
  
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      handleTriggerClick();
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (!isOpen.value) handleTriggerClick();
      break;
    case 'Escape':
      if (isOpen.value) {
        isOpen.value = false;
        stopTimeTimer();
      }
      break;
  }
};

const handleDropdownKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    isOpen.value = false;
    stopTimeTimer();
    nextTick(() => {
      triggerRef.value?.focus();
    });
  }
};

const handleSelect = (option: TimezoneOption) => {
  emit('update:modelValue', option.region);
  emit('change', option);
  isOpen.value = false;
  stopTimeTimer();
};

const handleSearchKeydown = (e: KeyboardEvent) => {
  const totalOptions = flatOptions.value.length;
  if (totalOptions === 0) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      highlightedIndex.value = (highlightedIndex.value + 1) % totalOptions;
      scrollToHighlighted();
      break;
    case 'ArrowUp':
      e.preventDefault();
      highlightedIndex.value = (highlightedIndex.value - 1 + totalOptions) % totalOptions;
      scrollToHighlighted();
      break;
    case 'Enter':
      e.preventDefault();
      if (highlightedIndex.value >= 0 && highlightedIndex.value < totalOptions) {
        handleSelect(flatOptions.value[highlightedIndex.value]);
      }
      break;
    case 'Escape':
      isOpen.value = false;
      stopTimeTimer();
      break;
  }
};

const scrollToHighlighted = () => {
  if (highlightedIndex.value < 0) return;

  const option = flatOptions.value[highlightedIndex.value];
  if (!option) return;

  const el = optionRefs.value.get(option.region);
  if (el && listRef.value) {
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
};

const handleListScroll = () => {
  // Handle scroll if needed
};

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (
    isOpen.value &&
    triggerRef.value &&
    !triggerRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    isOpen.value = false;
    stopTimeTimer();
    nextTick(() => {
      triggerRef.value?.focus();
    });
  }
};

const startTimeTimer = () => {
  stopTimeTimer();
  timeTimer = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
};

const stopTimeTimer = () => {
  if (timeTimer) {
    clearInterval(timeTimer);
    timeTimer = null;
  }
};

// Watch
watch(() => props.modelValue, () => {
  highlightedIndex.value = flatOptions.value.findIndex(opt => opt.region === props.modelValue);
});

// 监听 options 变化
watch(() => props.options, () => {
  highlightedIndex.value = flatOptions.value.findIndex(opt => opt.region === props.modelValue);
}, { deep: true });

watch(isOpen, (val) => {
  if (val) {
    nextTick(() => {
      floating.start();
    });
  } else {
    floating.stop();
  }
});

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  stopTimeTimer();
});

// Expose
defineExpose({
  open: () => {
    isOpen.value = true;
    startTimeTimer();
    nextTick(() => {
      highlightedIndex.value = flatOptions.value.findIndex(opt => opt.region === props.modelValue);
    });
  },
  close: () => { isOpen.value = false; stopTimeTimer(); },
  focus: () => triggerRef.value?.focus(),
});
</script>

<style scoped>
.timezone-select {
  position: relative;
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.timezone-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  background: hsl(var(--surface-container-high));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.timezone-trigger:hover:not(.timezone-trigger--disabled) {
  border-color: hsl(var(--border-hover));
  background: hsl(var(--surface-hover));
}

.timezone-trigger--open {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.timezone-trigger--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timezone-trigger-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.timezone-city {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.timezone-offset {
  font-size: 12px;
  color: hsl(var(--text-muted));
  background: hsl(var(--background));
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.timezone-placeholder {
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.timezone-trigger-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: hsl(var(--text-muted));
  transition: transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.timezone-trigger-icon svg {
  width: 100%;
  height: 100%;
}

.timezone-trigger-icon svg.is-open {
  transform: rotate(180deg);
}

/* Dropdown */
.timezone-dropdown {
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  z-index: var(--z-dropdown);
  display: flex;
  flex-direction: column;
}

.timezone-dropdown-enter-active,
.timezone-dropdown-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.timezone-dropdown-enter-from,
.timezone-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Search */
.timezone-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.timezone-search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: hsl(var(--text-muted));
  flex-shrink: 0;
}

.timezone-search-icon svg {
  width: 100%;
  height: 100%;
}

.timezone-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: hsl(var(--text));
  outline: none;
}

.timezone-search-input::placeholder {
  color: hsl(var(--text-muted));
}

.timezone-search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  background: hsl(var(--surface-container-high));
  border-radius: 50%;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.timezone-search-clear:hover {
  background: hsl(var(--border));
  color: hsl(var(--text));
}

.timezone-search-clear svg {
  width: 12px;
  height: 12px;
}

/* Current time */
.timezone-current {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: hsl(var(--surface-container-high));
  border-bottom: 1px solid hsl(var(--border));
}

.timezone-current-label {
  font-size: 12px;
  color: hsl(var(--text-muted));
}

.timezone-current-time {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--primary));
  font-family: monospace;
}

/* List */
.timezone-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.timezone-group {
  padding: 8px 16px 4px;
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--text-muted));
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timezone-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.timezone-option:hover,
.timezone-option--highlighted {
  background: hsl(var(--surface-container-high));
}

.timezone-option--selected {
  background: hsl(var(--primary) / 0.1);
}

.timezone-option--selected .timezone-option-city {
  color: hsl(var(--primary));
  font-weight: 500;
}

.timezone-option-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.timezone-option-city {
  font-size: 14px;
  color: hsl(var(--text));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.timezone-option-country {
  font-size: 12px;
  color: hsl(var(--text-muted));
}

.timezone-option-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.timezone-option-offset {
  font-size: 12px;
  font-weight: 500;
  color: hsl(var(--text-secondary));
  background: hsl(var(--background));
  padding: 2px 6px;
  border-radius: 4px;
}

.timezone-option-time {
  font-size: 11px;
  color: hsl(var(--text-muted));
  font-family: monospace;
}

/* Empty state */
.timezone-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  color: hsl(var(--text-muted));
}

.timezone-empty svg {
  width: 32px;
  height: 32px;
  opacity: 0.5;
}

.timezone-empty span {
  font-size: 13px;
}

/* Scrollbar */
.timezone-list::-webkit-scrollbar {
  width: 6px;
}

.timezone-list::-webkit-scrollbar-track {
  background: transparent;
}

.timezone-list::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}

.timezone-list::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--border-hover));
}

/* Responsive */
@media (max-width: 639.98px) {
  .timezone-dropdown {
    position: fixed !important;
    left: 16px !important;
    right: 16px !important;
    width: auto !important;
    max-height: 60vh !important;
    top: auto !important;
    bottom: 16px !important;
  }
}
</style>
