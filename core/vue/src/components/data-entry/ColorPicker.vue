&lt;!--
颜色选择器组件

## 组件说明
用于选择颜色的组件，支持预设颜色选择、RGB 值输入和十六进制颜色值输入。

## 公开属性
- `modelValue` (string, 可选): 绑定的颜色值，默认为 '#000000'
- `showText` (boolean, 可选): 是否显示颜色文本值，默认为 true
- `presetColors` (string[], 可选): 预设颜色列表
- `customClass` (string, 可选): 自定义类名

## 事件
- `update:modelValue` (value: string): 值变更时触发
- `change` (value: string): 确认变更时触发
- `clear` (): 清除颜色时触发

## 使用方式
```vue
&lt;ColorPicker
  v-model="color"
  :showText="true"
  @change="handleColorChange"
  @clear="handleClear"
/&gt;
```
--&gt;
<template>
  <div ref="rootRef" :class="colorPickerClass" v-bind="$attrs">
    <button
      ref="triggerRef"
      type="button"
      class="color-picker-trigger"
      :aria-expanded="visible"
      aria-haspopup="dialog"
      @click="handleToggle"
    >
      <span class="color-picker-preview" :style="{ backgroundColor: displayColor }" />
      <span v-if="showText" class="color-picker-value">{{ displayColor }}</span>
      <Icon name="arrow-down" :size="12" :class="{ 'color-picker-arrow--open': visible }" />
    </button>
    
    <Teleport to="body">
      <Transition name="color-picker">
        <div
          v-if="visible"
          ref="panelRef"
          class="color-picker-panel"
          :style="floatingBaseStyle"
        >
          <div class="color-picker-palette">
            <div
              v-for="color in presetColors"
              :key="color"
              class="color-picker-preset"
              :class="{ 'color-picker-preset--active': displayColor.toLowerCase() === color.toLowerCase() }"
              :style="{ backgroundColor: color }"
              @click="handlePresetClick(color)"
            />
          </div>
          
          <div class="color-picker-inputs">
            <div class="color-picker-input-group">
              <label>R</label>
              <input
                type="number"
                min="0"
                max="255"
                :value="rgb.r"
                @input="handleRgbInput('r', $event)"
              />
            </div>
            <div class="color-picker-input-group">
              <label>G</label>
              <input
                type="number"
                min="0"
                max="255"
                :value="rgb.g"
                @input="handleRgbInput('g', $event)"
              />
            </div>
            <div class="color-picker-input-group">
              <label>B</label>
              <input
                type="number"
                min="0"
                max="255"
                :value="rgb.b"
                @input="handleRgbInput('b', $event)"
              />
            </div>
          </div>
          
          <div class="color-picker-hex">
            <input
              type="text"
              :value="hexValue"
              @input="handleHexInput"
              placeholder="#000000"
            />
          </div>
          
          <div class="color-picker-actions">
            <Button size="sm" variant="text" @click="handleClear">{{ t('components.dataEntry.colorPicker.clear') }}</Button>
            <Button size="sm" @click="handleConfirm">{{ t('components.dataEntry.colorPicker.confirm') }}</Button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import { Button, Icon } from '../utility';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useFloatingPosition } from '../composables/useFloatingPosition';

const { uiT: t } = useUiT();

interface Props {
  modelValue?: string;
  showText?: boolean;
  presetColors?: string[];
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '#000000',
  showText: true,
  presetColors: () => [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#ffffff',
    '#ff0000', '#ff4d4f', '#ff7a45', '#ffa940', '#ffc53d', '#ffec3d', '#a0d911', '#52c41a', '#13c2c2',
    '#1890ff', '#2f54eb', '#722ed1', '#eb2f96', '#f759ab', '#ff9c6e', '#ffd591', '#fff566', '#b7eb8f',
  ],
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
  'clear': [];
}>();

const rootRef = ref<HTMLElement>();
const triggerRef = ref<HTMLElement>();
const panelRef = ref<HTMLElement>();
const visible = ref(false);
const internalValue = ref(props.modelValue || '#000000');
const floatingBaseStyle = { position: 'fixed' as const };

const floating = useFloatingPosition({
  reference: rootRef,
  floating: panelRef,
  placement: 'bottom-start',
  matchWidth: false,
  offsetPx: 4,
});

