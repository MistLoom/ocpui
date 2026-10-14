<template>
  <div
    :class="[
      'chat-sender',
      { 'is-focused': isFocused, 'is-dragover': isDragOver, 'has-attachments': hasAttachments, 'is-recording': isRecording }
    ]"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <!-- 附件预览区域 - 水平滚动 -->
    <Transition name="attachments">
      <div v-if="hasAttachments" class="sender-attachments">
        <div class="attachments-scroll">
          <div
            v-for="(attachment, index) in localAttachments"
            :key="attachment.id"
            class="attachment-chip"
            :class="{ 'is-image': isImageFile(attachment.type) }"
          >
            <div v-if="isImageFile(attachment.type) && attachment.url" class="attachment-thumb">
              <img :src="attachment.url" :alt="attachment.name" />
            </div>
            <div v-else class="attachment-icon">
              <Icon :name="getFileIcon(attachment.type)" :size="16" />
            </div>
            <span class="attachment-name">{{ truncateName(attachment.name) }}</span>
            <button
              class="attachment-remove"
              type="button"
              :title="t('components.chat.removeAttachment')"
              @click="removeAttachment(index)"
            >
              <Icon name="x" :size="12" />
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 输入框容器 -->
    <div class="sender-input-container">
      <textarea
        ref="textareaRef"
        v-model="inputValue"
        :placeholder="placeholder || t('components.chat.inputPlaceholder')"
        :rows="computedRows"
        :maxlength="maxLength"
        class="sender-textarea"
        :class="{ 'has-content': hasContent }"
        @keydown="handleKeydown"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @paste="handlePaste"
      />

      <!-- 字符计数 - 右下角 -->
      <Transition name="fade">
        <div v-if="showCharCount && hasContent" class="char-counter">
          <span :class="{ 'is-warning': isNearLimit, 'is-error': isOverLimit }">
            {{ charCount }}
          </span>
          <span class="char-separator">/</span>
          <span>{{ maxLength }}</span>
        </div>
      </Transition>
    </div>

    <!-- 底部工具栏和发送按钮 -->
    <div class="sender-bottom">
      <!-- 工具栏 - 底部左侧 -->
      <div class="sender-toolbar">
        <Tooltip :content="t('components.chat.uploadFile')" placement="top">
          <template #trigger>
            <button
              type="button"
              class="toolbar-btn"
              :class="{ 'is-active': showUploadMenu }"
              @click.stop="toggleUploadMenu"
            >
              <Icon name="paperclip" :size="18" />
            </button>
          </template>
        </Tooltip>

        <!-- 语音输入按钮 - 单击切换模式 -->
        <Tooltip v-if="showVoiceInput" :content="voiceButtonTooltip" placement="top">
          <template #trigger>
            <button
              type="button"
              class="toolbar-btn voice-btn"
              :class="{ 'is-recording': isRecording }"
              @click="toggleVoiceRecording"
            >
              <span class="voice-icon-wrapper" :class="{ 'is-recording': isRecording }">
                <Icon :name="isRecording ? 'mic-off' : 'mic'" :size="20" />
              </span>
              <!-- 音频波形动画 - 仅在录音时显示 -->
              <span v-if="isRecording" class="voice-wave-inline">
                <span v-for="i in 3" :key="i" class="wave-bar" :style="{ animationDelay: `${i * 0.15}s` }" />
              </span>
            </button>
          </template>
        </Tooltip>

        <!-- 上传菜单 -->
        <Transition name="menu">
          <div v-if="showUploadMenu" ref="uploadMenuRef" class="upload-menu">
            <button type="button" class="upload-option" @click.stop="triggerFileInput">
              <Icon name="file-up" :size="16" />
              <span>{{ t('components.chat.uploadFile') }}</span>
            </button>
            <button type="button" class="upload-option" @click.stop="triggerImageInput">
              <Icon name="image" :size="16" />
              <span>{{ t('components.chat.uploadImage') }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <!-- 发送按钮 - 底部右侧 -->
      <div class="sender-actions">
        <button
          type="button"
          class="send-btn"
          :class="{
            'is-ready': canSend,
            'is-loading': isLoading,
            'is-typing': isTyping
          }"
          :disabled="!canSend"
          :title="sendButtonText || t('components.chat.send')"
          @click="handleSend"
        >
          <span v-if="isLoading" class="send-spinner">
            <Icon name="loader-2" :size="18" class="spin" />
          </span>
          <span v-else class="send-icon">
            <Icon name="send" :size="18" />
          </span>
          <span class="send-ripple" />
        </button>
      </div>

      <!-- 底部提示 - 悬浮在中间 -->
      <Transition name="fade">
        <div v-if="showFooter && isFocused" class="sender-footer">
          <div class="footer-hints">
            <span class="hint-item">
              <kbd>Enter</kbd>
              <span>{{ t('components.chat.send') }}</span>
            </span>
            <span class="hint-separator">·</span>
            <span class="hint-item">
              <kbd>Shift</kbd>
              <span>+</span>
              <kbd>Enter</kbd>
              <span>{{ t('components.chat.newLine') }}</span>
            </span>
          </div>
          <slot name="footer-extra" />
        </div>
      </Transition>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      :accept="acceptedFileTypes"
      style="display: none"
      @change="handleFileSelect"
    />
    <input
      ref="imageInputRef"
      type="file"
      multiple
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- 拖拽遮罩 -->
    <Transition name="fade">
      <div v-if="isDragOver" class="drag-overlay">
        <div class="drag-content">
          <Icon name="upload-cloud" :size="48" />
          <span>{{ t('components.chat.dropFilesHere') }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { Icon, Tooltip, useUiT } from '@ocpui/vue';
import { getSpeechRecognitionConstructor } from './speech-recognition';
import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from './speech-recognition';

const { uiT: t } = useUiT();

// 附件接口
interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

// 组件属性
interface Props {
  modelValue?: string;
  placeholder?: string;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  showCharCount?: boolean;
  showFooter?: boolean;
  sendButtonText?: string;
  isLoading?: boolean;
  acceptedTypes?: string;
  acceptedFileTypes?: string;
  attachments?: Attachment[];
  autoFocus?: boolean;
  // 语音输入
  showVoiceInput?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  maxLength: 4000,
  minRows: 1,
  maxRows: 6,
  showCharCount: true,
  showFooter: true,
  sendButtonText: '',
  isLoading: false,
  acceptedTypes: 'image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt',
  acceptedFileTypes: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar',
  attachments: () => [],
  autoFocus: false,
  showVoiceInput: true,
});

