<!--
Log 日志组件

## 组件说明
日志组件，用于显示和管理日志信息

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| lines | LogLine[] | [] | 日志行数据 |
| title | string | '' | 日志标题 |
| showLineNumber | boolean | false | 是否显示行号 |
| showTimestamp | boolean | false | 是否显示时间戳 |
| autoScroll | boolean | true | 是否自动滚动 |
| maxHeight | number | 400 | 最大高度 |
| emptyText | string | '暂无日志' | 空日志提示 |
| customClass | string | '' | 自定义类名 |

## 事件
| 事件名 | 参数 | 说明 |
|-------|------|------|
| clear | - | 清空日志事件 |
| download | - | 下载日志事件 |

## 暴露方法
| 方法名 | 说明 |
|-------|------|
| addLine | 添加日志行 |
| scrollToBottom | 滚动到底部 |
| logRef | 日志容器引用 |

## 使用示例
```vue
<template>
  <Log
    :lines="logLines"
    title="系统日志"
    :showTimestamp="true"
    :autoScroll="true"
    @clear="handleClear"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Log from './Log.vue';

const logLines = ref([
  { content: '系统启动', type: 'info', timestamp: new Date() },
  { content: '连接数据库成功', type: 'success', timestamp: new Date() },
  { content: '警告: 内存使用率过高', type: 'warning', timestamp: new Date() },
  { content: '错误: 无法连接到服务器', type: 'error', timestamp: new Date() },
]);

const handleClear = () => {
  logLines.value = [];
};
</script>
```
-->
<template>
  <div :class="logClass">
    <div v-if="title" class="log-header">
      <h3 class="log-title">{{ title }}</h3>
      <div class="log-actions">
        <button
          type="button"
          class="log-action-btn"
          @click="handleClear"
          :aria-label="t('components.dataDisplay.log.clear')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
        <button
          type="button"
          class="log-action-btn"
          @click="handleDownload"
          :aria-label="t('components.dataDisplay.log.download')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      </div>
    </div>
    <div ref="logRef" class="log-content">
      <div
        v-for="(line, index) in lines"
        :key="index"
        class="log-line"
        :class="`log-line--${line.type || 'default'}`"
      >
        <span v-if="showLineNumber" class="log-line-number">{{ index + 1 }}</span>
        <span v-if="showTimestamp && line.timestamp" class="log-timestamp">
          {{ formatTimestamp(line.timestamp) }}
        </span>
        <span class="log-text">{{ line.content }}</span>
      </div>
      <div v-if="lines.length === 0" class="log-empty">
        {{ displayEmptyText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

type LogType = 'default' | 'info' | 'success' | 'warning' | 'error';

interface LogLine {
  content: string;
  type?: LogType;
  timestamp?: Date | number;
}

interface Props {
  lines?: LogLine[];
  title?: string;
  showLineNumber?: boolean;
  showTimestamp?: boolean;
  autoScroll?: boolean;
  maxHeight?: number;
  emptyText?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  lines: () => [],
  title: '',
  showLineNumber: false,
  showTimestamp: false,
  autoScroll: true,
  maxHeight: 400,
  emptyText: undefined,
  customClass: '',
});

const emit = defineEmits<{
  clear: [];
  download: [];
}>();

const logRef = ref<HTMLElement>();

const displayEmptyText = computed(() =>
  props.emptyText ?? t('components.dataDisplay.log.empty', '暂无日志'),
);

const logClass = computed(() => {
  const classes = ['log'];
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const formatTimestamp = (timestamp: Date | number): string => {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${ms}`;
};

const scrollToBottom = () => {
  if (!logRef.value || !props.autoScroll) return;
  nextTick(() => {
    logRef.value!.scrollTop = logRef.value!.scrollHeight;
  });
};

const handleClear = () => {
  emit('clear');
};

const handleDownload = () => {
  const content = props.lines.map(line => line.content).join('\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `log-${Date.now()}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  emit('download');
};

const addLine = (line: LogLine) => {
  props.lines.push(line);
  scrollToBottom();
};

watch(() => props.lines.length, () => {
  scrollToBottom();
});

defineExpose({
  addLine,
  scrollToBottom,
  logRef,
});
</script>

<style scoped>
.log {
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  background: hsl(var(--surface-container-high));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  overflow: hidden;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: hsl(var(--surface));
  border-bottom: 1px solid hsl(var(--border));
}

.log-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--text));
}

.log-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.log-action-btn:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

.log-action-btn svg {
  width: 14px;
  height: 14px;
}

.log-content {
  max-height: v-bind('`${maxHeight}px`');
  overflow-y: auto;
  padding: 12px 16px;
}

.log-line {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 4px 0;
  font-size: 13px;
  line-height: 1.6;
  color: hsl(var(--text));
}

.log-line-number {
  flex-shrink: 0;
  width: 32px;
  color: hsl(var(--text-muted));
  text-align: right;
  user-select: none;
}

.log-timestamp {
  flex-shrink: 0;
  color: hsl(var(--text-muted));
  font-size: 12px;
}

.log-text {
  flex: 1;
  word-break: break-all;
}

.log-line--info {
  color: hsl(var(--info));
}

.log-line--success {
  color: hsl(var(--success));
}

.log-line--warning {
  color: hsl(var(--warning));
}

.log-line--error {
  color: hsl(var(--error));
}

.log-empty {
  padding: 40px 20px;
  text-align: center;
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.log-content::-webkit-scrollbar {
  width: 8px;
}

.log-content::-webkit-scrollbar-track {
  background: transparent;
}

.log-content::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 4px;
}

.log-content::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--border-hover));
}
</style>
