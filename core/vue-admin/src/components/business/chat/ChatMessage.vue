<template>
  <div
    :class="[
      'chat-message',
      `message-${role}`,
      { 'message-streaming': isStreaming, 'message-focused': isFocused }
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 身份区域 -->
    <div class="message-identity">
      <Avatar
        v-if="role === 'assistant'"
        :src="avatarSrc"
        :name="senderName"
        :icon="avatarIcon"
        size="md"
        shape="rounded"
        class="message-avatar"
      />
      <Avatar
        v-else
        :src="avatarSrc"
        :name="senderName"
        icon="user"
        size="md"
        shape="rounded"
        class="message-avatar message-avatar-user"
      />
    </div>

    <!-- 内容区域 -->
    <div class="message-body">
      <!-- 发送者信息 -->
      <div class="message-header">
        <span class="sender-name">{{ senderName }}</span>
        <span class="message-time">{{ formattedTime }}</span>
        <StatusTag
          v-if="messageStatus !== 'sent'"
          :status="statusTagType"
          size="sm"
          class="message-status"
        />
      </div>

      <!-- 思考过程 -->
      <ChatThinking
        v-if="role === 'assistant' && thinking"
        :text="thinking.text"
        :is-streaming="thinking.isStreaming"
        class="message-thinking"
      />

      <!-- 消息气泡 -->
      <div :class="['message-bubble', `bubble-${role}`]">
        <!-- 内容渲染 -->
        <div v-if="contentType === 'markdown'" class="message-markdown">
          <slot name="content">{{ content }}</slot>
        </div>
        <div v-else class="message-text">
          <slot>{{ content }}</slot>
        </div>

        <!-- 流式指示器 -->
        <div v-if="isStreaming" class="streaming-cursor">
          <span class="cursor-blink" />
        </div>
      </div>

      <!-- 附件列表 -->
      <div v-if="attachments && attachments.length > 0" class="message-attachments">
        <div
          v-for="attachment in attachments"
          :key="attachment.id"
          class="attachment-item"
          @click="handleAttachmentClick(attachment)"
        >
          <div class="attachment-icon">
            <Icon :name="getFileIcon(attachment.type)" :size="16" />
          </div>
          <div class="attachment-info">
            <span class="attachment-name">{{ attachment.name }}</span>
            <span class="attachment-size">{{ formatSize(attachment.size) }}</span>
          </div>
          <IconButton
            size="xs"
            variant="ghost"
            :title="t('components.business.chatMessage.download')"
            class="attachment-download"
            @click.stop="handleDownload(attachment)"
          >
            <Icon name="download" :size="14" />
          </IconButton>
        </div>
      </div>

      <!-- 操作栏 -->
      <Transition name="fade">
        <div v-if="showActions && !isStreaming" class="message-actions">
          <IconButton
            v-for="action in visibleActions"
            :key="action.name"
            size="xs"
            variant="ghost"
            :title="action.label"
            @click="handleAction(action)"
          >
            <Icon :name="action.icon" :size="14" />
          </IconButton>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Avatar, Icon, IconButton, StatusTag, useUiT, type StatusType } from '@ocpui/vue';
import ChatThinking from './ChatThinking.vue';

const { uiT: t } = useUiT();

// 附件接口
interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

// 思考过程接口
interface Thinking {
  text: string;
  isStreaming?: boolean;
}

// 操作接口
interface Action {
  name: string;
  icon: string;
  label: string;
  onClick?: () => void;
  visible?: boolean;
}

// 消息状态类型
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

// 组件属性
interface Props {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  contentType?: 'text' | 'markdown';
  time?: string | Date;
  isStreaming?: boolean;
  thinking?: Thinking;
  avatarSrc?: string;
  avatarIcon?: string;
  senderName?: string;
  attachments?: Attachment[];
  actions?: Action[];
  status?: MessageStatus;
  isFocused?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  contentType: 'text',
  time: () => new Date().toISOString(),
  isStreaming: false,
  avatarIcon: 'bot',
  attachments: () => [],
  actions: () => [],
  status: 'sent',
  isFocused: false,
});

// 发送者名称：优先使用传入值，否则按角色走 i18n 默认文案
const senderName = computed(() =>
  props.senderName ?? (props.role === 'user' ? t('common.user') : t('common.aiAssistant')),
);

