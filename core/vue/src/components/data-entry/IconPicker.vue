<template>
  <div class="icon-picker" :class="{ open: isOpen, disabled: disabled, [customClass]: customClass }">
    <button
      type="button"
      class="icon-picker-trigger"
      :disabled="disabled"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggleOpen"
    >
      <div class="selected-icon">
        <Icon v-if="modelValue" :name="modelValue" :size="24" />
        <span v-else class="placeholder">{{ placeholder }}</span>
      </div>
      <Icon name="chevron-down" :size="16" class="arrow-icon" />
    </button>
    
    <div v-if="isOpen" class="icon-picker-dropdown" v-click-outside="close">
      <div class="search-box">
        <Icon name="search" :size="14" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('components.dataEntry.iconPicker.searchPlaceholder')"
          class="search-input"
        />
      </div>
      
      <div class="icon-categories">
        <div v-if="filteredCategories.length === 0" class="icon-picker-empty">
          <Icon name="search" :size="24" />
          <p>{{ t('components.dataEntry.iconPicker.noMatch') }}</p>
        </div>
        <div
          v-for="category in filteredCategories"
          :key="category.name"
          class="icon-category"
        >
          <div class="category-title">{{ category.label }}</div>
          <div class="icon-grid">
            <button
              v-for="icon in filterIcons(category.icons)"
              :key="icon"
              type="button"
              class="icon-item"
              :class="{ active: modelValue === icon }"
              :title="icon"
              @click="selectIcon(icon)"
              @keydown.enter="selectIcon(icon)"
              @keydown.space.prevent="selectIcon(icon)"
              tabindex="0"
            >
              <Icon :name="icon" :size="20" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 图标选择器组件
 * @description 用于选择图标的组件
 * 
 * @props {
 *   modelValue?: string; // 绑定值，图标名称
 *   disabled?: boolean; // 是否禁用
 *   placeholder?: string; // 占位符文本
 *   customClass?: string; // 自定义类名
 *   categories?: Array<{ name: string; label: string; icons: string[] }>; // 自定义图标分类
 * }
 * 
 * @emits {
 *   'update:modelValue': [value: string]; // 值更新事件
 *   'change': [value: string]; // 变化事件
 * }
 * 
 * @example
 * // 基本使用
 * <IconPicker v-model="icon" />
 * 
 * // 带自定义占位符
 * <IconPicker v-model="icon" placeholder="选择一个图标" />
 */
import { ref, computed } from 'vue';
import Icon from '../utility/Icon.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

// Extend HTMLElement interface
declare global {
  interface HTMLElement {
    _clickOutside?: (event: Event) => void;
  }
}

// Click outside directive
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el._clickOutside = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value();
      }
    };
    document.addEventListener('click', el._clickOutside, true);
  },
  unmounted(el: HTMLElement) {
    if (el._clickOutside) {
      document.removeEventListener('click', el._clickOutside, true);
    }
  },
};

interface Props {
  modelValue?: string;
  disabled?: boolean;
  placeholder?: string;
  customClass?: string;
  categories?: Array<{ name: string; label: string; icons: string[] }>;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
  placeholder: '选择图标',
  customClass: '',
  categories: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
}>();

const isOpen = ref(false);
const searchQuery = ref('');

const defaultCategories = [
  {
    name: 'common',
    label: '常用',
    icons: ['home', 'settings', 'user', 'users', 'file-text', 'folder', 'image', 'link', 'mail', 'bell'],
  },
  {
    name: 'arrows',
    label: '箭头',
    icons: ['arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right'],
  },
  {
    name: 'actions',
    label: '操作',
    icons: ['plus', 'minus', 'x', 'check', 'edit', 'trash-2', 'copy', 'download', 'upload', 'refresh-cw'],
  },
  {
    name: 'media',
    label: '媒体',
    icons: ['play', 'pause', 'stop', 'skip-forward', 'skip-back', 'volume-2', 'mic', 'camera', 'video'],
  },
  {
    name: 'status',
    label: '状态',
    icons: ['check-circle', 'x-circle', 'alert-circle', 'info', 'help-circle', 'clock', 'calendar'],
  },
  {
    name: 'files',
    label: '文件',
    icons: ['file', 'file-text', 'file-plus', 'folder', 'folder-plus', 'archive', 'paperclip'],
  },
];

const currentCategories = computed(() => props.categories || defaultCategories);

const filterIcons = (icons: string[]) => {
  if (!searchQuery.value) return icons;
  return icons.filter(icon => icon.toLowerCase().includes(searchQuery.value.toLowerCase()));
};

const filteredCategories = computed(() => {
  if (!searchQuery.value) return currentCategories.value;
  return currentCategories.value.filter(category => {
    return category.icons.some(icon => icon.toLowerCase().includes(searchQuery.value!.toLowerCase()));
  });
});

const toggleOpen = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
  searchQuery.value = '';
};

const selectIcon = (icon: string) => {
  emit('update:modelValue', icon);
  emit('change', icon);
  close();
};
</script>

<style scoped>
.icon-picker {
  position: relative;
  display: inline-block;
  width: 100%;
}

.icon-picker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: hsl(var(--surface-container-high));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s;
}

.icon-picker-trigger:hover {
  border-color: hsl(var(--primary));
}

.icon-picker.open .icon-picker-trigger {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
}

.selected-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  color: hsl(var(--text));
}

.placeholder {
  color: hsl(var(--text-muted));
  font-size: 14px;
}

.arrow-icon {
  color: hsl(var(--text-secondary));
  transition: transform 0.2s;
}

.icon-picker.open .arrow-icon {
  transform: rotate(180deg);
}

.icon-picker-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: var(--z-dropdown);
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  max-height: 400px;
  overflow: auto;
}

.search-box {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: hsl(var(--surface));
  border-bottom: 1px solid hsl(var(--border));
}

.search-icon {
  color: hsl(var(--text-muted));
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: hsl(var(--text));
  outline: none;
}

.search-input::placeholder {
  color: hsl(var(--text-muted));
}

.icon-categories {
  padding: 12px;
}

.icon-category {
  margin-bottom: 16px;
}

.icon-category:last-child {
  margin-bottom: 0;
}

.category-title {
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--text-secondary));
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: hsl(var(--text-secondary));
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.icon-item:hover {
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text));
}

.icon-item.active {
  background: hsl(var(--primary));
  color: white;
}

.icon-picker.disabled .icon-picker-trigger {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: hsl(var(--border));
}

.icon-picker.disabled .icon-picker-trigger:hover {
  border-color: hsl(var(--border));
}

.icon-picker-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: hsl(var(--text-muted));
}

.icon-picker-empty Icon {
  margin-bottom: 12px;
  opacity: 0.5;
}

.icon-picker-empty p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 480px) {
  .icon-grid {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .icon-item {
    width: 32px;
    height: 32px;
  }
  
  .icon-item Icon {
    size: 18px;
  }
  
  .icon-picker-empty {
    padding: 32px 16px;
  }
}
</style>
