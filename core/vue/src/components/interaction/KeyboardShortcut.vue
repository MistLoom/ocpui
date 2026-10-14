&lt;!--
KeyboardShortcut 键盘快捷键组件

## 组件说明
用于管理和显示键盘快捷键，支持快捷键提示、自定义快捷键和冲突检测。

## 公开属性
- shortcuts: ShortcutConfig[] - 自定义快捷键配置数组
- showTrigger: boolean - 是否显示触发按钮，默认为 true
- hintPosition: 'center' | 'bottom-right' - 提示面板位置，默认为 'center'

## 事件
- shortcut-trigger: 快捷键触发时触发，参数为触发的快捷键配置
- settings-change: 快捷键设置变化时触发，参数为更新后的快捷键配置数组

## 暴露方法
- showHint: 显示快捷键提示
- hideHint: 隐藏快捷键提示
- toggleHint: 切换快捷键提示显示状态
- openSettings: 打开快捷键设置面板

## 使用方式
```vue
&lt;KeyboardShortcut
  :shortcuts="customShortcuts"
  @shortcut-trigger="handleShortcut"
  @settings-change="handleSettingsChange"
/&gt;
```

## 快捷键配置类型
```typescript
interface ShortcutConfig {
  id: string;          // 快捷键唯一标识
  key: string;         // 快捷键组合
  description: string;  // 快捷键描述
  category: string;     // 快捷键分类
  defaultKey?: string;  // 默认快捷键
}
```
--&gt;

<template>
  <div class="keyboard-shortcut">
    <!-- 快捷键提示浮层触发按钮 -->
    <slot name="trigger" :show="showHint" :toggle="toggleHint">
      <button
        v-if="showTrigger"
        class="keyboard-shortcut-trigger"
        @click="toggleHint"
        :title="t('components.interaction.keyboardShortcut.viewShortcuts')"
      >
        <Icon name="keyboard" :size="18" />
      </button>
    </slot>

    <!-- 快捷键提示浮层 -->
    <Teleport to="body">
      <Transition name="shortcut-hint">
        <div
          v-if="hintVisible"
          class="keyboard-shortcut-hint"
          :style="hintStyle"
          @click.stop
        >
          <div class="shortcut-hint-header">
            <span class="shortcut-hint-title">{{ t('components.interaction.keyboardShortcut.title') }}</span>
            <button class="shortcut-hint-close" @click="hideHint">
              <Icon name="x" :size="16" />
            </button>
          </div>
          <div class="shortcut-hint-content">
            <div
              v-for="group in shortcutGroups"
              :key="group.name"
              class="shortcut-group"
            >
              <div class="shortcut-group-title">{{ group.name }}</div>
              <div class="shortcut-list">
                <div
                  v-for="shortcut in group.items"
                  :key="shortcut.id"
                  class="shortcut-item"
                >
                  <span class="shortcut-description">{{ shortcut.description }}</span>
                  <ShortcutLabel :shortcut="shortcut.key" size="sm" />
                </div>
              </div>
            </div>
          </div>
          <div class="shortcut-hint-footer">
            <Button variant="text" size="sm" @click="openSettings">
              {{ t('components.interaction.keyboardShortcut.customShortcuts') }}
            </Button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 快捷键设置面板 -->
    <Modal
      v-model="settingsVisible"
      :title="t('components.interaction.keyboardShortcut.settingsTitle')"
      width="640"
      :show-footer="false"
    >
      <div class="shortcut-settings">
        <Search
          v-model="searchQuery"
          :placeholder="t('components.interaction.keyboardShortcut.searchPlaceholder')"
          class="shortcut-search"
        />
        
        <Tabs v-model="activeTab" class="shortcut-tabs">
          <TabPane
            v-for="group in shortcutGroups"
            :key="group.name"
            :label="group.name"
            :name="group.name"
          >
            <div class="shortcut-settings-list">
              <div
                v-for="shortcut in filteredShortcuts(group.items)"
                :key="shortcut.id"
                class="shortcut-setting-item"
                :class="{ 'shortcut-setting-item--conflict': hasConflict(shortcut) }"
              >
                <div class="shortcut-setting-info">
                  <div class="shortcut-setting-name">{{ shortcut.description }}</div>
                  <div v-if="hasConflict(shortcut)" class="shortcut-setting-conflict">
                    <Icon name="alert-triangle" :size="14" />
                    {{ t('components.interaction.keyboardShortcut.conflictWith', { shortcut: getConflictWith(shortcut) }) }}
                  </div>
                </div>
                <div class="shortcut-setting-action">
                  <div
                    v-if="recordingId === shortcut.id"
                    class="shortcut-recording"
                  >
                    <span class="shortcut-recording-text">{{ t('components.interaction.keyboardShortcut.recording') }}</span>
                    <button class="shortcut-recording-cancel" @click="cancelRecording">
                      {{ t('components.interaction.keyboardShortcut.cancel') }}
                    </button>
                  </div>
                  <template v-else>
                    <ShortcutLabel
                      :shortcut="shortcut.key"
                      size="md"
                      clickable
                      @click="startRecording(shortcut)"
                    />
                    <button
                      class="shortcut-reset-btn"
                      @click="resetShortcut(shortcut)"
                      :title="t('components.interaction.keyboardShortcut.resetDefault')"
                    >
                      <Icon name="rotate-ccw" :size="14" />
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
        
        <div class="shortcut-settings-footer">
          <Button variant="secondary" @click="resetAllShortcuts">
            {{ t('components.interaction.keyboardShortcut.resetAll') }}
          </Button>
          <Button variant="primary" @click="saveSettings">
            {{ t('components.interaction.keyboardShortcut.saveSettings') }}
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Icon, Button } from '../utility';
import { Modal } from '../feedback';
import { Tabs, TabPane } from '../navigation';
import Search from '../data-entry/Search.vue';
import ShortcutLabel from './ShortcutLabel.vue';
import type { ShortcutConfig, ShortcutGroup } from '../types';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface Props {
  shortcuts?: ShortcutConfig[];
  showTrigger?: boolean;
  hintPosition?: 'center' | 'bottom-right';
}