// 事件定义
const emit = defineEmits<{
  action: [action: string, data: unknown];
  attachmentClick: [attachment: Attachment];
}>();

// 状态
const isHovered = ref(false);

// 计算属性
const showActions = computed(() => isHovered.value || props.isFocused);

const visibleActions = computed(() => {
  return props.actions.filter((action) => action.visible !== false);
});

const formattedTime = computed(() => {
  const date = new Date(props.time);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

const messageStatus = computed(() => props.status);

const statusTagType = computed((): StatusType => {
  const statusMap: Record<MessageStatus, StatusType> = {
    sending: 'sending',
    sent: 'sent',
    delivered: 'sent',
    read: 'sent',
    error: 'failed',
  };
  return statusMap[props.status];
});

// 方法
function handleMouseEnter() {
  isHovered.value = true;
}

function handleMouseLeave() {
  isHovered.value = false;
}

function handleAction(action: Action) {
  action.onClick?.();
  emit('action', action.name, { messageId: props.id });
}

function handleAttachmentClick(attachment: Attachment) {
  emit('attachmentClick', attachment);
}

function handleDownload(attachment: Attachment) {
  if (attachment.url) {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  }
  emit('action', 'download', { attachment });
}

function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type.includes('pdf') || type.includes('word') || type.includes('document') || type === 'txt') return 'file-text';
  if (type.includes('sheet') || type.includes('excel')) return 'table';
  if (type.includes('zip') || type.includes('rar') || type === 'archive') return 'archive';
  if (type === 'code' || type === 'json') return 'code';
  return 'file';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
</script>

<style scoped>
/* ========== 基础布局 ========== */
.chat-message {
  display: flex;
  gap: var(--space-3, 12px);
  padding: var(--space-3, 12px) 0 var(--space-10, 40px);
  animation: messageIn 0.3s var(--ease-out, ease-out);
  position: relative;
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 用户消息右对齐 */
.message-user {
  flex-direction: row-reverse;
}

/* ========== 身份区域 ========== */
.message-identity {
  flex-shrink: 0;
  padding-top: var(--space-1, 4px);
}

.message-avatar {
  transition: opacity 0.2s var(--ease-out, ease-out);
}

.message-avatar:hover {
  opacity: 0.9;
}

.message-avatar-user :deep(.avatar-inner) {
  background: hsl(var(--primary));
  color: hsl(var(--surface));
}

/* ========== 内容区域 ========== */
.message-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
  max-width: min(70%, 720px);
  min-width: 0;
  position: relative;
}

.message-user .message-body {
  align-items: flex-end;
}

.message-assistant .message-body {
  align-items: flex-start;
}

/* ========== 头部信息 ========== */
.message-header {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  padding: 0 var(--space-1, 4px);
}

.sender-name {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--text));
}

.message-time {
  font-size: 11px;
  color: hsl(var(--text-muted));
  font-weight: 400;
}

.message-status {
  font-size: 11px;
}

/* ========== 思考过程 ========== */
.message-thinking {
  width: 100%;
  margin-bottom: var(--space-1, 4px);
}

/* ========== 消息气泡 ========== */
.message-bubble {
  padding: var(--space-3, 12px) var(--space-4, 16px);
  border-radius: var(--radius-lg, 12px);
  position: relative;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  word-break: break-word;
  line-height: 1.6;
}

/* 用户气泡 */
.bubble-user {
  background: hsl(var(--primary));
  color: hsl(var(--surface));
  border-bottom-right-radius: var(--radius-sm, 4px);
  box-shadow: var(--shadow-sm);
}

.bubble-user:hover {
  box-shadow: var(--shadow-md);
}

/* 助手气泡 */
.bubble-assistant {
  background: hsl(var(--surface-elevated));
  border: 1px solid hsl(var(--border));
  border-bottom-left-radius: var(--radius-sm, 4px);
  box-shadow: var(--shadow-sm);
}

.bubble-assistant:hover {
  border-color: hsl(var(--border-hover));
  box-shadow: var(--shadow-md);
}

/* 消息文本 */
.message-text {
  font-size: 14px;
  white-space: pre-wrap;
}

