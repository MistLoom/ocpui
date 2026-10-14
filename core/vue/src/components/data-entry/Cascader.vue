&lt;!--
级联选择器组件

## 组件说明
用于选择层级数据的级联选择器，支持点击或悬停展开，以及多选功能。

## 公开属性
- `modelValue` ((string | number)[], 可选): 绑定的值，默认为 []
- `options` (CascaderOption[], 可选): 选项列表，默认为 []
- `placeholder` (string, 可选): 占位符文本，默认为 '请选择'
- `disabled` (boolean, 可选): 是否禁用，默认为 false
- `loading` (boolean, 可选): 是否加载中，默认为 false
- `expandTrigger` ('click' | 'hover', 可选): 展开触发方式，默认为 'click'
- `changeOnSelect` (boolean, 可选): 是否在选择时触发变更，默认为 false
- `size` ('sm' | 'md' | 'lg', 可选): 组件尺寸，未设置时继承 FormItem/Form/容器密度
- `customClass` (string, 可选): 自定义类名

## 事件
- `update:modelValue` (value: (string | number)[]): 值变更时触发
- `change` (value: (string | number)[], selectedOptions: CascaderOption[]): 选择完成时触发
- `visible-change` (visible: boolean): 下拉菜单显示/隐藏时触发

## 使用方式
```vue
&lt;Cascader
  v-model="selectedValues"
  :options="options"
  placeholder="请选择"
  :expandTrigger="'click'"
  :changeOnSelect="false"
  @change="handleChange"
/&gt;
```

```ts
const options = [
  {
    label: '选项1',
    value: '1',
    children: [
      {
        label: '选项1-1',
        value: '1-1'
      },
      {
        label: '选项1-2',
        value: '1-2'
      }
    ]
  },
  {
    label: '选项2',
    value: '2'
  }
];
```
--&gt;
<template>
  <div ref="rootRef" :class="cascaderClass" v-bind="$attrs">
    <button
      ref="triggerRef"
      type="button"
      class="cascader-trigger"
      :disabled="disabled"
      :aria-expanded="visible"
      aria-haspopup="listbox"
      @click="handleToggle"
      @keydown="handleTriggerKeydown"
    >
      <span v-if="selectedLabels.length > 0" class="cascader-value">
        {{ selectedLabels.join(' / ') }}
      </span>
      <span v-else class="cascader-placeholder">{{ placeholder }}</span>
      <Icon name="arrow-down" :size="12" :class="{ 'cascader-arrow--open': visible }" />
    </button>
    
    <Teleport to="body">
      <Transition name="cascader">
        <div
          v-if="visible"
          ref="dropdownRef"
          class="cascader-dropdown"
          :style="floatingBaseStyle"
        >
          <div v-if="loading" class="cascader-loading">
            <span class="cascader-loading-spinner" />
            <span>{{ t('components.dataEntry.cascader.loading') }}</span>
          </div>
          <div v-else class="cascader-menus">
            <div
              v-for="(menu, menuIndex) in menus"
              :key="menuIndex"
              class="cascader-menu"
            >
              <div
                v-for="option in menu"
                :key="option.value"
                class="cascader-option"
                :class="{
                  'cascader-option--selected': isOptionSelected(option, menuIndex),
                  'cascader-option--disabled': option.disabled,
                  'cascader-option--has-children': option.children && option.children.length > 0
                }"
                @click="handleOptionClick(option, menuIndex)"
                @mouseenter="handleOptionHover(option, menuIndex)"
                @keydown="handleOptionKeydown(option, menuIndex, $event)"
                :tabindex="option.disabled ? -1 : 0"
                role="option"
                :aria-disabled="option.disabled"
              >
                <span class="cascader-option-label">{{ option.label }}</span>
                <Icon v-if="option.children && option.children.length > 0" name="arrow-right" :size="12" />
              </div>
              <div v-if="menu.length === 0" class="cascader-empty">
                {{ t('components.dataEntry.cascader.empty') }}
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch, toRef } from 'vue';
import { Icon } from '../utility';
import type { ComponentSize } from '@ocpui/vue/types';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useFloatingPosition } from '../composables/useFloatingPosition';
import { useComponentSize } from '../composables/useComponentSize';