// 事件定义
const emit = defineEmits<{
  'update:modelValue': [value: string];
  'send': [value: string, attachments: Attachment[]];
  'focus': [];
  'blur': [];
  'file-change': [files: File[]];
  'attachment-remove': [attachment: Attachment, index: number];
  'keydown': [event: KeyboardEvent];
  'voice-start': [];
  'voice-stop': [text: string];
}>();

// 状态
const inputValue = ref(props.modelValue);
const textareaRef = ref<HTMLTextAreaElement>();
const fileInputRef = ref<HTMLInputElement>();
const imageInputRef = ref<HTMLInputElement>();
const uploadMenuRef = ref<HTMLElement>();
const isFocused = ref(false);
const isTyping = ref(false);
const isDragOver = ref(false);
const showUploadMenu = ref(false);
const localAttachments = ref<Attachment[]>([...props.attachments]);
const typingTimer = ref<ReturnType<typeof setTimeout> | null>(null);

// 语音输入状态
const isRecording = ref(false);
const recordingTimer = ref<ReturnType<typeof setInterval> | null>(null);
const recordingDuration = ref(0);
const voiceRecognition = ref<SpeechRecognition | null>(null);

// 计算属性
const hasContent = computed(() => inputValue.value.trim().length > 0);
const hasAttachments = computed(() => localAttachments.value.length > 0);
const charCount = computed(() => inputValue.value.length);
const isNearLimit = computed(() => charCount.value > props.maxLength * 0.9);
const isOverLimit = computed(() => charCount.value > props.maxLength);