.bubble-user .message-text {
  color: hsl(var(--surface));
}

.bubble-assistant .message-text {
  color: hsl(var(--text));
}

/* Markdown 内容 */
.message-markdown {
  font-size: 14px;
}

.message-markdown :deep(h1),
.message-markdown :deep(h2),
.message-markdown :deep(h3) {
  margin: var(--space-3, 12px) 0 var(--space-2, 8px);
  font-weight: 600;
  color: inherit;
  line-height: 1.4;
}

.message-markdown :deep(p) {
  margin: var(--space-2, 8px) 0;
}

.message-markdown :deep(code) {
  background: hsl(var(--primary) / 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.message-markdown :deep(pre) {
  background: hsl(var(--surface-inset));
  padding: var(--space-3, 12px);
  border-radius: var(--radius-md, 8px);
  overflow-x: auto;
  margin: var(--space-2, 8px) 0;
  border: 1px solid hsl(var(--border));
}

.message-markdown :deep(pre code) {
  background: none;
  padding: 0;
}

.message-markdown :deep(ul),
.message-markdown :deep(ol) {
  margin: var(--space-2, 8px) 0;
  padding-left: var(--space-5, 20px);
}

.message-markdown :deep(li) {
  margin: var(--space-1, 4px) 0;
}

/* 流式光标 */
.streaming-cursor {
  display: inline-flex;
  align-items: center;
  margin-left: var(--space-1, 4px);
}

.cursor-blink {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background: currentColor;
  animation: blink 1s infinite;
  opacity: 0.7;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* ========== 附件列表 ========== */
.message-attachments {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
  width: 100%;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: var(--space-2, 8px) var(--space-3, 12px);
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.attachment-item:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
}

.attachment-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: hsl(var(--primary) / 0.1);
  border-radius: var(--radius-md, 8px);
  color: hsl(var(--primary));
  flex-shrink: 0;
}

.attachment-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.attachment-name {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-size {
  font-size: 11px;
  color: hsl(var(--text-muted));
}

.attachment-download {
  opacity: 0;
  transition: opacity 0.2s var(--ease-out, ease-out);
}

.attachment-item:hover .attachment-download {
  opacity: 1;
}

/* ========== 操作栏 ========== */
.message-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1, 4px);
  padding: var(--space-1, 4px);
  position: absolute;
  bottom: -36px;
  background: hsl(var(--surface-elevated));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md, 8px);
  box-shadow: var(--shadow-md);
  z-index: 10;
}

.message-user .message-actions {
  right: 0;
}

.message-assistant .message-actions {
  left: 0;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s var(--ease-out, ease-out), transform 0.2s var(--ease-out, ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ========== 流式状态 ========== */
.message-streaming .message-bubble {
  border-color: hsl(var(--primary) / 0.3);
}

/* ========== 聚焦状态 ========== */
.message-focused .message-bubble {
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
}

/* ========== 响应式设计 ========== */
@media (max-width: 768px) {
  .chat-message {
    gap: var(--space-2, 8px);
    padding: var(--space-2, 8px) 0 var(--space-10, 40px);
  }

  .message-body {
    max-width: 85%;
  }

  .message-bubble {
    padding: var(--space-2, 8px) var(--space-3, 12px);
  }

  .message-text,
  .message-markdown {
    font-size: 15px;
  }

  .attachment-download {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .message-body {
    max-width: 90%;
  }

  .sender-name {
    font-size: 12px;
  }

  .message-time {
    font-size: 10px;
  }

  .message-text,
  .message-markdown {
    font-size: 15px;
  }

  .attachment-item {
    padding: var(--space-2, 8px);
  }

  .attachment-name {
    max-width: 120px;
  }
}

/* ========== 暗色模式适配 ========== */
@media (prefers-color-scheme: dark) {
  .bubble-assistant {
    background: hsl(var(--surface-elevated));
    border-color: hsl(var(--border));
  }

  .attachment-item {
    background: hsl(var(--surface));
  }
}

/* ========== 无障碍支持 ========== */
@media (prefers-reduced-motion: reduce) {
  .chat-message,
  .message-bubble,
  .attachment-item,
  .cursor-blink {
    animation: none;
    transition: none;
  }
}
</style>