const props = withDefaults(defineProps<Props>(), {
  shortcuts: () => [],
  showTrigger: true,
  hintPosition: 'center',
});

const emit = defineEmits<{
  'shortcut-trigger': [shortcut: ShortcutConfig];
  'settings-change': [shortcuts: ShortcutConfig[]];
}>();

// 状态
const hintVisible = ref(false);
const settingsVisible = ref(false);
const searchQuery = ref('');
const activeTab = ref('');
const recordingId = ref<string | null>(null);
const customShortcuts = ref<Map<string, string>>(new Map());

// 默认快捷键配置
const defaultShortcuts = computed<ShortcutConfig[]>(() => [
  { id: 'save', key: 'Ctrl+S', description: t('components.interaction.keyboardShortcut.shortcutDescriptions.save'), category: t('components.interaction.keyboardShortcut.categories.global'), defaultKey: 'Ctrl+S' },
  { id: 'search', key: 'Ctrl+F', description: t('components.interaction.keyboardShortcut.shortcutDescriptions.search'), category: t('components.interaction.keyboardShortcut.categories.global'), defaultKey: 'Ctrl+F' },
  { id: 'new', key: 'Ctrl+N', description: t('components.interaction.keyboardShortcut.shortcutDescriptions.new'), category: t('components.interaction.keyboardShortcut.categories.global'), defaultKey: 'Ctrl+N' },
  { id: 'undo', key: 'Ctrl+Z', description: t('components.interaction.keyboardShortcut.shortcutDescriptions.undo'), category: t('components.interaction.keyboardShortcut.categories.edit'), defaultKey: 'Ctrl+Z' },
  { id: 'redo', key: 'Ctrl+Y', description: t('components.interaction.keyboardShortcut.shortcutDescriptions.redo'), category: t('components.interaction.keyboardShortcut.categories.edit'), defaultKey: 'Ctrl+Y' },
  { id: 'copy', key: 'Ctrl+C', description: t('components.interaction.keyboardShortcut.shortcutDescriptions.copy'), category: t('components.interaction.keyboardShortcut.categories.edit'), defaultKey: 'Ctrl+C' },
  { id: 'paste', key: 'Ctrl+V', description: t('components.interaction.keyboardShortcut.shortcutDescriptions.paste'), category: t('components.interaction.keyboardShortcut.categories.edit'), defaultKey: 'Ctrl+V' },
  { id: 'cut', key: 'Ctrl+X', description: t('components.interaction.keyboardShortcut.shortcutDescriptions.cut'), category: t('components.interaction.keyboardShortcut.categories.edit'), defaultKey: 'Ctrl+X' },
  { id: 'select-all', key: 'Ctrl+A', description: t('components.interaction.keyboardShortcut.shortcutDescriptions.select-all'), category: t('components.interaction.keyboardShortcut.categories.edit'), defaultKey: 'Ctrl+A' },
  { id: 'delete', key: 'Delete', description: t('components.interaction.keyboardShortcut.shortcutDescriptions.delete'), category: t('components.interaction.keyboardShortcut.categories.edit'), defaultKey: 'Delete' },
  { id: 'help', key: '?', description: t('components.interaction.keyboardShortcut.shortcutDescriptions.help'), category: t('components.interaction.keyboardShortcut.categories.navigation'), defaultKey: '?' },
  { id: 'esc', key: 'Escape', description: t('components.interaction.keyboardShortcut.shortcutDescriptions.esc'), category: t('components.interaction.keyboardShortcut.categories.navigation'), defaultKey: 'Escape' },
  { id: 'enter', key: 'Enter', description: t('components.interaction.keyboardShortcut.shortcutDescriptions.enter'), category: t('components.interaction.keyboardShortcut.categories.navigation'), defaultKey: 'Enter' },
]);

