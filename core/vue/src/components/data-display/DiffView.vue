<!--
DiffView 差异对比组件

## 组件说明
差异对比组件，用于展示两个值之间的差异，支持对象/数组和简单值的对比

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| before | unknown | undefined | 变更前的值 |
| after | unknown | undefined | 变更后的值 |
| beforeLabel | string | '变更前' | 变更前的标签 |
| afterLabel | string | '变更后' | 变更后的标签 |
| showHeader | boolean | true | 是否显示头部 |
| showStats | boolean | true | 是否显示统计信息 |
| mode | 'split' \| 'unified' | 'split' | 显示模式 |
| customClass | string | '' | 自定义类名 |

## 事件
无

## 使用示例
```vue
<template>
  <DiffView
    :before="oldData"
    :after="newData"
    :showHeader="true"
    :showStats="true"
    mode="split"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DiffView from './DiffView.vue';

const oldData = ref({
  name: '张三',
  age: 20,
  address: '北京市'
});

const newData = ref({
  name: '张三',
  age: 21,
  address: '上海市',
  email: 'zhangsan@example.com'
});
</script>
```
-->
<template>
  <div :class="diffViewClass" v-bind="$attrs">
    <div v-if="showHeader" class="diff-header">
      <span class="diff-label diff-label--before">{{ beforeLabel }}</span>
      <span class="diff-label diff-label--after">{{ afterLabel }}</span>
    </div>
    
    <div class="diff-content">
      <!-- 对象/数组对比 -->
      <template v-if="isObjectOrArray">
        <div 
          v-for="(change, index) in changes" 
          :key="index"
          :class="['diff-item', `diff-item--${change.type}`]"
        >
          <div class="diff-item-path" v-if="change.path">
            <span class="path-text">{{ change.path }}</span>
          </div>
          
          <div class="diff-item-values">
            <div class="diff-value diff-value--before">
              <span v-if="change.type === 'added'" class="diff-placeholder">-</span>
              <span v-else class="value-text">{{ formatValue(change.oldValue) }}</span>
            </div>
            
            <div class="diff-divider">
              <Icon name="arrow-right" :size="14" />
            </div>
            
            <div class="diff-value diff-value--after">
              <span v-if="change.type === 'removed'" class="diff-placeholder">-</span>
              <span v-else class="value-text">{{ formatValue(change.newValue) }}</span>
            </div>
          </div>
        </div>
      </template>
      
      <!-- 简单值对比 -->
      <template v-else>
        <div :class="['diff-item', `diff-item--${simpleChangeType}`]">
          <div class="diff-item-values">
            <div class="diff-value diff-value--before">
              <span class="value-text">{{ formatValue(before) }}</span>
            </div>
            
            <div class="diff-divider">
              <Icon name="arrow-right" :size="14" />
            </div>
            
            <div class="diff-value diff-value--after">
              <span class="value-text">{{ formatValue(after) }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
    
    <div v-if="showStats && changes.length > 0" class="diff-stats">
      <span class="stat-item stat-item--added">
        <span class="stat-dot" /> 新增 {{ addedCount }}
      </span>
      <span class="stat-item stat-item--removed">
        <span class="stat-dot" /> 删除 {{ removedCount }}
      </span>
      <span class="stat-item stat-item--modified">
        <span class="stat-dot" /> 修改 {{ modifiedCount }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '../utility';

type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

interface DiffChange {
  path?: string;
  oldValue: unknown;
  newValue: unknown;
  type: DiffType;
}

interface Props {
  before?: unknown;
  after?: unknown;
  beforeLabel?: string;
  afterLabel?: string;
  showHeader?: boolean;
  showStats?: boolean;
  mode?: 'split' | 'unified';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  before: undefined,
  after: undefined,
  beforeLabel: '变更前',
  afterLabel: '变更后',
  showHeader: true,
  showStats: true,
  mode: 'split',
  customClass: '',
});

const diffViewClass = computed(() => {
  const classes = ['diff-view'];
  classes.push(`diff-view--${props.mode}`);
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const isObjectOrArray = computed(() => {
  const beforeType = typeof props.before;
  const afterType = typeof props.after;
  return (
    (beforeType === 'object' && props.before !== null) ||
    (afterType === 'object' && props.after !== null)
  );
});

const simpleChangeType = computed((): DiffType => {
  if (props.before === undefined || props.before === null) return 'added';
  if (props.after === undefined || props.after === null) return 'removed';
  if (props.before === props.after) return 'unchanged';
  return 'modified';
});

const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const deepCompare = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  
  if (isArray(a) && isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepCompare(a[i], b[i])) return false;
    }
    return true;
  }
  
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key) || !deepCompare(a[key], b[key])) return false;
    }
    return true;
  }
  
  return false;
};

