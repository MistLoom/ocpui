&lt;!--
Transfer 组件

功能：提供一个数据传输组件，用于在两个列表之间移动数据项

Props:
- modelValue: (string | number)[] - 绑定的目标键值数组，默认 []
- data: TransferOption[] - 数据源数组，默认 []
- targetKeys: (string | number)[] - 目标列表的键值数组，默认 []
- titles: [string, string] - 两个面板的标题，默认 ['源列表', '目标列表']
- filterable: boolean - 是否可过滤，默认 false
- filterPlaceholder: string - 过滤输入框的占位符，默认 '请输入搜索内容'
- filterMethod: (query: string, option: TransferOption) =&gt; boolean - 自定义过滤方法
- emptyText: string - 空状态文本，默认 '暂无数据'
- customClass: string - 自定义类名

Events:
- update:modelValue: (value: (string | number)[]) - 值变化时触发
- change: (targetKeys: (string | number)[], direction: 'left' | 'right', moveKeys: (string | number)[]) - 数据移动时触发

TransferOption 接口：
- key: string | number - 唯一标识
- label: string - 显示文本
- disabled?: boolean - 是否禁用
- [key: string]: any - 其他自定义属性

使用示例：
&lt;Transfer
  v-model="targetKeys"
  :data="data"
  :targetKeys="targetKeys"
  :titles="['可选', '已选']"
  filterable
/&gt;
&lt;Transfer
  v-model="targetKeys"
  :data="data"
  :targetKeys="targetKeys"
  :filterMethod="(query, item) =&gt; item.label.includes(query)"
/&gt;
--&gt;
<template>
  <div :class="transferClass" v-bind="$attrs" role="application" :aria-label="t('components.dataEntry.transfer.ariaLabel')">
    <div class="transfer-panel transfer-panel--source" role="listbox" :aria-label="t('components.dataEntry.transfer.sourceList')">
      <div class="transfer-panel-header">
        <Checkbox
          :modelValue="sourceAllChecked"
          :indeterminate="sourceIndeterminate"
          @update:modelValue="handleSourceCheckAll"
          :aria-label="t('components.dataEntry.transfer.selectAllSource', { checked: checkedSourceKeys.length, total: sourceData.length })"
        >
          {{ sourceTitle }}
          <span class="transfer-panel-count">({{ checkedSourceKeys.length }}/{{ sourceData.length }})</span>
        </Checkbox>
      </div>
      <div v-if="filterable" class="transfer-panel-filter">
        <Input
          v-model="sourceFilter"
          :placeholder="filterPlaceholder"
          clearable
          :aria-label="t('components.dataEntry.transfer.searchSource')"
        >
          <template #prefix>
            <Icon name="search" :size="14" />
          </template>
        </Input>
      </div>
      <div class="transfer-panel-body">
        <div v-if="filteredSourceData.length === 0" class="transfer-empty" aria-live="polite">
          {{ emptyText }}
        </div>
        <div
          v-for="item in filteredSourceData"
          :key="item.key"
          :ref="(el) => setSourceItemRef(el, item.key)"
          class="transfer-item"
          :class="{ 'transfer-item--checked': checkedSourceKeys.includes(item.key) }"
          @click="handleSourceCheck(item.key)"
          @keydown="handleSourceItemKeydown($event, item.key)"
          :tabindex="0"
          role="option"
          :aria-selected="checkedSourceKeys.includes(item.key)"
          :aria-disabled="item.disabled"
        >
          <Checkbox
            :modelValue="checkedSourceKeys.includes(item.key)"
            @update:modelValue="() => handleSourceCheck(item.key)"
            :disabled="item.disabled"
          >
            <slot name="item" :option="item">
              {{ item.label }}
            </slot>
          </Checkbox>
        </div>
      </div>
    </div>
    
    <div class="transfer-operations">
      <Button
        variant="primary"
        :disabled="checkedSourceKeys.length === 0"
        @click="handleMoveToTarget"
        :aria-label="t('components.dataEntry.transfer.moveToTarget')"
        tabindex="0"
      >
        <Icon name="arrow-right" :size="14" />
      </Button>
      <Button
        variant="primary"
        :disabled="checkedTargetKeys.length === 0"
        @click="handleMoveToSource"
        :aria-label="t('components.dataEntry.transfer.moveToSource')"
        tabindex="0"
      >
        <Icon name="arrow-left" :size="14" />
      </Button>
    </div>
    
    <div class="transfer-panel transfer-panel--target" role="listbox" :aria-label="t('components.dataEntry.transfer.targetList')">
      <div class="transfer-panel-header">
        <Checkbox
          :modelValue="targetAllChecked"
          :indeterminate="targetIndeterminate"
          @update:modelValue="handleTargetCheckAll"
          :aria-label="t('components.dataEntry.transfer.selectAllTarget', { checked: checkedTargetKeys.length, total: targetData.length })"
        >
          {{ targetTitle }}
          <span class="transfer-panel-count">({{ checkedTargetKeys.length }}/{{ targetData.length }})</span>
        </Checkbox>
      </div>
      <div v-if="filterable" class="transfer-panel-filter">
        <Input
          v-model="targetFilter"
          :placeholder="filterPlaceholder"
          clearable
          :aria-label="t('components.dataEntry.transfer.searchTarget')"
        >
          <template #prefix>
            <Icon name="search" :size="14" />
          </template>
        </Input>
      </div>
      <div class="transfer-panel-body">
        <div v-if="filteredTargetData.length === 0" class="transfer-empty" aria-live="polite">
          {{ emptyText }}
        </div>
        <div
          v-for="item in filteredTargetData"
          :key="item.key"
          :ref="(el) => setTargetItemRef(el, item.key)"
          class="transfer-item"
          :class="{ 'transfer-item--checked': checkedTargetKeys.includes(item.key) }"
          @click="handleTargetCheck(item.key)"
          @keydown="handleTargetItemKeydown($event, item.key)"
          :tabindex="0"
          role="option"
          :aria-selected="checkedTargetKeys.includes(item.key)"
          :aria-disabled="item.disabled"
        >
          <Checkbox
            :modelValue="checkedTargetKeys.includes(item.key)"
            @update:modelValue="() => handleTargetCheck(item.key)"
            :disabled="item.disabled"
          >
            <slot name="item" :option="item">
              {{ item.label }}
            </slot>
          </Checkbox>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type ComponentPublicInstance } from 'vue';