const { uiT: t } = useUiT();

interface CascaderOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: CascaderOption[];
}

interface Props {
  modelValue?: (string | number)[];
  options?: CascaderOption[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  expandTrigger?: 'click' | 'hover';
  changeOnSelect?: boolean;
  size?: ComponentSize;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  options: () => [],
  placeholder: '请选择',
  disabled: false,
  loading: false,
  expandTrigger: 'click',
  changeOnSelect: false,
  size: undefined,
  customClass: '',
});

const resolvedSize = useComponentSize(toRef(props, 'size'));

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]];
  'change': [value: (string | number)[], selectedOptions: CascaderOption[]];
  'visible-change': [visible: boolean];
}>();

const rootRef = ref<HTMLElement>();
const triggerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const visible = ref(false);
const floatingBaseStyle = { position: 'fixed' as const };

const floating = useFloatingPosition({
  reference: rootRef,
  floating: dropdownRef,
  placement: 'bottom-start',
  matchWidth: true,
  offsetPx: 4,
});
const menus = ref<CascaderOption[][]>([props.options]);
const selectedValues = ref<(string | number)[]>([...props.modelValue]);
const selectedOptions = ref<CascaderOption[]>([]);

const cascaderClass = computed(() => {
  const classes = ['cascader', `cascader--${resolvedSize.value}`];
  if (props.disabled) {
    classes.push('cascader--disabled');
  }
  if (visible.value) {
    classes.push('cascader--focused');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const selectedLabels = computed(() => {
  return selectedOptions.value.map(opt => opt.label);
});

const isOptionSelected = (option: CascaderOption, menuIndex: number) => {
  return selectedValues.value[menuIndex] === option.value;
};

const handleToggle = () => {
  if (props.disabled) return;
  visible.value = !visible.value;
};

const handleTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleToggle();
  } else if (event.key === 'Escape') {
    visible.value = false;
  }
};

const handleOptionClick = (option: CascaderOption, menuIndex: number) => {
  if (option.disabled) return;
  
  selectedValues.value = selectedValues.value.slice(0, menuIndex);
  selectedOptions.value = selectedOptions.value.slice(0, menuIndex);
  
  selectedValues.value.push(option.value);
  selectedOptions.value.push(option);
  
  if (option.children && option.children.length > 0) {
    menus.value = menus.value.slice(0, menuIndex + 1);
    menus.value.push(option.children);
  } else {
    if (props.changeOnSelect || !option.children || option.children.length === 0) {
      emit('update:modelValue', [...selectedValues.value]);
      emit('change', [...selectedValues.value], [...selectedOptions.value]);
      visible.value = false;
    }
  }
};

const handleOptionHover = (option: CascaderOption, menuIndex: number) => {
  if (props.disabled || option.disabled || props.expandTrigger !== 'hover') return;
  
  if (option.children && option.children.length > 0) {
    menus.value = menus.value.slice(0, menuIndex + 1);
    menus.value.push(option.children);
  }
};

const handleOptionKeydown = (option: CascaderOption, menuIndex: number, event: KeyboardEvent) => {
  if (props.disabled || option.disabled) return;
  
  switch (event.key) {
    case 'Enter':
      event.preventDefault();
      handleOptionClick(option, menuIndex);
      break;
    case 'ArrowDown':
      event.preventDefault();
      // 实现向下导航逻辑
      break;
    case 'ArrowUp':
      event.preventDefault();
      // 实现向上导航逻辑
      break;
    case 'ArrowRight':
      event.preventDefault();
      if (option.children && option.children.length > 0) {
        menus.value = menus.value.slice(0, menuIndex + 1);
        menus.value.push(option.children);
      }
      break;
    case 'ArrowLeft':
      event.preventDefault();
      if (menuIndex > 0) {
        menus.value = menus.value.slice(0, menuIndex);
      }
      break;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (triggerRef.value && !triggerRef.value.contains(event.target as Node) &&
      dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    visible.value = false;
  }
};

const initSelectedOptions = () => {
  if (props.modelValue && props.modelValue.length > 0) {
    const findOptions = (options: CascaderOption[], values: (string | number)[], index: number): CascaderOption[] => {
      if (index >= values.length) return [];
      const option = options.find(opt => opt.value === values[index]);
      if (!option) return [];
      return [option, ...findOptions(option.children || [], values, index + 1)];
    };
    selectedOptions.value = findOptions(props.options, props.modelValue, 0);
  } else {
    selectedOptions.value = [];
  }
};

watch(visible, (val) => {
  emit('visible-change', val);
  
  if (val) {
    document.addEventListener('click', handleClickOutside);
    nextTick(() => {
      floating.start();
    });
  } else {
    document.removeEventListener('click', handleClickOutside);
    floating.stop();
  }
});

watch(() => props.modelValue, (val) => {
  if (val) {
    selectedValues.value = [...val];
    initSelectedOptions();
  } else {
    selectedValues.value = [];
    selectedOptions.value = [];
  }
}, { immediate: true });

watch(() => props.options, (val) => {
  menus.value = [val];
  initSelectedOptions();
}, { immediate: true });

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.cascader {
  position: relative;
  display: inline-block;
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.cascader-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 8px 12px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.cascader:hover:not(.cascader--disabled) .cascader-trigger {
  border-color: hsl(var(--border-hover));
}

.cascader--focused .cascader-trigger {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.cascader--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.cascader--sm .cascader-trigger {
  min-height: 32px;
  padding: 4px 10px;
}

.cascader--sm .cascader-value,
.cascader--sm .cascader-placeholder {
  font-size: 13px;
}

.cascader--lg .cascader-trigger {
  min-height: 48px;
  padding: 8px 14px;
}

.cascader--lg .cascader-value,
.cascader--lg .cascader-placeholder {
  font-size: 16px;
}

.cascader-value {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cascader-placeholder {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.cascader-arrow {
  margin-left: 8px;
  transition: transform 0.2s;
  color: hsl(var(--text-muted));
}

.cascader-arrow--open {
  transform: rotate(180deg);
}

.cascader-dropdown {
  position: fixed;
  z-index: var(--z-dropdown);
  display: flex;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  max-height: 320px;
  overflow: hidden;
}

.cascader-loading {
  padding: 32px;
  text-align: center;
  color: hsl(var(--text-muted));
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cascader-loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: cascader-spin 0.8s linear infinite;
}

@keyframes cascader-spin {
  to { transform: rotate(360deg); }
}

.cascader-menus {
  display: flex;
  min-width: 180px;
}

.cascader-menu {
  width: 180px;
  min-height: 100px;
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
  border-right: 1px solid hsl(var(--border));
}

.cascader-menu:last-child {
  border-right: none;
}

.cascader-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 4px;
  font-size: 14px;
  color: hsl(var(--text));
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), background-color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.cascader-option:last-child {
  margin-bottom: 0;
}

.cascader-option:hover:not(.cascader-option--disabled),
.cascader-option--selected {
  background: hsl(var(--surface-hover));
}

.cascader-option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cascader-option-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cascader-option--has-children :deep(.icon) {
  color: hsl(var(--text-muted));
}

.cascader-empty {
  padding: 32px;
  text-align: center;
  color: hsl(var(--text-muted));
  font-size: 14px;
}

.cascader-enter-active,
.cascader-leave-active {
  transition: opacity 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.cascader-enter-from,
.cascader-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