const canSend = computed(() => {
  return (hasContent.value || hasAttachments.value) &&
         charCount.value <= props.maxLength &&
         !props.isLoading;
});

const computedRows = computed(() => {
  const lineCount = inputValue.value.split('\n').length;
  return Math.min(Math.max(props.minRows, lineCount), props.maxRows);
});

const voiceButtonTooltip = computed(() => {
  return isRecording.value
    ? `${t('components.chat.recording')} (${recordingDuration.value}s)`
    : t('components.chat.voiceInput');
});

// 监听外部值变化
watch(() => props.modelValue, (val) => {
  if (val !== inputValue.value) {
    inputValue.value = val;
  }
});

// 监听附件变化
watch(() => props.attachments, (val) => {
  localAttachments.value = [...val];
}, { deep: true });

// 监听输入值变化
watch(inputValue, (val) => {
  emit('update:modelValue', val);
  handleTyping();
});

// 方法
function handleTyping() {
  isTyping.value = true;
  if (typingTimer.value) {
    clearTimeout(typingTimer.value);
  }
  typingTimer.value = setTimeout(() => {
    isTyping.value = false;
  }, 500);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (canSend.value) {
      handleSend();
    }
  }
  emit('keydown', e);
}

function handleInput() {
  autoResize();
}

function autoResize() {
  if (!textareaRef.value) return;

  const textarea = textareaRef.value;
  textarea.style.height = 'auto';

  const lineHeight = 24;
  const maxHeight = props.maxRows * lineHeight;
  const newHeight = Math.min(textarea.scrollHeight, maxHeight);

  textarea.style.height = `${newHeight}px`;
}

function handleFocus() {
  isFocused.value = true;
  emit('focus');
}

function handleBlur() {
  // 延迟失焦，避免点击工具栏时立即失焦
  setTimeout(() => {
    if (!showUploadMenu.value) {
      isFocused.value = false;
      emit('blur');
    }
  }, 100);
}

function handleSend() {
  if (!canSend.value) return;

  const value = inputValue.value.trim();
  emit('send', value, [...localAttachments.value]);

  // 重置状态
  inputValue.value = '';
  localAttachments.value = [];
  nextTick(() => {
    autoResize();
    textareaRef.value?.focus();
  });
}

// 语音输入相关 - 单击切换模式
function toggleVoiceRecording() {
  if (isRecording.value) {
    stopVoiceRecording();
  } else {
    startVoiceRecording();
  }
}

function startVoiceRecording() {
  if (isRecording.value) return;

  // 检查浏览器是否支持语音识别（标准前缀与 WebKit 前缀）
  const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
  if (!SpeechRecognitionCtor) {
    // 不支持语音识别，使用模拟
    startMockRecording();
    return;
  }

  isRecording.value = true;
  recordingDuration.value = 0;
  emit('voice-start');

  // 开始计时
  recordingTimer.value = setInterval(() => {
    recordingDuration.value++;
    // 最多录音60秒
    if (recordingDuration.value >= 60) {
      stopVoiceRecording();
    }
  }, 1000);

  // 初始化语音识别
  const recognition = new SpeechRecognitionCtor();
  voiceRecognition.value = recognition;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'zh-CN';

  let finalTranscript = '';

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    // 实时更新输入框显示中间结果
    if (interimTranscript) {
      inputValue.value = finalTranscript + interimTranscript;
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error('语音识别错误:', event.error);
    stopVoiceRecording();
  };

  recognition.onend = () => {
    if (finalTranscript) {
      inputValue.value = finalTranscript;
    }
  };

  recognition.start();
}

