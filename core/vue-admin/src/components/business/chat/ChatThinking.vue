<template>
  <div
    :class="[
      'chat-thinking',
      {
        'is-collapsed': isCollapsed,
        'is-streaming': isStreaming,
        'is-completed': !isStreaming && hasContent,
        'has-content': hasContent,
        'is-expanded': !isCollapsed && hasContent
      }
    ]"
  >
    <!-- 头部区域 - 核心交互入口 -->
    <div class="thinking-header" @click="toggleCollapse">
      <!-- 左侧：状态指示器 + 标签 -->
      <div class="header-left">
        <!-- 状态指示器 -->
        <div class="status-indicator" :class="{ 'is-animating': isStreaming }">
          <div class="indicator-core" />
          <div v-if="isStreaming" class="indicator-pulse" />
        </div>

        <!-- 标签信息 -->
        <div class="header-labels">
          <span class="thinking-label">{{ displayLabel }}</span>
          <span v-if="showElapsedTime" class="thinking-meta">
            {{ elapsedTimeText }}
          </span>
        </div>
      </div>

      <!-- 右侧：折叠指示器 -->
      <div v-if="hasContent" class="header-right">
        <div class="collapse-indicator" :class="{ 'is-collapsed': isCollapsed }">
          <Icon name="chevron-down" :size="14" />
        </div>
      </div>
    </div>

    <!-- 内容区域 - 可折叠 -->
    <Transition name="thinking-expand">
      <div v-if="!isCollapsed && hasContent" class="thinking-content">
        <!-- 思考文本容器 -->
        <div class="thinking-body">
          <div class="thinking-text-wrapper">
            <pre class="thinking-text">{{ displayText }}</pre>
            <span v-if="isStreaming" class="thinking-cursor" />
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="thinking-footer">
          <button class="footer-action" @click.stop="handleCopy">
            <Icon name="copy" :size="12" />
            <span>{{ copyLabel }}</span>
          </button>
          <button v-if="!isStreaming" class="footer-action" @click.stop="handleExport">
            <Icon name="download" :size="12" />
            <span>{{ exportLabel }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- 折叠状态预览 - 显示首行内容 -->
    <div v-if="isCollapsed && hasContent && previewText" class="thinking-preview">
      <span class="preview-line">{{ previewText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { Icon, toast, useUiT } from '@ocpui/vue';
const { uiT: t } = useUiT();

interface Props {
  text?: string;
  isStreaming?: boolean;
  defaultCollapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  isStreaming: false,
  defaultCollapsed: true
});

// 状态管理
const isCollapsed = ref(props.defaultCollapsed);
const elapsedMs = ref(0);
const copied = ref(false);
let timerInterval: ReturnType<typeof setInterval> | null = null;
let copiedTimer: ReturnType<typeof setTimeout> | null = null;

// 计算属性
const hasContent = computed(() => props.text.length > 0);

const displayLabel = computed(() => {
  if (props.isStreaming) return t('common.thinkingInProgress');
  return t('common.thoughtCompleted');
});

const copyLabel = computed(() => {
  return copied.value ? t('common.copied') : t('common.copy');
});

const exportLabel = computed(() => t('common.export'));

const showElapsedTime = computed(() => {
  return props.isStreaming || elapsedMs.value > 1000;
});

const elapsedTimeText = computed(() => {
  const seconds = Math.floor(elapsedMs.value / 1000);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
});

const displayText = computed(() => props.text);

const previewText = computed(() => {
  if (!props.text) return '';
  const firstLine = props.text.split('\n')[0].trim();
  const maxLength = 80;
  if (firstLine.length > maxLength) {
    return firstLine.slice(0, maxLength) + '...';
  }
  return firstLine;
});

// 方法
function toggleCollapse() {
  if (!hasContent.value) return;
  isCollapsed.value = !isCollapsed.value;
}

async function handleCopy() {
  if (!props.text) return;
  try {
    await navigator.clipboard.writeText(props.text);
    copied.value = true;
    toast.success(t('common.copied'));

    if (copiedTimer) clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    toast.error(t('common.copyFailed'));
  }
}

function handleExport() {
  if (!props.text) return;
  const blob = new Blob([props.text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  link.download = `thinking_${timestamp}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  toast.success(t('common.exported'));
}

// 监听流式状态变化
watch(() => props.isStreaming, (newVal) => {
  if (newVal) {
    // 开始思考：重置计时器，自动展开
    elapsedMs.value = 0;
    isCollapsed.value = false;
    timerInterval = setInterval(() => {
      elapsedMs.value += 100;
    }, 100);
  } else {
    // 思考完成：停止计时器，保持展开（用户可手动折叠）
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
}, { immediate: true });

// 监听文本变化，首次有内容时展开
watch(() => props.text, (newVal, oldVal) => {
  if (newVal && !oldVal && props.isStreaming) {
    isCollapsed.value = false;
  }
});

// 清理
onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (copiedTimer) clearTimeout(copiedTimer);
});

// 暴露方法
defineExpose({
  toggleCollapse,
  expand: () => { isCollapsed.value = false; },
  collapse: () => { isCollapsed.value = true; }
});
</script>

<style scoped>
/* ===== 基础容器 ===== */
.chat-thinking {
  --thinking-color: hsl(var(--primary));
  --thinking-bg: hsl(var(--primary) / 0.04);
  --thinking-border: hsl(var(--primary) / 0.12);
  --thinking-success: hsl(142 76% 36%);

  position: relative;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.chat-thinking.has-content {
  background: var(--thinking-bg);
  border-color: var(--thinking-border);
}

.chat-thinking.has-content:hover {
  border-color: hsl(var(--primary) / 0.2);
}

/* ===== 头部区域 - 核心交互 ===== */
.thinking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
  user-select: none;
  gap: 12px;
  border-radius: var(--radius-lg, 12px);
  transition: background-color 0.15s ease;
}

.thinking-header:hover {
  background: hsl(var(--primary) / 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

/* 状态指示器 - 简洁优雅 */
.status-indicator {
  position: relative;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.indicator-core {
  width: 8px;
  height: 8px;
  background: var(--thinking-color);
  border-radius: 50%;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.is-completed .indicator-core {
  background: var(--thinking-success);
}

.indicator-pulse {
  position: absolute;
  inset: 0;
  border: 2px solid hsl(var(--primary) / 0.25);
  border-radius: 50%;
  animation: pulse-ring 1.5s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

/* 头部标签 */
.header-labels {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.thinking-label {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--text));
  white-space: nowrap;
}

.thinking-meta {
  font-size: 12px;
  color: hsl(var(--text-muted));
  font-variant-numeric: tabular-nums;
}

/* 折叠指示器 */
.header-right {
  display: flex;
  align-items: center;
}

.collapse-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: hsl(var(--text-muted));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.collapse-indicator :deep(svg) {
  transition: transform 0.25s var(--ease-out, ease-out);
}

.collapse-indicator.is-collapsed :deep(svg) {
  transform: rotate(-90deg);
}

/* ===== 内容区域 ===== */
.thinking-content {
  overflow: hidden;
}

.thinking-body {
  padding: 0 14px 12px;
}

.thinking-text-wrapper {
  position: relative;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md, 8px);
  padding: 12px 14px;
}

.thinking-text {
  margin: 0;
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
  font-size: 13px;
  line-height: 1.7;
  color: hsl(var(--text));
  white-space: pre-wrap;
  word-break: break-word;
  tab-size: 2;
}

.thinking-cursor {
  display: inline-block;
  width: 2px;
  height: 1.3em;
  background: var(--thinking-color);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: cursor-blink 1s step-end infinite;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* ===== 底部操作栏 ===== */
.thinking-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px 12px;
}

.footer-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  font-size: 12px;
  color: hsl(var(--text-secondary));
  background: transparent;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.footer-action:hover {
  color: hsl(var(--text));
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
}

/* ===== 折叠预览 ===== */
.thinking-preview {
  padding: 0 14px 10px;
  margin-top: -4px;
}

.preview-line {
  font-size: 12px;
  color: hsl(var(--text-muted));
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

/* ===== 展开/折叠动画 ===== */
.thinking-expand-enter-active,
.thinking-expand-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  max-height: 600px;
}

.thinking-expand-enter-from,
.thinking-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

/* ===== 响应式适配 ===== */
@media (max-width: 640px) {
  .thinking-header {
    padding: 8px 12px;
  }

  .thinking-body {
    padding: 0 12px 10px;
  }

  .thinking-text-wrapper {
    padding: 10px 12px;
  }

  .thinking-text {
    font-size: 12px;
    line-height: 1.6;
  }

  .thinking-footer {
    padding: 0 12px 10px;
  }

  .thinking-preview {
    padding: 0 12px 8px;
  }
}

/* ===== 无障碍支持 ===== */
@media (prefers-reduced-motion: reduce) {
  .chat-thinking,
  .thinking-header,
  .collapse-indicator,
  .collapse-indicator :deep(svg),
  .footer-action {
    transition: none;
  }

  .indicator-pulse,
  .thinking-cursor {
    animation: none;
  }

  .thinking-expand-enter-active,
  .thinking-expand-leave-active {
    transition: none;
  }
}

/* 焦点状态 */
.thinking-header:focus-visible {
  outline: 2px solid hsl(var(--primary) / 0.5);
  outline-offset: -2px;
}

.footer-action:focus-visible {
  outline: 2px solid hsl(var(--primary) / 0.5);
  outline-offset: 2px;
}
</style>