import Button from '../utility/Button.vue';
import Checkbox from './Checkbox.vue';
import Icon from '../utility/Icon.vue';
import Input from './Input.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface TransferOption {
  key: string | number;
  label: string;
  disabled?: boolean;
  [key: string]: any;
}

interface Props {
  modelValue?: (string | number)[];
  data?: TransferOption[];
  targetKeys?: (string | number)[];
  titles?: [string, string];
  filterable?: boolean;
  filterPlaceholder?: string;
  filterMethod?: (query: string, option: TransferOption) => boolean;
  emptyText?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  data: () => [],
  targetKeys: () => [],
  titles: () => ['源列表', '目标列表'],
  filterable: false,
  filterPlaceholder: '请输入搜索内容',
  filterMethod: undefined,
  emptyText: '暂无数据',
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]];
  'change': [targetKeys: (string | number)[], direction: 'left' | 'right', moveKeys: (string | number)[]];
}>();

const sourceFilter = ref('');
const targetFilter = ref('');
const checkedSourceKeys = ref<(string | number)[]>([]);
const checkedTargetKeys = ref<(string | number)[]>([]);
const sourceItemRefs = ref<Map<string | number, HTMLElement>>(new Map());
const targetItemRefs = ref<Map<string | number, HTMLElement>>(new Map());