const colorPickerClass = computed(() => {
  const classes = ['color-picker'];
  if (visible.value) {
    classes.push('color-picker--focused');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const displayColor = computed(() => {
  return internalValue.value || '#000000';
});

const rgb = computed(() => {
  return hexToRgb(displayColor.value);
});

const hexValue = computed(() => {
  return displayColor.value.toUpperCase();
});

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const handleToggle = () => {
  visible.value = !visible.value;
};

const handlePresetClick = (color: string) => {
  internalValue.value = color;
};

const handleRgbInput = (channel: 'r' | 'g' | 'b', event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value) || 0;
  const clampedValue = Math.max(0, Math.min(255, value));
  const newRgb = { ...rgb.value, [channel]: clampedValue };
  internalValue.value = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
};

const handleHexInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    internalValue.value = value;
  }
};

const handleClear = () => {
  internalValue.value = '#000000';
  emit('clear');
};

const handleConfirm = () => {
  emit('update:modelValue', internalValue.value);
  emit('change', internalValue.value);
  visible.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (triggerRef.value && !triggerRef.value.contains(event.target as Node) &&
      panelRef.value && !panelRef.value.contains(event.target as Node)) {
    visible.value = false;
  }
};

watch(visible, (val) => {
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
    internalValue.value = val;
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.color-picker {
  position: relative;
  display: inline-block;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.color-picker-trigger {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 12px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), color 0.25s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
  text-align: left;
}

.color-picker:hover .color-picker-trigger {
  border-color: hsl(var(--border-hover));
}

.color-picker--focused .color-picker-trigger {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.color-picker-preview {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  flex-shrink: 0;
}

.color-picker-value {
  flex: 1;
  margin-left: 8px;
  font-size: 14px;
  color: hsl(var(--text));
  text-transform: uppercase;
}

.color-picker-arrow {
  margin-left: 8px;
  transition: transform 0.2s;
  color: hsl(var(--text-muted));
}

.color-picker-arrow--open {
  transform: rotate(180deg);
}

.color-picker-panel {
  position: fixed;
  z-index: var(--z-dropdown);
  width: 280px;
  padding: 16px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.color-picker-palette {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 6px;
  margin-bottom: 16px;
}

.color-picker-preset {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s, transform 0.2s;
}

.color-picker-preset:hover {
  transform: scale(1.1);
}

.color-picker-preset--active {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
}

.color-picker-inputs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.color-picker-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.color-picker-input-group label {
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--text-muted));
}

.color-picker-input-group input {
  width: 100%;
  height: 32px;
  padding: 4px 8px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  font-size: 13px;
  color: hsl(var(--text));
  text-align: center;
  outline: none;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.color-picker-input-group input:focus {
  border-color: hsl(var(--primary));
}

.color-picker-hex {
  margin-bottom: 16px;
}

.color-picker-hex input {
  width: 100%;
  height: 36px;
  padding: 8px 12px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  font-size: 14px;
  color: hsl(var(--text));
  text-transform: uppercase;
  outline: none;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.color-picker-hex input:focus {
  border-color: hsl(var(--primary));
}

.color-picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.color-picker-enter-active,
.color-picker-leave-active {
  transition: opacity 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.color-picker-enter-from,
.color-picker-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 响应式样式 */
@media (max-width: 575.98px) {
  .color-picker-trigger {
    min-height: 44px;
  }
  
  .color-picker-value {
    font-size: var(--font-size-sm);
  }
  
  .color-picker-panel {
    width: 90vw !important;
    max-width: 320px;
    margin: 0 auto;
    left: 50% !important;
    transform: translateX(-50%);
    border-radius: 12px;
    padding: 12px;
  }
  
  .color-picker-palette {
    grid-template-columns: repeat(8, 1fr);
    gap: 8px;
  }
  
  .color-picker-preset {
    width: 32px;
    height: 32px;
  }
  
  .color-picker-inputs {
    gap: 10px;
  }
  
  .color-picker-input-group input {
    height: 36px;
    font-size: var(--font-size-sm);
  }
  
  .color-picker-hex input {
    height: 40px;
    font-size: var(--font-size-sm);
  }
  
  .color-picker-actions {
    gap: 12px;
  }
}
</style>