const allShortcuts = computed(() => {
  return props.shortcuts.length > 0 ? props.shortcuts : defaultShortcuts.value;
});

const shortcutGroups = computed<ShortcutGroup[]>(() => {
  const groups = new Map<string, ShortcutConfig[]>();

  allShortcuts.value.forEach(shortcut => {
    const category = shortcut.category || t('components.interaction.keyboardShortcut.categories.other');
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(shortcut);
  });

  return Array.from(groups.entries()).map(([name, items]) => ({
    name,
    items,
  }));
});

const hintStyle = computed(() => {
  if (props.hintPosition === 'bottom-right') {
    return {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      transform: 'none',
    } as Record<string, string>;
  }
  return {};
});

// 方法
const toggleHint = () => {
  hintVisible.value = !hintVisible.value;
};

const showHint = () => {
  hintVisible.value = true;
};

const hideHint = () => {
  hintVisible.value = false;
};

const openSettings = () => {
  hideHint();
  settingsVisible.value = true;
  if (shortcutGroups.value.length > 0) {
    activeTab.value = shortcutGroups.value[0].name;
  }
};

const filteredShortcuts = (items: ShortcutConfig[]) => {
  if (!searchQuery.value) return items;
  const query = searchQuery.value.toLowerCase();
  return items.filter(
    s =>
      s.description.toLowerCase().includes(query) ||
      s.key.toLowerCase().includes(query)
  );
};

const hasConflict = (shortcut: ShortcutConfig): boolean => {
  const currentKey = customShortcuts.value.get(shortcut.id) || shortcut.key;
  return allShortcuts.value.some(
    s =>
      s.id !== shortcut.id &&
      (customShortcuts.value.get(s.id) || s.key) === currentKey
  );
};

const getConflictWith = (shortcut: ShortcutConfig): string => {
  const currentKey = customShortcuts.value.get(shortcut.id) || shortcut.key;
  const conflict = allShortcuts.value.find(
    s =>
      s.id !== shortcut.id &&
      (customShortcuts.value.get(s.id) || s.key) === currentKey
  );
  return conflict?.description || '';
};

const startRecording = (shortcut: ShortcutConfig) => {
  recordingId.value = shortcut.id;
};

const cancelRecording = () => {
  recordingId.value = null;
};

const resetShortcut = (shortcut: ShortcutConfig) => {
  customShortcuts.value.delete(shortcut.id);
};

const resetAllShortcuts = () => {
  customShortcuts.value.clear();
};

const saveSettings = () => {
  const updated = allShortcuts.value.map(s => ({
    ...s,
    key: customShortcuts.value.get(s.id) || s.key,
  }));
  emit('settings-change', updated);
  settingsVisible.value = false;
};