function stopVoiceRecording() {
  if (!isRecording.value) return;

  isRecording.value = false;

  if (recordingTimer.value) {
    clearInterval(recordingTimer.value);
    recordingTimer.value = null;
  }

  // 停止语音识别
  if (voiceRecognition.value) {
    voiceRecognition.value.stop();
    voiceRecognition.value = null;
  }

  emit('voice-stop', inputValue.value);
}

// 模拟录音（用于不支持语音识别的浏览器）
function startMockRecording() {
  isRecording.value = true;
  recordingDuration.value = 0;
  emit('voice-start');

  recordingTimer.value = setInterval(() => {
    recordingDuration.value++;
    if (recordingDuration.value >= 5) {
      stopMockRecording();
    }
  }, 1000);
}

function stopMockRecording() {
  isRecording.value = false;

  if (recordingTimer.value) {
    clearInterval(recordingTimer.value);
    recordingTimer.value = null;
  }

  // 模拟识别结果
  const mockTexts = [
    t('components.chat.mockVoiceText1'),
    t('components.chat.mockVoiceText2'),
    t('components.chat.mockVoiceText3'),
  ];
  const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
  inputValue.value += (inputValue.value ? ' ' : '') + randomText;

  emit('voice-stop', inputValue.value);
}

// 文件上传相关
function toggleUploadMenu() {
  showUploadMenu.value = !showUploadMenu.value;
}

function closeUploadMenu() {
  showUploadMenu.value = false;
}

function triggerFileInput() {
  fileInputRef.value?.click();
  closeUploadMenu();
}

function triggerImageInput() {
  imageInputRef.value?.click();
  closeUploadMenu();
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files);
    addFiles(files);
    emit('file-change', files);
    target.value = '';
  }
}

function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  if (!items) return;

  const files: File[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }

  if (files.length > 0) {
    e.preventDefault();
    addFiles(files);
    emit('file-change', files);
  }
}

function addFiles(files: File[]) {
  files.forEach(file => {
    const attachment: Attachment = {
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type || getFileType(file.name),
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      file,
    };
    localAttachments.value.push(attachment);
  });
}

function removeAttachment(index: number) {
  const attachment = localAttachments.value[index];
  if (attachment.url && attachment.url.startsWith('blob:')) {
    URL.revokeObjectURL(attachment.url);
  }
  localAttachments.value.splice(index, 1);
  emit('attachment-remove', attachment, index);
}

// 拖拽相关
function handleDragEnter(e: DragEvent) {
  e.preventDefault();
  isDragOver.value = true;
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  isDragOver.value = true;
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault();
  // 检查是否真的离开了元素
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOver.value = false;
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  isDragOver.value = false;

  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    const fileArray = Array.from(files);
    addFiles(fileArray);
    emit('file-change', fileArray);
  }
}

