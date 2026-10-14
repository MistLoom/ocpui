<!--
QuickSettings 组件

功能：快捷设置面板，用于快速调整应用设置

属性：
- modelValue: 设置状态对象，包含 darkMode, language, compact, notifications 字段
- placement: 面板位置，可选值：bottom-left, bottom-right, top-left, top-right，默认值：bottom-right
- customClass: 自定义类名
- title: 面板标题
- triggerIcon: 触发按钮图标
- storageKey: 本地存储键名，默认值：quick-settings

事件：
- update:modelValue: 设置值变化时触发
- change: 设置值变化时触发
- save: 保存设置时触发
- reset: 重置设置时触发

方法：
- open(): 打开设置面板
- close(): 关闭设置面板
- toggle(): 切换设置面板状态
-->

<template>
  <div :class="quickSettingsClass" role="group" :aria-label="title">
    <Button
      variant="icon"
      :custom-class="triggerButtonClass"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      @click="toggleDropdown"
      @keydown.enter="toggleDropdown"
      @keydown.space.prevent="toggleDropdown"
      @keydown.esc="closeDropdown"
    >
      <Icon :name="triggerIcon" :size="20" />
    </Button>

    <Transition name="quick-settings">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        :class="dropdownClass"
        :style="dropdownStyle"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`${id}-title`"
        @click.stop
        @keydown.esc="closeDropdown"
      >
        <div class="quick-settings-header">
          <span :id="`${id}-title`" class="quick-settings-title">{{ title }}</span>
          <Button
            variant="icon"
            size="sm"
            custom-class="quick-settings-close"
            :aria-label="t('components.utility.toast.close', '关闭')"
            @click="closeDropdown"
          >
            <Icon name="close" :size="16" />
          </Button>
        </div>

        <div class="quick-settings-body">
          <div class="quick-settings-item">
            <div class="quick-settings-item-info">
              <Icon name="moon" :size="18" class="quick-settings-item-icon" />
              <span class="quick-settings-item-label">{{ labels.darkMode }}</span>
            </div>
            <Switch
              v-model="localSettings.darkMode"
              size="sm"
              @change="handleDarkModeChange"
            />
          </div>

          <div class="quick-settings-item">
            <div class="quick-settings-item-info">
              <Icon name="language" :size="18" class="quick-settings-item-icon" />
              <span class="quick-settings-item-label">{{ labels.language }}</span>
            </div>
            <Select
              v-model="localSettings.language"
              :options="languageOptions"
              size="sm"
              style="width: 100px"
              @change="handleLanguageChange"
            />
          </div>

          <div class="quick-settings-item">
            <div class="quick-settings-item-info">
              <Icon name="layout" :size="18" class="quick-settings-item-icon" />
              <span class="quick-settings-item-label">{{ labels.compact }}</span>
            </div>
            <Switch
              v-model="localSettings.compact"
              size="sm"
              @change="handleCompactChange"
            />
          </div>

          <div class="quick-settings-item">
            <div class="quick-settings-item-info">
              <Icon name="bell" :size="18" class="quick-settings-item-icon" />
              <span class="quick-settings-item-label">{{ labels.notifications }}</span>
            </div>
            <Switch
              v-model="localSettings.notifications"
              size="sm"
              @change="handleNotificationsChange"
            />
          </div>

          <slot v-if="$slots.default" />
        </div>

        <div class="quick-settings-footer">
          <Button variant="text" size="sm" @click="resetSettings">
            {{ labels.reset }}
          </Button>
          <Button variant="primary" size="sm" @click="saveSettings">
            {{ labels.save }}
          </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import Button from './Button.vue';
import Icon from './Icon.vue';
import Switch from '../data-entry/Switch.vue';
import Select from '../data-entry/Select.vue';

interface QuickSettingsState {
  darkMode: boolean;
  language: string;
  compact: boolean;
  notifications: boolean;
}

interface Props {
  modelValue?: QuickSettingsState;
  placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  customClass?: string;
  title?: string;
  triggerIcon?: string;
  storageKey?: string;
  /** 语言选项，由消费方注入（如 admin i18n 配置） */
  languageOptions?: Array<{ label: string; value: string }>;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    darkMode: false,
    language: 'zh-CN',
    compact: false,
    notifications: true,
  }),
  placement: 'bottom-right',
  customClass: '',
  title: '',
  triggerIcon: 'settings',
  storageKey: 'quick-settings',
  languageOptions: () => [
    { label: '简体中文', value: 'zh-CN' },
    { label: 'English', value: 'en-US' },
    { label: '繁體中文', value: 'zh-TW' },
  ],
});

const emit = defineEmits<{
  'update:modelValue': [QuickSettingsState];
  'change': [QuickSettingsState];
  'save': [QuickSettingsState];
  'reset': [];
}>();

const { uiT: t } = useUiT();

// i18n 文案集中管理：使用 vue-i18n 缺省值兜底，避免硬编码
const labels = computed(() => ({
  darkMode: t('components.utility.quickSettings.darkMode', '暗色模式'),
  language: t('components.utility.quickSettings.language', '语言'),
  compact: t('components.utility.quickSettings.compact', '紧凑模式'),
  notifications: t('components.utility.quickSettings.notifications', '桌面通知'),
  reset: t('components.utility.quickSettings.reset', '重置'),
  save: t('components.utility.quickSettings.save', '保存'),
  title: props.title || t('components.utility.quickSettings.title', '快捷设置'),
}));