// 检查目标元素是否可编辑
const isEditableElement = (target: HTMLElement): boolean => {
  const tagName = target.tagName;
  const editable = target.getAttribute('contenteditable');
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    editable === 'true'
  );
};

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement;
  const isEditing = isEditableElement(target);

  // 显示/隐藏快捷键提示 (仅在非编辑状态下)
  if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
    if (isEditing) return;
    event.preventDefault();
    toggleHint();
    return;
  }

  // ESC 关闭提示
  if (event.key === 'Escape' && hintVisible.value) {
    hideHint();
    return;
  }

  // 录制模式
  if (recordingId.value) {
    event.preventDefault();
    const keys: string[] = [];
    if (event.ctrlKey) keys.push('Ctrl');
    if (event.metaKey) keys.push('Cmd');
    if (event.altKey) keys.push('Alt');
    if (event.shiftKey) keys.push('Shift');
    if (!['Control', 'Meta', 'Alt', 'Shift'].includes(event.key)) {
      keys.push(event.key.length === 1 ? event.key.toUpperCase() : event.key);
    }
    
    if (keys.length > 0) {
      customShortcuts.value.set(recordingId.value, keys.join('+'));
      recordingId.value = null;
    }
    return;
  }

  // 触发快捷键
  const keyCombo = [
    event.ctrlKey ? 'Ctrl' : '',
    event.metaKey ? 'Cmd' : '',
    event.altKey ? 'Alt' : '',
    event.shiftKey ? 'Shift' : '',
    event.key.length === 1 ? event.key.toUpperCase() : event.key,
  ]
    .filter(Boolean)
    .join('+');

  const shortcut = allShortcuts.value.find(s => {
    const currentKey = customShortcuts.value.get(s.id) || s.key;
    return currentKey === keyCombo;
  });

  if (shortcut) {
    // 在编辑状态下只允许特定快捷键
    if (isEditing) {
      const allowedInEdit = ['Ctrl+A', 'Ctrl+C', 'Ctrl+V', 'Ctrl+X', 'Ctrl+Z', 'Ctrl+Y'];
      if (!allowedInEdit.includes(keyCombo)) {
        return;
      }
    }
    event.preventDefault();
    emit('shortcut-trigger', shortcut);
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

defineExpose({
  showHint,
  hideHint,
  toggleHint,
  openSettings,
});
</script>

<style scoped>
.keyboard-shortcut {
  display: inline-flex;
}

.keyboard-shortcut-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.keyboard-shortcut-trigger:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

.keyboard-shortcut-hint {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  max-height: 80vh;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  z-index: var(--z-modal);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.shortcut-hint-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid hsl(var(--border));
}

.shortcut-hint-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--text));
}

.shortcut-hint-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.shortcut-hint-close:hover {
  background: hsl(var(--surface-hover));
  color: hsl(var(--text));
}

.shortcut-hint-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.shortcut-group {
  margin-bottom: 20px;
}

.shortcut-group:last-child {
  margin-bottom: 0;
}

.shortcut-group-title {
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--text-muted));
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: hsl(var(--surface-container-high));
  border-radius: 8px;
  transition: background 0.2s ease;
}

.shortcut-item:hover {
  background: hsl(var(--surface-hover));
}

.shortcut-description {
  font-size: 14px;
  color: hsl(var(--text));
}

.shortcut-hint-footer {
  padding: 12px 20px;
  border-top: 1px solid hsl(var(--border));
  display: flex;
  justify-content: center;
}

/* 设置面板样式 */
.shortcut-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shortcut-search {
  margin-bottom: 8px;
}

.shortcut-tabs {
  flex: 1;
}

.shortcut-settings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.shortcut-setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: hsl(var(--surface-container-high));
  border-radius: 10px;
  border: 1px solid transparent;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.shortcut-setting-item:hover {
  background: hsl(var(--surface-hover));
}

.shortcut-setting-item--conflict {
  border-color: hsl(var(--error) / 0.3);
  background: hsl(var(--error) / 0.05);
}

.shortcut-setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shortcut-setting-name {
  font-size: 14px;
  color: hsl(var(--text));
}

.shortcut-setting-conflict {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: hsl(var(--error));
}

.shortcut-setting-action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shortcut-recording {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  background: hsl(var(--primary) / 0.1);
  border: 1px solid hsl(var(--primary) / 0.3);
  border-radius: 8px;
}

.shortcut-recording-text {
  font-size: 13px;
  color: hsl(var(--primary));
  font-weight: 500;
}

.shortcut-recording-cancel {
  font-size: 12px;
  color: hsl(var(--text-muted));
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.shortcut-recording-cancel:hover {
  color: hsl(var(--error));
  background: hsl(var(--error) / 0.1);
}

.shortcut-reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.shortcut-reset-btn:hover {
  background: hsl(var(--surface-hover));
  color: hsl(var(--text));
}

.shortcut-settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid hsl(var(--border));
}

/* 动画 */
.shortcut-hint-enter-active,
.shortcut-hint-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.shortcut-hint-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95);
}

.shortcut-hint-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.98);
}
</style>