const transferClass = computed(() => {
  const classes = ['transfer'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const sourceTitle = computed(() => props.titles[0]);
const targetTitle = computed(() => props.titles[1]);

const currentTargetKeys = computed(() => props.modelValue ?? props.targetKeys);

const sourceData = computed(() => {
  return props.data.filter(item => !currentTargetKeys.value.includes(item.key));
});

const targetData = computed(() => {
  return props.data.filter(item => currentTargetKeys.value.includes(item.key));
});

const filteredSourceData = computed(() => {
  if (!props.filterable || !sourceFilter.value) return sourceData.value;
  
  if (props.filterMethod) {
    return sourceData.value.filter(item => props.filterMethod!(sourceFilter.value, item));
  }
  
  return sourceData.value.filter(item =>
    item.label.toLowerCase().includes(sourceFilter.value.toLowerCase())
  );
});

const filteredTargetData = computed(() => {
  if (!props.filterable || !targetFilter.value) return targetData.value;
  
  if (props.filterMethod) {
    return targetData.value.filter(item => props.filterMethod!(targetFilter.value, item));
  }
  
  return targetData.value.filter(item =>
    item.label.toLowerCase().includes(targetFilter.value.toLowerCase())
  );
});

const sourceAllChecked = computed(() => {
  return filteredSourceData.value.length > 0 &&
    filteredSourceData.value.every(item => checkedSourceKeys.value.includes(item.key));
});

const sourceIndeterminate = computed(() => {
  return !sourceAllChecked.value &&
    filteredSourceData.value.some(item => checkedSourceKeys.value.includes(item.key));
});

const targetAllChecked = computed(() => {
  return filteredTargetData.value.length > 0 &&
    filteredTargetData.value.every(item => checkedTargetKeys.value.includes(item.key));
});

const targetIndeterminate = computed(() => {
  return !targetAllChecked.value &&
    filteredTargetData.value.some(item => checkedTargetKeys.value.includes(item.key));
});

const handleSourceCheck = (key: string | number) => {
  const index = checkedSourceKeys.value.indexOf(key);
  if (index > -1) {
    checkedSourceKeys.value.splice(index, 1);
  } else {
    const item = props.data.find(item => item.key === key);
    if (!item?.disabled) {
      checkedSourceKeys.value.push(key);
    }
  }
};

const handleTargetCheck = (key: string | number) => {
  const index = checkedTargetKeys.value.indexOf(key);
  if (index > -1) {
    checkedTargetKeys.value.splice(index, 1);
  } else {
    const item = props.data.find(item => item.key === key);
    if (!item?.disabled) {
      checkedTargetKeys.value.push(key);
    }
  }
};

const setSourceItemRef = (el: Element | ComponentPublicInstance | null, key: string | number) => {
  if (el instanceof HTMLElement) {
    sourceItemRefs.value.set(key, el);
  } else {
    sourceItemRefs.value.delete(key);
  }
};

const setTargetItemRef = (el: Element | ComponentPublicInstance | null, key: string | number) => {
  if (el instanceof HTMLElement) {
    targetItemRefs.value.set(key, el);
  } else {
    targetItemRefs.value.delete(key);
  }
};

const getEnabledIndex = (list: TransferOption[], start: number, step: -1 | 1): number => {
  let index = start;
  while (index >= 0 && index < list.length) {
    if (!list[index].disabled) return index;
    index += step;
  }
  return -1;
};

const focusListItem = (
  list: TransferOption[],
  currentKey: string | number,
  refsMap: Map<string | number, HTMLElement>,
  step: -1 | 1
) => {
  if (list.length === 0) return;
  const currentIndex = list.findIndex((item) => item.key === currentKey);
  const startIndex = currentIndex < 0 ? (step === 1 ? 0 : list.length - 1) : currentIndex + step;
  const nextIndex = getEnabledIndex(list, startIndex, step);
  if (nextIndex < 0) return;
  const next = list[nextIndex];
  refsMap.get(next.key)?.focus();
};

const focusListBoundary = (
  list: TransferOption[],
  refsMap: Map<string | number, HTMLElement>,
  fromStart: boolean
) => {
  if (list.length === 0) return;
  const index = getEnabledIndex(list, fromStart ? 0 : list.length - 1, fromStart ? 1 : -1);
  if (index < 0) return;
  refsMap.get(list[index].key)?.focus();
};

const handleSourceItemKeydown = (event: KeyboardEvent, key: string | number) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      handleSourceCheck(key);
      break;
    case 'ArrowDown':
      event.preventDefault();
      focusListItem(filteredSourceData.value, key, sourceItemRefs.value, 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusListItem(filteredSourceData.value, key, sourceItemRefs.value, -1);
      break;
    case 'Home':
      event.preventDefault();
      focusListBoundary(filteredSourceData.value, sourceItemRefs.value, true);
      break;
    case 'End':
      event.preventDefault();
      focusListBoundary(filteredSourceData.value, sourceItemRefs.value, false);
      break;
  }
};

const handleTargetItemKeydown = (event: KeyboardEvent, key: string | number) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      handleTargetCheck(key);
      break;
    case 'ArrowDown':
      event.preventDefault();
      focusListItem(filteredTargetData.value, key, targetItemRefs.value, 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusListItem(filteredTargetData.value, key, targetItemRefs.value, -1);
      break;
    case 'Home':
      event.preventDefault();
      focusListBoundary(filteredTargetData.value, targetItemRefs.value, true);
      break;
    case 'End':
      event.preventDefault();
      focusListBoundary(filteredTargetData.value, targetItemRefs.value, false);
      break;
  }
};

const handleSourceCheckAll = (checked: boolean | (string | number)[]) => {
  const isChecked = Array.isArray(checked) ? checked.length > 0 : checked;
  if (isChecked) {
    checkedSourceKeys.value = filteredSourceData.value.filter(item => !item.disabled).map(item => item.key);
  } else {
    checkedSourceKeys.value = [];
  }
};

const handleTargetCheckAll = (checked: boolean | (string | number)[]) => {
  const isChecked = Array.isArray(checked) ? checked.length > 0 : checked;
  if (isChecked) {
    checkedTargetKeys.value = filteredTargetData.value.filter(item => !item.disabled).map(item => item.key);
  } else {
    checkedTargetKeys.value = [];
  }
};

const handleMoveToTarget = () => {
  const enabledKeys = checkedSourceKeys.value.filter(key => {
    const item = props.data.find(item => item.key === key);
    return !item?.disabled;
  });
  
  const newTargetKeys = [...currentTargetKeys.value, ...enabledKeys];
  emit('update:modelValue', newTargetKeys);
  emit('change', newTargetKeys, 'right', [...enabledKeys]);
  checkedSourceKeys.value = [];
};

const handleMoveToSource = () => {
  const enabledKeys = checkedTargetKeys.value.filter(key => {
    const item = props.data.find(item => item.key === key);
    return !item?.disabled;
  });
  
  const newTargetKeys = currentTargetKeys.value.filter(key => !enabledKeys.includes(key));
  emit('update:modelValue', newTargetKeys);
  emit('change', newTargetKeys, 'left', [...enabledKeys]);
  checkedTargetKeys.value = [];
};

// 监听外部值变化
watch(() => props.modelValue, () => {
  checkedSourceKeys.value = [];
  checkedTargetKeys.value = [];
});

watch(() => props.targetKeys, () => {
  checkedSourceKeys.value = [];
  checkedTargetKeys.value = [];
});

watch(() => props.data, () => {
  checkedSourceKeys.value = [];
  checkedTargetKeys.value = [];
}, { deep: true });

// 监听过滤条件变化时重置选中状态
watch(sourceFilter, () => {
  checkedSourceKeys.value = [];
});

watch(targetFilter, () => {
  checkedTargetKeys.value = [];
});
</script>

<style scoped>
.transfer {
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.transfer-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  overflow: hidden;
  background: hsl(var(--surface));
}

.transfer-panel-header {
  padding: 12px 16px;
  background: hsl(var(--surface-inset));
  border-bottom: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
}

.transfer-panel-count {
  margin-left: 4px;
  font-size: 13px;
  color: hsl(var(--text-muted));
}

.transfer-panel-filter {
  padding: 12px 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.transfer-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  min-height: 200px;
  max-height: 300px;
}

.transfer-empty {
  padding: 32px;
  text-align: center;
  color: hsl(var(--text-muted));
  font-size: 14px;
}

.transfer-item {
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.transfer-item:last-child {
  margin-bottom: 0;
}

.transfer-item:hover {
  background: hsl(var(--surface-hover));
}

.transfer-item--checked {
  background: hsl(var(--primary) / 0.1);
}

.transfer-operations {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transfer-operations button {
  min-width: 32px;
  padding: 8px;
}

@media (max-width: 768px) {
  .transfer {
    flex-direction: column;
  }
  
  .transfer-operations {
    flex-direction: row;
  }
}
</style>
