&lt;!--
KeyValueEditor 键值对编辑器组件

## 组件说明
用于编辑键值对数据的组件，支持添加、删除、验证等功能。

## 公开属性
- modelValue: KeyValuePair[] | Record&lt;string, string&gt; - 绑定值
- title: string - 标题
- keyLabel: string - 键标签，默认 "键"
- valueLabel: string - 值标签，默认 "值"
- keyPlaceholder: string - 键输入占位符，默认 "输入键"
- valuePlaceholder: string - 值输入占位符，默认 "输入值"
- addButtonText: string - 添加按钮文本，默认 "添加"
- emptyText: string - 空状态文本，默认 "暂无数据"
- validateUnique: boolean - 是否验证键唯一性，默认 true
- showHeader: boolean - 是否显示头部，默认 false
- showSeparator: boolean - 是否显示分隔符，默认 false
- autoGenerateKey: boolean - 是否自动生成键，默认 false
- customClass: string - 自定义类名

## 事件
- update:modelValue - 值变更时触发

## 接口
- KeyValuePair: { key: string; value: string } - 键值对接口

## 使用方式
```vue
&lt;KeyValueEditor v-model="keyValueData" :validateUnique="true" /&gt;
```
--&gt;
<template>
  <div :class="editorClass" role="form" :aria-label="t('components.dataEntry.keyValueEditor.ariaLabel')">
    <div v-if="title || showHeader" class="key-value-header">
      <span v-if="title" class="key-value-title">{{ title }}</span>
      <div v-else class="key-value-labels">
        <Typography variant="caption" class="key-value-label">{{ keyLabel }}</Typography>
        <Typography variant="caption" class="key-value-label">{{ valueLabel }}</Typography>
        <div class="key-value-actions" />
      </div>
      <Button
        variant="text"
        size="sm"
        @click="handleAdd"
        :aria-label="t('components.dataEntry.keyValueEditor.addPair', { type: addButtonText })"
      >
        <Icon name="plus" :size="14" />
        {{ addButtonText }}
      </Button>
    </div>
    
    <div class="key-value-list" role="list">
      <div
        v-for="(item, index) in displayItems"
        :key="index"
        class="key-value-item"
        role="listitem"
      >
        <div class="key-value-inputs">
          <Input
            v-model="item.key"
            :placeholder="keyPlaceholder"
            size="sm"
            class="key-value-input"
            @blur="validateKey(index)"
            :aria-label="t('components.dataEntry.keyValueEditor.keyLabel', { index: index + 1 })"
          />
          <span v-if="showSeparator" class="key-value-separator">:</span>
          <Input
            v-model="item.value"
            :placeholder="valuePlaceholder"
            size="sm"
            class="key-value-input"
            :aria-label="t('components.dataEntry.keyValueEditor.valueLabel', { index: index + 1 })"
          />
        </div>
        <Button
          variant="icon"
          size="sm"
          class="key-value-delete"
          @click="handleRemove(index)"
          :aria-label="t('components.dataEntry.keyValueEditor.deletePair', { index: index + 1 })"
        >
          <Icon name="trash-2" :size="14" />
        </Button>
      </div>
      
      <Empty
        v-if="displayItems.length === 0"
        :description="emptyText"
        :image-size="60"
      />
    </div>
    
    <Alert v-if="error" type="error" class="key-value-error" role="alert">
      {{ error }}
    </Alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Input from './Input.vue';
import { Button, Icon, Empty, Typography } from '../utility';
import { Alert } from '../feedback';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

export interface KeyValuePair {
  key: string;
  value: string;
}

interface Props {
  // 数据属性
  modelValue: KeyValuePair[] | Record<string, string>;
  
  // 显示属性
  title?: string;
  keyLabel?: string;
  valueLabel?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addButtonText?: string;
  emptyText?: string;
  
  // 功能属性
  validateUnique?: boolean;
  showHeader?: boolean;
  showSeparator?: boolean;
  autoGenerateKey?: boolean;
  