const changes = computed((): DiffChange[] => {
  if (!isObjectOrArray.value) {
    return [{
      oldValue: props.before,
      newValue: props.after,
      type: simpleChangeType.value,
    }];
  }

  const result: DiffChange[] = [];
  const beforeObj = (props.before || {}) as Record<string, unknown>;
  const afterObj = (props.after || {}) as Record<string, unknown>;
  
  const allKeys = new Set([
    ...Object.keys(beforeObj),
    ...Object.keys(afterObj),
  ]);

  allKeys.forEach(key => {
    const oldVal = beforeObj[key];
    const newVal = afterObj[key];
    
    if (!(key in beforeObj)) {
      result.push({
        path: key,
        oldValue: undefined,
        newValue: newVal,
        type: 'added',
      });
    } else if (!(key in afterObj)) {
      result.push({
        path: key,
        oldValue: oldVal,
        newValue: undefined,
        type: 'removed',
      });
    } else if (!deepCompare(oldVal, newVal)) {
      result.push({
        path: key,
        oldValue: oldVal,
        newValue: newVal,
        type: 'modified',
      });
    }
  });

  return result;
});

const addedCount = computed(() => 
  changes.value.filter(c => c.type === 'added').length
);

const removedCount = computed(() => 
  changes.value.filter(c => c.type === 'removed').length
);

const modifiedCount = computed(() => 
  changes.value.filter(c => c.type === 'modified').length
);

const formatValue = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '空';
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};
</script>

<style scoped>
.diff-view {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  overflow: hidden;
}

.diff-header {
  display: flex;
  padding: 12px 16px;
  background: hsl(var(--surface-container-high));
  border-bottom: 1px solid hsl(var(--border));
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--text-secondary));
}

.diff-label {
  flex: 1;
}

.diff-label--before {
  text-align: left;
}

.diff-label--after {
  text-align: right;
}

.diff-content {
  padding: 8px 0;
}

.diff-item {
  padding: 8px 16px;
  border-left: 3px solid transparent;
  transition: background-color 0.2s;
}

.diff-item:hover {
  background: hsl(var(--surface-container-high) / 0.5);
}

.diff-item--added {
  border-left-color: hsl(142 76% 36%);
  background: hsl(142 76% 36% / 0.05);
}

.diff-item--removed {
  border-left-color: hsl(0 84% 60%);
  background: hsl(0 84% 60% / 0.05);
}

.diff-item--modified {
  border-left-color: hsl(45 93% 47%);
  background: hsl(45 93% 47% / 0.05);
}

.diff-item-path {
  margin-bottom: 4px;
  font-size: 12px;
  color: hsl(var(--text-muted));
  font-weight: 500;
}

.path-text {
  font-family: 'JetBrains Mono', monospace;
}

.diff-item-values {
  display: flex;
  align-items: center;
  gap: 12px;
}

.diff-value {
  flex: 1;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  min-height: 32px;
  display: flex;
  align-items: center;
}

.diff-value--before {
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text));
}

.diff-value--after {
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text));
}

.diff-item--added .diff-value--after {
  background: hsl(142 76% 36% / 0.1);
  color: hsl(142 76% 36%);
}

.diff-item--removed .diff-value--before {
  background: hsl(0 84% 60% / 0.1);
  color: hsl(0 84% 60%);
  text-decoration: line-through;
}

.diff-item--modified .diff-value--before {
  background: hsl(45 93% 47% / 0.1);
  color: hsl(45 93% 47%);
}

.diff-item--modified .diff-value--after {
  background: hsl(45 93% 47% / 0.1);
  color: hsl(45 93% 47%);
}

.value-text {
  word-break: break-all;
}

.diff-placeholder {
  color: hsl(var(--text-muted));
  font-style: italic;
}

.diff-divider {
  color: hsl(var(--text-muted));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  flex-shrink: 0;
}

.diff-stats {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: hsl(var(--surface-container-high));
  border-top: 1px solid hsl(var(--border));
  font-size: 12px;
  color: hsl(var(--text-secondary));
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stat-item--added .stat-dot {
  background: hsl(142 76% 36%);
}

.stat-item--removed .stat-dot {
  background: hsl(0 84% 60%);
}

.stat-item--modified .stat-dot {
  background: hsl(45 93% 47%);
}

/* Unified mode styles */
.diff-view--unified .diff-item-values {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.diff-view--unified .diff-divider {
  display: none;
}

.diff-view--unified .diff-value {
  position: relative;
  padding-left: 20px;
}

.diff-view--unified .diff-value::before {
  position: absolute;
  left: 8px;
  font-weight: 600;
  font-size: 11px;
}

.diff-view--unified .diff-value--before::before {
  content: '-';
  color: hsl(0 84% 60%);
}

.diff-view--unified .diff-value--after::before {
  content: '+';
  color: hsl(142 76% 36%);
}

/* Responsive styles */
@media (max-width: 575.98px) {
  .diff-header {
    padding: 10px 12px;
    font-size: 12px;
  }
  
  .diff-item {
    padding: 6px 12px;
  }
  
  .diff-value {
    font-size: 12px;
    padding: 4px 8px;
    min-height: 28px;
  }
  
  .diff-item-path {
    font-size: 11px;
  }
  
  .diff-stats {
    padding: 10px 12px;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .diff-divider {
    width: 20px;
  }
}
</style>