const id = useComponentId('quick-settings');

// 语言选项由 props 注入
const languageOptions = computed(() => props.languageOptions ?? []);

const isOpen = ref(false);
const localSettings = ref<QuickSettingsState>({ ...props.modelValue });
const dropdownRef = ref<HTMLElement>();

watch(() => props.modelValue, (newVal) => {
  localSettings.value = { ...newVal };
}, { deep: true });

const quickSettingsClass = computed(() => {
  const classes = ['quick-settings'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const triggerButtonClass = computed(() =>
  isOpen.value ? 'quick-settings-trigger--active' : '',
);

const dropdownClass = computed(() =>
  ['quick-settings-dropdown', `quick-settings-dropdown--${props.placement}`],
);

const dropdownStyle = computed(() => ({}));

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    setTimeout(() => dropdownRef.value?.focus(), 100);
  }
};

const closeDropdown = () => {
  isOpen.value = false;
};

const handleDarkModeChange = (value: boolean) => {
  localSettings.value.darkMode = value;
  emitChange();
};

const handleLanguageChange = (value: string | number | (string | number)[] | undefined) => {
  if (typeof value === 'string') {
    localSettings.value.language = value;
    emitChange();
  }
};

const handleCompactChange = (value: boolean) => {
  localSettings.value.compact = value;
  emitChange();
};

const handleNotificationsChange = (value: boolean) => {
  localSettings.value.notifications = value;
  emitChange();
};

const emitChange = () => {
  emit('update:modelValue', { ...localSettings.value });
  emit('change', { ...localSettings.value });
};

const defaultSettings = (): QuickSettingsState => ({
  darkMode: false,
  language: 'zh-CN',
  compact: false,
  notifications: true,
});

const saveSettings = () => {
  try {
    localStorage.setItem(props.storageKey, JSON.stringify(localSettings.value));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to save settings to localStorage:', e);
  }
  emit('save', { ...localSettings.value });
  closeDropdown();
};

const resetSettings = () => {
  localSettings.value = defaultSettings();
  try {
    localStorage.removeItem(props.storageKey);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to remove settings from localStorage:', e);
  }
  emit('update:modelValue', { ...localSettings.value });
  emit('change', { ...localSettings.value });
  emit('reset');
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

onMounted(() => {
  try {
    const saved = localStorage.getItem(props.storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<QuickSettingsState>;
      localSettings.value = { ...localSettings.value, ...parsed };
      emit('update:modelValue', { ...localSettings.value });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load settings from localStorage:', e);
  }

  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

defineExpose({
  open: () => {
    isOpen.value = true;
    setTimeout(() => dropdownRef.value?.focus(), 100);
  },
  close: closeDropdown,
  toggle: toggleDropdown,
  save: saveSettings,
  reset: resetSettings,
});
</script>

<style scoped>
.quick-settings {
  position: relative;
  display: inline-block;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.quick-settings-trigger--active {
  background: hsl(var(--primary) / 0.1) !important;
  border-color: hsl(var(--primary) / 0.3) !important;
  color: hsl(var(--primary)) !important;
}

.quick-settings-dropdown {
  position: absolute;
  z-index: var(--z-dropdown);
  min-width: 280px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  outline: none;
}

.quick-settings-dropdown--bottom-right {
  top: calc(100% + 8px);
  right: 0;
}

.quick-settings-dropdown--bottom-left {
  top: calc(100% + 8px);
  left: 0;
}

.quick-settings-dropdown--top-right {
  bottom: calc(100% + 8px);
  right: 0;
}

.quick-settings-dropdown--top-left {
  bottom: calc(100% + 8px);
  left: 0;
}

.quick-settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid hsl(var(--border));
}

.quick-settings-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--text));
}

.quick-settings-close {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 8px;
}

.quick-settings-body {
  padding: 12px;
}

.quick-settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 12px;
  transition: background-color 0.2s var(--ease-out);
}

.quick-settings-item:hover {
  background: hsl(var(--surface-container-high));
}

.quick-settings-item-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quick-settings-item-icon {
  color: hsl(var(--text-muted));
  transition: color 0.2s var(--ease-out);
}

.quick-settings-item:hover .quick-settings-item-icon {
  color: hsl(var(--primary));
}

.quick-settings-item-label {
  font-size: 14px;
  color: hsl(var(--text));
}

.quick-settings-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid hsl(var(--border));
  background: hsl(var(--surface-container-high));
}

.quick-settings-enter-active,
.quick-settings-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.quick-settings-enter-from,
.quick-settings-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

@media (max-width: 575.98px) {
  .quick-settings-dropdown {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    min-width: auto;
    border-radius: 20px 20px 0 0;
    box-shadow: var(--shadow-md);
  }

  .quick-settings-dropdown--bottom-right,
  .quick-settings-dropdown--bottom-left,
  .quick-settings-dropdown--top-right,
  .quick-settings-dropdown--top-left {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .quick-settings-enter-from,
  .quick-settings-leave-to {
    transform: translateY(100%);
  }
}
</style>