  // 样式属性
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  keyLabel: '键',
  valueLabel: '值',
  keyPlaceholder: '输入键',
  valuePlaceholder: '输入值',
  addButtonText: '添加',
  emptyText: '暂无数据',
  validateUnique: true,
  showHeader: false,
  showSeparator: false,
  autoGenerateKey: false,
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: KeyValuePair[] | Record<string, string>];
}>();

// 内部状态
const localItems = ref<KeyValuePair[]>([]);
const error = ref('');

// 计算属性
const editorClass = computed(() => {
  const classes = ['key-value-editor'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const displayItems = computed(() => {
  return localItems.value;
});

// 数据转换
const syncLocalItems = () => {
  if (Array.isArray(props.modelValue)) {
    localItems.value = [...props.modelValue];
  } else {
    localItems.value = Object.entries(props.modelValue).map(([key, value]) => ({ key, value }));
  }
};

const emitModelValue = () => {
  if (Array.isArray(props.modelValue)) {
    // 过滤掉空键的项目
    const filtered = localItems.value.filter(item => item.key.trim() !== '');
    emit('update:modelValue', [...filtered]);
  } else {
    const obj: Record<string, string> = {};
    localItems.value.forEach(item => {
      if (item.key) {
        obj[item.key] = item.value;
      }
    });
    emit('update:modelValue', obj);
  }
};

// 监听外部数据变化
watch(() => props.modelValue, () => {
  syncLocalItems();
  error.value = '';
}, { deep: true });

// 监听内部数据变化
watch(localItems, () => {
  emitModelValue();
}, { deep: true });

// 方法
const handleAdd = () => {
  let newKey = '';
  if (props.autoGenerateKey) {
    const existingKeys = localItems.value.map(item => item.key);
    let counter = 1;
    while (existingKeys.includes(`field_${counter}`)) {
      counter++;
    }
    newKey = `field_${counter}`;
  }
  localItems.value.push({ key: newKey, value: '' });
  error.value = '';
};

const handleRemove = (index: number) => {
  localItems.value.splice(index, 1);
  error.value = '';
  // 重新验证所有键
  localItems.value.forEach((_, i) => validateKey(i));
};

const validateKey = (index: number) => {
  if (!props.validateUnique) return;
  
  const currentKey = localItems.value[index]?.key?.trim();
  if (!currentKey) {
    error.value = '';
    return;
  }
  
  // 检查是否有重复的key
  const duplicates = localItems.value.filter((item, i) => 
    i !== index && item.key.trim() === currentKey
  );
  
  if (duplicates.length > 0) {
    error.value = `键 "${currentKey}" 已存在`;
  } else {
    error.value = '';
  }
};

// 初始化
syncLocalItems();
</script>

<style scoped>
.key-value-editor {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--surface-container-high));
  padding: 12px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.key-value-editor:hover {
  border-color: hsl(var(--border-hover));
}

.key-value-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid hsl(var(--border));
}

.key-value-title {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
}

.key-value-labels {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
  flex: 1;
}

.key-value-label {
  color: hsl(var(--text-secondary));
  font-weight: 500;
}

.key-value-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.key-value-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: hsl(var(--surface));
  border-radius: 6px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.key-value-item:hover {
  background: hsl(var(--surface-hover));
}

.key-value-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.key-value-input {
  flex: 1;
}

.key-value-separator {
  color: hsl(var(--text-muted));
  font-weight: 500;
  white-space: nowrap;
}

.key-value-delete {
  color: hsl(var(--text-muted));
  transition: color 0.2s ease;
}

.key-value-delete:hover {
  color: hsl(var(--error));
  background: hsl(var(--error) / 0.1);
}

.key-value-error {
  margin-top: 8px;
  font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 767.98px) {
  .key-value-editor {
    padding: 10px;
  }
  
  .key-value-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .key-value-labels {
    width: 100%;
  }
  
  .key-value-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .key-value-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .key-value-separator {
    display: none;
  }
  
  .key-value-delete {
    align-self: flex-end;
  }
}

@media (max-width: 575.98px) {
  .key-value-labels {
    grid-template-columns: 1fr 1fr;
  }
  
  .key-value-labels div:last-child {
    display: none;
  }
}
</style>