// 工具函数
function generateId(): string {
  return `att_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
  };
  return typeMap[ext || ''] || 'application/octet-stream';
}

function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type.includes('pdf')) return 'file-text';
  if (type.includes('sheet') || type.includes('excel')) return 'table';
  if (type.includes('word') || type.includes('document')) return 'file-text';
  return 'file';
}

function isImageFile(type: string): boolean {
  return type.startsWith('image/');
}

function truncateName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) return name;
  const ext = name.split('.').pop();
  const base = name.substring(0, maxLength - (ext?.length || 0) - 4);
  return `${base}...${ext}`;
}

// 点击外部关闭菜单
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;

  if (showUploadMenu.value && uploadMenuRef.value && !uploadMenuRef.value.contains(target)) {
    closeUploadMenu();
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  if (props.autoFocus) {
    nextTick(() => textareaRef.value?.focus());
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (typingTimer.value) {
    clearTimeout(typingTimer.value);
  }
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value);
  }
  if (voiceRecognition.value) {
    voiceRecognition.value.stop();
  }
});

// 暴露方法
defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
  clear: () => {
    inputValue.value = '';
    localAttachments.value = [];
    nextTick(() => autoResize());
  },
  getValue: () => inputValue.value,
  getAttachments: () => [...localAttachments.value],
  insertText: (text: string) => {
    const textarea = textareaRef.value;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = inputValue.value;

    inputValue.value = currentValue.substring(0, start) + text + currentValue.substring(end);

    nextTick(() => {
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
      autoResize();
    });
  },
});
</script>

<style scoped>
/* ========== 基础容器 ========== */
.chat-sender {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
  padding: var(--space-3, 12px);
  background: hsl(var(--surface-elevated));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg, 12px);
  transition: border-color var(--duration-normal, 200ms) var(--ease-standard, ease),
              box-shadow var(--duration-normal, 200ms) var(--ease-standard, ease);
}

.chat-sender.is-focused {
  border-color: hsl(var(--primary) / 0.5);
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.1), var(--shadow-sm);
}

.chat-sender.is-dragover {
  border-color: hsl(var(--primary));
  border-style: dashed;
  border-width: 2px;
  background: hsl(var(--primary) / 0.02);
}

.chat-sender.has-attachments {
  padding-top: var(--space-2, 8px);
}

.chat-sender.is-recording {
  border-color: hsl(var(--error) / 0.5);
  box-shadow: 0 0 0 2px hsl(var(--error) / 0.1);
}

/* ========== 附件预览区域 ========== */
.sender-attachments {
  position: relative;
  padding: var(--space-2, 8px) 0;
  border-bottom: 1px solid hsl(var(--border) / 0.5);
}

.attachments-scroll {
  display: flex;
  gap: var(--space-2, 8px);
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: var(--space-1, 4px);
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}

.attachments-scroll::-webkit-scrollbar {
  height: 4px;
}

.attachments-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.attachments-scroll::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: var(--radius-full, 9999px);
}

.attachment-chip {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  padding: var(--space-1, 4px) var(--space-2, 8px);
  padding-left: var(--space-2, 8px);
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md, 8px);
  flex-shrink: 0;
  transition: background-color var(--duration-fast, 150ms) var(--ease-standard, ease),
              border-color var(--duration-fast, 150ms) var(--ease-standard, ease),
              transform var(--duration-fast, 150ms) var(--ease-standard, ease);
  max-width: 200px;
}

.attachment-chip:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
}

.attachment-chip.is-image {
  padding-left: var(--space-1, 4px);
}

.attachment-thumb {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm, 4px);
  overflow: hidden;
  flex-shrink: 0;
}

.attachment-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attachment-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: hsl(var(--primary) / 0.1);
  border-radius: var(--radius-sm, 4px);
  color: hsl(var(--primary));
  flex-shrink: 0;
}

.attachment-name {
  font-size: 12px;
  color: hsl(var(--text));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.attachment-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm, 4px);
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: background-color var(--duration-fast, 150ms) var(--ease-standard, ease),
              color var(--duration-fast, 150ms) var(--ease-standard, ease);
  flex-shrink: 0;
}

.attachment-remove:hover {
  background: hsl(var(--error) / 0.1);
  color: hsl(var(--error));
}

/* ========== 输入框容器 ========== */
.sender-input-container {
  position: relative;
  width: 100%;
  min-height: 48px;
}

.sender-textarea {
  width: 100%;
  min-height: 24px;
  max-height: 144px;
  padding: var(--space-2, 8px) 0;
  padding-right: 60px;
  font-size: 14px;
  line-height: 24px;
  color: hsl(var(--text));
  background: transparent;
  border: none;
  resize: none;
  outline: none;
  font-family: inherit;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}

.sender-textarea::-webkit-scrollbar {
  width: 4px;
}

.sender-textarea::-webkit-scrollbar-track {
  background: transparent;
}

.sender-textarea::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: var(--radius-full, 9999px);
}

.sender-textarea::placeholder {
  color: hsl(var(--text-muted));
}

.sender-textarea.has-content {
  padding-bottom: var(--space-6, 24px);
}

/* 字符计数 */
.char-counter {
  position: absolute;
  right: 0;
  bottom: var(--space-1, 4px);
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: hsl(var(--text-muted));
  font-family: 'JetBrains Mono', monospace;
  pointer-events: none;
  z-index: 1;
}

.char-counter .is-warning {
  color: hsl(var(--warning));
}

.char-counter .is-error {
  color: hsl(var(--error));
}

.char-separator {
  opacity: 0.5;
}

/* ========== 底部工具栏区域 ========== */
.sender-bottom {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3, 12px);
  padding-top: var(--space-2, 8px);
  border-top: 1px solid hsl(var(--border) / 0.3);
}

/* ========== 工具栏 ========== */
.sender-toolbar {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-1, 4px);
  flex-shrink: 0;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md, 8px);
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: background-color var(--duration-fast, 150ms) var(--ease-standard, ease),
              color var(--duration-fast, 150ms) var(--ease-standard, ease),
              border-color var(--duration-fast, 150ms) var(--ease-standard, ease);
}

.toolbar-btn:hover {
  background: hsl(var(--surface));
  color: hsl(var(--text));
  border-color: hsl(var(--border));
}

.toolbar-btn.is-active {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  border-color: hsl(var(--primary) / 0.2);
}

/* 语音按钮 - 优化协调设计 */
.toolbar-btn.voice-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  overflow: visible;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.toolbar-btn.voice-btn.is-recording {
  background: hsl(var(--error) / 0.1);
  color: hsl(var(--error));
  border-color: hsl(var(--error) / 0.2);
}

/* 图标容器 - 保持稳定 */
.voice-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--duration-fast, 150ms) var(--ease-standard, ease);
}

.voice-icon-wrapper.is-recording {
  transform: scale(0.9);
}

/* 音频波形动画 - 按钮外部显示 */
.voice-wave-inline {
  position: absolute;
  right: -20px;
  display: flex;
  align-items: center;
  gap: 2px;
  height: 16px;
  pointer-events: none;
}

.voice-wave-inline .wave-bar {
  width: 2px;
  height: 100%;
  background: hsl(var(--error));
  border-radius: var(--radius-full, 9999px);
  animation: wave-inline 0.8s ease-in-out infinite;
}

@keyframes wave-inline {
  0%, 100% {
    transform: scaleY(0.3);
    opacity: 0.5;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* 上传菜单 */
.upload-menu {
  position: absolute;
  bottom: calc(100% + var(--space-2, 8px));
  left: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
  padding: var(--space-1, 4px);
  background: hsl(var(--surface-elevated));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md, 8px);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  min-width: 140px;
}

.upload-option {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  padding: var(--space-2, 8px) var(--space-3, 12px);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm, 4px);
  color: hsl(var(--text));
  font-size: 13px;
  cursor: pointer;
  transition: background-color var(--duration-fast, 150ms) var(--ease-standard, ease),
              color var(--duration-fast, 150ms) var(--ease-standard, ease);
  text-align: left;
}

.upload-option:hover {
  background: hsl(var(--surface-hover));
}

/* ========== 发送按钮 ========== */
.sender-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.send-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md, 8px);
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: background-color var(--duration-normal, 200ms) var(--ease-standard, ease),
              transform var(--duration-normal, 200ms) var(--ease-standard, ease),
              box-shadow var(--duration-normal, 200ms) var(--ease-standard, ease);
  overflow: hidden;
}

.send-btn:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  box-shadow: var(--shadow-sm);
}

.send-btn.is-ready {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--surface));
  box-shadow: var(--shadow-sm);
}

.send-btn.is-ready:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.9);
}

.send-btn.is-loading {
  cursor: not-allowed;
  opacity: 0.8;
}

.send-btn.is-typing {
  opacity: 0.8;
}

.send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.send-ripple {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, hsl(var(--primary) / 0.2) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0);
  transition: transform var(--duration-slow, 300ms) var(--ease-standard, ease),
              opacity var(--duration-slow, 300ms) var(--ease-standard, ease);
}

.send-btn:active .send-ripple {
  opacity: 1;
  transform: scale(2);
}

.send-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ========== 底部提示 ========== */
.sender-footer {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1, 4px) var(--space-3, 12px);
  background: hsl(var(--surface-elevated) / 0.95);
  border: 1px solid hsl(var(--border) / 0.5);
  border-radius: var(--radius-md, 8px);
  pointer-events: none;
  box-shadow: var(--shadow-sm);
  z-index: 10;
}

.footer-hints {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  pointer-events: auto;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: var(--space-1, 4px);
  font-size: 10px;
  color: hsl(var(--text-muted));
  white-space: nowrap;
}

.hint-item kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  padding: 1px 4px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-sm, 4px);
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: hsl(var(--text-secondary));
}

.hint-separator {
  color: hsl(var(--border));
  opacity: 0.6;
}

/* ========== 拖拽遮罩 ========== */
.drag-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--surface-elevated) / 0.95);
  border-radius: var(--radius-lg, 12px);
  z-index: 50;
  backdrop-filter: blur(4px);
}

.drag-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3, 12px);
  color: hsl(var(--primary));
  font-size: 14px;
  font-weight: 500;
}

/* ========== 过渡动画 ========== */
.attachments-enter-active,
.attachments-leave-active {
  transition: opacity var(--duration-normal, 200ms) var(--ease-standard, ease),
              transform var(--duration-normal, 200ms) var(--ease-standard, ease);
  max-height: 60px;
  opacity: 1;
}

.attachments-enter-from,
.attachments-leave-to {
  max-height: 0;
  opacity: 0;
  padding: 0;
  margin: 0;
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity var(--duration-fast, 150ms) var(--ease-standard, ease),
              transform var(--duration-fast, 150ms) var(--ease-standard, ease);
  transform-origin: bottom left;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast, 150ms) var(--ease-out, ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========== 响应式设计 ========== */
@media (max-width: 768px) {
  .chat-sender {
    padding: var(--space-2, 8px);
    gap: var(--space-1, 4px);
  }

  .sender-input-container {
    min-height: 44px;
  }

  .sender-bottom {
    gap: var(--space-2, 8px);
    padding-top: var(--space-1, 4px);
  }

  .toolbar-btn {
    width: 32px;
    height: 32px;
  }

  .toolbar-btn.voice-btn.is-recording {
    width: 70px;
    padding: 0 10px;
  }

  .send-btn {
    width: 36px;
    height: 36px;
  }

  .sender-textarea {
    font-size: 16px; /* 防止iOS缩放 */
    padding-right: 50px;
  }

  .attachment-chip {
    max-width: 160px;
  }

  .footer-hints {
    gap: var(--space-2, 8px);
  }

  .hint-item {
    font-size: 10px;
  }

  .hint-item kbd {
    min-width: 18px;
    padding: 1px 4px;
    font-size: 9px;
  }

  .upload-menu {
    left: 0;
    right: 0;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .sender-toolbar {
    gap: 0;
  }

  .attachment-name {
    max-width: 80px;
  }
}

/* ========== 暗色模式适配 ========== */
@media (prefers-color-scheme: dark) {
  .chat-sender {
    background: hsl(var(--surface));
  }

  .attachment-chip {
    background: hsl(var(--surface-elevated));
  }

  .toolbar-btn:hover {
    background: hsl(var(--surface-elevated));
  }

  .send-btn {
    background: hsl(var(--surface-elevated));
  }
}

/* ========== 无障碍支持 ========== */
@media (prefers-reduced-motion: reduce) {
  .chat-sender,
  .toolbar-btn,
  .send-btn,
  .attachment-chip,
  .attachment-remove {
    transition: none;
  }

  .spin,
  .wave-bar,
  .toolbar-btn.voice-btn.is-recording {
    animation: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .chat-sender.is-focused {
    border-width: 2px;
    box-shadow: none;
  }

  .send-btn.is-ready {
    border-width: 2px;
  }
}
</style>
