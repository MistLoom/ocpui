<template>
  <div :class="dropdownClass" v-bind="$attrs">
    <PopupPanel
      ref="popupPanelRef"
      v-model="visible"
      :trigger="trigger"
      :placement="placement"
      :disabled="disabled"
      :loading="loading"
      :empty-text="emptyText"
      :close-on-click-outside="true"
      custom-class="dropdown-popup-panel"
      @open="handleOpen"
      @close="handleClose"
    >
      <template #trigger>
        <div 
          ref="triggerRef"
          class="dropdown-trigger" 
          role="button"
          tabindex="0"
          aria-haspopup="menu"
          :aria-expanded="visible"
          :aria-controls="visible ? menuId : undefined"
          @keydown="handleTriggerKeydown"
        >
          <slot name="trigger">
            <Button variant="secondary">
              {{ triggerText }}
            </Button>
          </slot>
        </div>
      </template>

      <!-- 菜单内容 -->
      <template #default="{ close }">
        <div
          :id="menuId"
          ref="menuRef"
          :class="menuClass"
          role="menu"
        >
          <!-- 优先渲染 menu 插槽，其次默认插槽，最后 items 配置 -->
          <slot name="menu" :close="close">
            <slot :close="close">
              <div v-if="loading" class="dropdown-loading">
                <span class="dropdown-loading-spinner" />
                <span>{{ loadingText }}</span>
              </div>
              <div v-else-if="items.length === 0 && !$slots.default" class="dropdown-empty">
                {{ emptyText }}
              </div>
              <template v-else>
                <div class="dropdown-items">
                  <DropdownItem
                    v-for="(item, index) in items"
                    :key="item.key || index"
                    :label="item.label"
                    :icon="item.icon"
                    :iconSvg="item.iconSvg"
                    :disabled="item.disabled"
                    :divided="item.divided"
                    :checked="item.checked"
                    :danger="item.danger"
                    :command="item.key"
                    @click="() => handleItemClick(item, index)"
                  />
                </div>
              </template>
            </slot>
          </slot>
        </div>
      </template>
    </PopupPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { Button } from '../utility';
import { PopupPanel } from '@ocpui/vue/feedback';
import DropdownItem from './DropdownItem.vue';

/**
 * 下拉菜单组件，用于显示操作菜单
 * 
 * @props items - 菜单项数组
 * @props trigger - 触发方式，可选 'click' 或 'hover'，默认为 'click'
 * @props placement - 菜单位置，默认为 'bottom'
 * @props disabled - 是否禁用，默认为 false
 * @props hideOnClick - 点击后是否隐藏，默认为 true
 * @props loading - 是否加载中，默认为 false
 * @props emptyText - 空状态文本，默认为 '暂无数据'
 * @props triggerText - 触发按钮文本，默认为 '操作'
 * @props customClass - 自定义类名
 * 
 * @emits visible-change - 菜单显示状态变化时触发
 * @emits select - 选择菜单项时触发
 * @emits click - 点击菜单项时触发
 * 
 * @close-methods 关闭面板的方式
 * 1. 点击菜单项自动关闭（DropdownItem 内置关闭功能）
 * 2. 点击外部区域自动关闭
 * 3. 按 Escape 键关闭
 * 4. 使用 slot props 中的 close 函数手动关闭
 * 5. 调用组件实例的 hide() 方法关闭
 * 
 * @usage
 * <Dropdown :items="[
 *   { label: '选项1', key: '1' },
 *   { label: '选项2', key: '2' }
 * ]" />
 * 
 * <Dropdown>
 *   <template #default="{ close }">
 *     <div @click="close">点击关闭</div>
 *   </template>
 * </Dropdown>
 */

type DropdownPlacement = 'bottom' | 'bottom-start' | 'bottom-end' | 'bottom-left' | 'bottom-right' | 'top' | 'top-start' | 'top-end' | 'top-left' | 'top-right' | 'left' | 'right';
type DropdownTrigger = 'click' | 'hover';

export interface DropdownItem {
  key?: string | number;
  label: string;
  icon?: string;
  iconSvg?: string;
  disabled?: boolean;
  divided?: boolean;
  checked?: boolean;
  danger?: boolean;
  handler?: () => void;
}

interface Props {
  items?: DropdownItem[];
  trigger?: DropdownTrigger;
  placement?: DropdownPlacement;
  disabled?: boolean;
  hideOnClick?: boolean;
  loading?: boolean;
  emptyText?: string;
  loadingText?: string;
  triggerText?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  trigger: 'click',
  placement: 'bottom',
  disabled: false,
  hideOnClick: true,
  loading: false,
  emptyText: '暂无数据',
  loadingText: '加载中...',
  triggerText: '操作',
  customClass: '',
});

// i18n 加载中文本，支持 cms 命名空间回退到硬编码中文
const { te, uiT: t } = useUiT();
const loadingText = computed(() => {
  // 优先使用 cms 命名空间的 i18n key（cms:dropdown.loading）
  // 若未定义，回退到 props.loadingText
  const key = 'cms:dropdown.loading';
  try {
    if (te(key)) {
      return t(key);
    }
  } catch {
    // i18n 未初始化或 key 不存在
  }
  return props.loadingText;
});

const emit = defineEmits<{
  'visible-change': [visible: boolean];
  'select': [item: DropdownItem, index: number];
  'click': [item: DropdownItem, index: number];
}>();

const popupPanelRef = ref<InstanceType<typeof PopupPanel>>();
const triggerRef = ref<HTMLElement>();
const menuRef = ref<HTMLElement>();
const visible = ref(false);
const menuId = useComponentId('dropdown-menu');

const dropdownClass = computed(() => {
  const classes = ['dropdown'];
  if (props.disabled) {
    classes.push('dropdown--disabled');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const menuClass = computed(() => {
  const classes = ['dropdown-menu'];
  return classes.join(' ');
});

const handleTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    popupPanelRef.value?.toggle();
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    popupPanelRef.value?.show();
  } else if (event.key === 'Escape') {
    visible.value = false;
    triggerRef.value?.focus();
  }
};

const handleItemClick = (item: DropdownItem, index: number) => {
  if (item.disabled) return;

  emit('click', item, index);
  emit('select', item, index);

  if (item.handler) {
    item.handler();
  }
};

const handleOpen = () => {
  nextTick(() => {
    const firstItem = menuRef.value?.querySelector<HTMLElement>('[role="menuitem"][tabindex="0"]');
    firstItem?.focus();
  });
};

const handleClose = () => {
  nextTick(() => {
    triggerRef.value?.focus();
  });
};

watch(visible, (val) => {
  emit('visible-change', val);
});

const show = () => {
  popupPanelRef.value?.show();
};

const hide = () => {
  visible.value = false;
};

defineExpose({
  show,
  hide,
  visible,
});
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

.dropdown--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.dropdown-trigger {
  display: inline-block;
}

/* PopupPanel 样式覆盖 */
:deep(.dropdown-popup-panel) {
  z-index: var(--z-dropdown);
  overflow-y: auto;
  border-radius: 12px;
  padding: 4px;
  max-height: 300px;
}

.dropdown-menu {
  /* 样式由PopupPanel提供 */
}

.dropdown-loading,
.dropdown-empty {
  padding: 16px;
  text-align: center;
  color: hsl(var(--text-muted));
  font-size: 14px;
}

.dropdown-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.dropdown-loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: dropdown-spin 0.8s linear infinite;
}

@keyframes dropdown-spin {
  to { transform: rotate(360deg); }
}

.dropdown-items {
  margin: 0;
  padding: 0;
}

/* 响应式样式 */
@media (max-width: 639.98px) {
  :deep(.dropdown-popup-panel) {
    border-radius: 8px;
    min-width: 200px;
  }

  .dropdown-loading,
  .dropdown-empty {
    padding: 12px;
    font-size: 14px;
  }
  
  .dropdown-loading-spinner {
    width: 14px;
    height: 14px;
  }
}

/* 平板设备响应式调整 */
@media (min-width: 640px) and (max-width: 1023px) {
  :deep(.dropdown-popup-panel) {
    min-width: 240px;
  }
  
  .dropdown-item {
    padding: 11px 13px;
  }
}

/* 暗色模式 - 主题变量已经自动处理，无需硬编码 */
</style>
