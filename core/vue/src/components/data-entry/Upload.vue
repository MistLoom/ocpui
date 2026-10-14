&lt;!--
 * Upload 上传组件
 * @description 文件上传组件，支持拖拽上传、多文件上传、文件类型限制等功能
 * @props modelValue - 文件列表，类型：UploadFile[]，默认值：[]
 * @props action - 上传地址，类型：string，默认值：''
 * @props accept - 接受的文件类型，类型：string，默认值：''
 * @props multiple - 是否支持多文件上传，类型：boolean，默认值：false
 * @props disabled - 是否禁用，类型：boolean，默认值：false
 * @props drag - 是否支持拖拽上传，类型：boolean，默认值：false
 * @props listType - 文件列表类型，类型：'text' | 'picture'，默认值：'text'
 * @props showFileList - 是否显示文件列表，类型：boolean，默认值：true
 * @props autoUpload - 是否自动上传，类型：boolean，默认值：true
 * @props limit - 文件上传数量限制，类型：number，默认值：0（无限制）
 * @props maxSize - 文件大小限制（字节），类型：number，默认值：0（无限制）
 * @props buttonText - 上传按钮文字，类型：string，默认值：'点击上传'
 * @props tip - 提示信息，类型：string，默认值：''
 * @props headers - 请求头，类型：Record&lt;string, string&gt;，默认值：{}
 * @props data - 额外参数，类型：Record&lt;string, unknown&gt;，默认值：{}
 * @props withCredentials - 是否携带凭证，类型：boolean，默认值：false
 * @props customClass - 自定义类名，类型：string，默认值：''
 * @emits update:modelValue - 文件列表变化时触发
 * @emits change - 文件状态变化时触发
 * @emits success - 文件上传成功时触发
 * @emits error - 文件上传失败时触发
 * @emits progress - 文件上传进度变化时触发
 * @emits remove - 文件删除时触发
 * @emits preview - 文件预览时触发
 * @emits exceed - 文件数量超出限制时触发
 * @emits beforeUpload - 文件上传前触发
 * @methods submit - 手动触发上传
 * @methods clearFiles - 清空文件列表
 * @methods fileList - 获取文件列表
--&gt;
<template>
  <div :class="uploadClass" role="group" :aria-label="t('components.dataEntry.upload.ariaLabel')">
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      class="upload-input"
      @change="handleFileChange"
      :aria-label="t('components.dataEntry.upload.selectFile')"
    />
    
    <div v-if="listType === 'text'" class="upload-trigger" @click="handleClick" @drop.prevent="handleDrop" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave" :class="{ 'upload-trigger--dragover': isDragover }" :tabindex="disabled ? -1 : 0" @keydown.enter="handleClick" @keydown.space.prevent="handleClick" role="button" :aria-disabled="disabled">
      <slot name="trigger">
        <div class="upload-button" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="upload-button-icon">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>{{ buttonText }}</span>
        </div>
      </slot>
      <div v-if="drag" class="upload-drag-text">
        <p>{{ t('components.dataEntry.upload.dragTextPrefix') }}<em>{{ t('components.dataEntry.upload.dragTextClick') }}</em></p>
      </div>
    </div>
    
    <div v-else-if="listType === 'picture'" class="upload-picture-card" @click="handleClick" :class="{ 'upload-picture-card--disabled': disabled }" :tabindex="disabled ? -1 : 0" @keydown.enter="handleClick" @keydown.space.prevent="handleClick" role="button" :aria-disabled="disabled" :aria-label="t('components.dataEntry.upload.uploadImage')">
      <slot name="trigger">
        <div class="upload-picture-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <span class="upload-picture-text">{{ t('components.dataEntry.upload.uploadImage') }}</span>
      </slot>
    </div>
    
    <div v-if="showFileList && fileList.length > 0" class="upload-list" :class="`upload-list--${listType}`">
      <div
        v-for="file in fileList"
        :key="file.uid"
        class="upload-list-item"
        :class="{
          'upload-list-item--success': file.status === 'success',
          'upload-list-item--error': file.status === 'error',
          'upload-list-item--uploading': file.status === 'uploading'
        }"
      >
        <template v-if="listType === 'text'">
          <div class="upload-list-item-info">
            <span class="upload-list-item-icon">
              <svg v-if="file.status === 'uploading'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="upload-icon-loading">
                <circle cx="12" cy="12" r="10"/>
              </svg>
              <svg v-else-if="file.status === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <polyline points="16 13 8 13"/>
                <polyline points="16 17 8 17"/>
              </svg>
              <svg v-else-if="file.status === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </span>
            <span class="upload-list-item-name">{{ file.name }}</span>
            <span class="upload-list-item-size">{{ formatSize(file.size || 0) }}</span>
          </div>
          <div class="upload-list-item-actions">
            <button v-if="file.status === 'uploading'" type="button" class="upload-list-item-btn" @click="handleAbort(file)" :aria-label="t('components.dataEntry.upload.cancelUpload')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <button v-else-if="file.status === 'error'" type="button" class="upload-list-item-btn" @click="handleRetry(file)" :aria-label="t('components.dataEntry.upload.retryUpload')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
            <button v-else type="button" class="upload-list-item-btn" @click="handleRemove(file)" :aria-label="t('components.dataEntry.upload.deleteFile')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
          <div v-if="file.status === 'uploading' && file.progress !== undefined" class="upload-list-item-progress">
            <div class="upload-progress-bar" :style="{ width: `${file.progress}%` }"></div>
          </div>
        </template>
        
        <template v-else-if="listType === 'picture'">
          <div class="upload-list-item-thumbnail">
            <img v-if="file.url || file.thumbUrl" :src="file.url || file.thumbUrl" :alt="file.name" />
            <div v-else class="upload-list-item-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div v-if="file.status === 'uploading'" class="upload-list-item-uploading">
              <div class="upload-progress-circle">
                <svg viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" stroke-width="2" opacity="0.2"/>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" stroke-width="2" :stroke-dasharray="`${file.progress || 0}, 100`" transform="rotate(-90 18 18)"/>
                </svg>
                <span class="upload-progress-text">{{ file.progress || 0 }}%</span>
              </div>
            </div>
            <div v-if="file.status !== 'uploading'" class="upload-list-item-mask">
              <button type="button" class="upload-list-item-mask-btn" @click="handlePreview(file)" :aria-label="t('components.dataEntry.upload.preview')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
              <button v-if="file.status === 'error'" type="button" class="upload-list-item-mask-btn" @click="handleRetry(file)" :aria-label="t('components.dataEntry.upload.retryUpload')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
              <button type="button" class="upload-list-item-mask-btn" @click="handleRemove(file)" :aria-label="t('components.dataEntry.upload.delete')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
          <div v-if="file.status === 'error'" class="upload-list-item-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>{{ t('components.dataEntry.upload.uploadFailed') }}</span>
          </div>
        </template>
      </div>
    </div>
    
    <div v-if="tip" class="upload-tip">{{ tip }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { genId } from '@ocpui/vue/utils';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

export type UploadListType = 'text' | 'picture';
export type UploadFileStatus = 'ready' | 'uploading' | 'success' | 'error';

export interface UploadFile {
  uid: string | number;
  name: string;
  size?: number;
  status?: UploadFileStatus;
  progress?: number;
  url?: string;
  thumbUrl?: string;
  raw?: File;
  response?: unknown;
  error?: Error;
}

interface Props {
  modelValue?: UploadFile[];
  action?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  drag?: boolean;
  listType?: UploadListType;
  showFileList?: boolean;
  autoUpload?: boolean;
  limit?: number;
  maxSize?: number;
  buttonText?: string;
  tip?: string;
  headers?: Record<string, string>;
  data?: Record<string, unknown>;
  withCredentials?: boolean;
  maxConcurrency?: number;
  retryCount?: number;
  retryDelay?: number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  action: '',
  accept: '',
  multiple: false,
  disabled: false,
  drag: false,
  listType: 'text',
  showFileList: true,
  autoUpload: true,
  limit: 0,
  maxSize: 0,
  buttonText: '点击上传',
  tip: '',
  headers: () => ({}),
  data: () => ({}),
  withCredentials: false,
  maxConcurrency: 3,
  retryCount: 0,
  retryDelay: 600,
  customClass: '',
});

const emit = defineEmits<{
  'update:modelValue': [UploadFile[]];
  'change': [UploadFile, UploadFile[]];
  'success': [UploadFile, UploadFile[]];
  'error': [Error, UploadFile, UploadFile[]];
  'progress': [UploadFile];
  'remove': [UploadFile, UploadFile[]];
  'preview': [UploadFile];
  'exceed': [File[]];
  'beforeUpload': [File];
}>();

const inputRef = ref<HTMLInputElement>();
const isDragover = ref(false);
const requests = ref<Map<string | number, XMLHttpRequest>>(new Map());
const uploadQueue = ref<(string | number)[]>([]);

const fileList = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const uploadClass = computed(() => {
  const classes = ['upload', `upload--${props.listType}`];
  if (props.disabled) classes.push('upload--disabled');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const generateUid = (): string => {
  return `${Date.now().toString(36)}-${genId()}`;
};

const emitFileChange = (file: UploadFile) => {
  emit('change', file, fileList.value);
};

const handleClick = () => {
  if (props.disabled) return;
  inputRef.value?.click();
};

const handleDragOver = () => {
  if (props.disabled || !props.drag) return;
  isDragover.value = true;
};

const handleDragLeave = () => {
  isDragover.value = false;
};

const handleDrop = (e: DragEvent) => {
  if (props.disabled || !props.drag) return;
  isDragover.value = false;
  
  const files = Array.from(e.dataTransfer?.files || []);
  if (files.length > 0) {
    uploadFiles(files);
  }
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  if (files.length > 0) {
    uploadFiles(files);
  }
  target.value = '';
};

const uploadFiles = (files: File[]) => {
  if (props.limit > 0 && fileList.value.length + files.length > props.limit) {
    emit('exceed', files);
    return;
  }
  
  const validFiles: File[] = [];
  
  for (const file of files) {
    if (props.maxSize > 0 && file.size > props.maxSize) {
      emit('error', new Error(`文件 ${file.name} 超过最大限制 ${formatSize(props.maxSize)}`), {
        uid: generateUid(),
        name: file.name,
        size: file.size,
        status: 'error',
        raw: file,
      }, fileList.value);
      continue;
    }
    
    emit('beforeUpload', file);
    validFiles.push(file);
  }
  
  if (!props.multiple && validFiles.length > 0) {
    fileList.value.forEach((file) => {
      if (file.thumbUrl) {
        URL.revokeObjectURL(file.thumbUrl);
      }
    });
    fileList.value = [];
  }
  
  for (const file of validFiles) {
    const uploadFile: UploadFile = {
      uid: generateUid(),
      name: file.name,
      size: file.size,
      status: 'ready',
      progress: 0,
      raw: file,
    };
    
    if (file.type.startsWith('image/')) {
      uploadFile.thumbUrl = URL.createObjectURL(file);
    }
    
    fileList.value = [...fileList.value, uploadFile];
    emitFileChange(uploadFile);
    
    if (props.autoUpload) {
      startUpload(uploadFile);
    }
  }
};

const startUpload = (uploadFile: UploadFile) => {
  if (uploadFile.status === 'uploading') return;
  if (!props.action) {
    uploadFile.status = 'success';
    emitFileChange(uploadFile);
    emit('success', uploadFile, fileList.value);
    return;
  }
  if (requests.value.size >= Math.max(1, props.maxConcurrency)) {
    if (!uploadQueue.value.includes(uploadFile.uid)) {
      uploadQueue.value.push(uploadFile.uid);
    }
    return;
  }
  const retries = (uploadFile as UploadFile & { __retries?: number }).__retries ?? 0;
  
  uploadFile.status = 'uploading';
  emitFileChange(uploadFile);
  
  const xhr = new XMLHttpRequest();
  const formData = new FormData();
  
  formData.append('file', uploadFile.raw as File);
  
  Object.entries(props.data).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      uploadFile.progress = Math.round((e.loaded / e.total) * 100);
      emit('progress', uploadFile);
    }
  });
  
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        uploadFile.response = JSON.parse(xhr.responseText);
        uploadFile.status = 'success';
        emitFileChange(uploadFile);
        emit('success', uploadFile, fileList.value);
      } catch {
        uploadFile.status = 'error';
        uploadFile.error = new Error('响应解析失败');
        emitFileChange(uploadFile);
        emit('error', uploadFile.error as Error, uploadFile, fileList.value);
      }
    } else {
      const maxRetry = Math.max(0, props.retryCount);
      if (retries < maxRetry) {
        (uploadFile as UploadFile & { __retries?: number }).__retries = retries + 1;
        uploadFile.status = 'ready';
        emitFileChange(uploadFile);
        const delay = Math.max(0, props.retryDelay);
        window.setTimeout(() => startUpload(uploadFile), delay);
      } else {
        uploadFile.status = 'error';
        uploadFile.error = new Error(xhr.statusText || `HTTP ${xhr.status}`);
        emitFileChange(uploadFile);
        emit('error', uploadFile.error as Error, uploadFile, fileList.value);
      }
    }
    requests.value.delete(uploadFile.uid);
    flushQueue();
  });
  
  xhr.addEventListener('error', () => {
    const maxRetry = Math.max(0, props.retryCount);
    if (retries < maxRetry) {
      (uploadFile as UploadFile & { __retries?: number }).__retries = retries + 1;
      uploadFile.status = 'ready';
      emitFileChange(uploadFile);
      const delay = Math.max(0, props.retryDelay);
      window.setTimeout(() => startUpload(uploadFile), delay);
    } else {
      uploadFile.status = 'error';
      uploadFile.error = new Error('网络错误');
      emitFileChange(uploadFile);
      emit('error', uploadFile.error as Error, uploadFile, fileList.value);
    }
    requests.value.delete(uploadFile.uid);
    flushQueue();
  });
  
  xhr.addEventListener('abort', () => {
    uploadFile.status = 'error';
    uploadFile.error = new Error('上传已取消');
    emitFileChange(uploadFile);
    requests.value.delete(uploadFile.uid);
    flushQueue();
  });
  
  xhr.open('POST', props.action, true);
  
  if (props.withCredentials) {
    xhr.withCredentials = true;
  }
  
  Object.entries(props.headers).forEach(([key, value]) => {
    xhr.setRequestHeader(key, value);
  });
  
  xhr.send(formData);
  requests.value.set(uploadFile.uid, xhr);
};

const flushQueue = () => {
  const maxConcurrency = Math.max(1, props.maxConcurrency);
  while (requests.value.size < maxConcurrency && uploadQueue.value.length > 0) {
    const nextUid = uploadQueue.value.shift();
    const nextFile = fileList.value.find((file) => file.uid === nextUid);
    if (nextFile && nextFile.status === 'ready') {
      startUpload(nextFile);
    }
  }
};

const handleAbort = (file: UploadFile) => {
  const xhr = requests.value.get(file.uid);
  if (xhr) {
    xhr.abort();
  }
  handleRemove(file);
};

const handleRetry = (file: UploadFile) => {
  if (!file.raw || props.disabled) return;
  (file as UploadFile & { __retries?: number }).__retries = 0;
  file.status = 'ready';
  file.error = undefined;
  file.progress = 0;
  emitFileChange(file);
  if (!uploadQueue.value.includes(file.uid)) {
    uploadQueue.value.push(file.uid);
  }
  flushQueue();
};

const handleRemove = (file: UploadFile) => {
  const xhr = requests.value.get(file.uid);
  if (xhr) {
    xhr.abort();
    requests.value.delete(file.uid);
  }
  
  if (file.thumbUrl) {
    URL.revokeObjectURL(file.thumbUrl);
  }
  
  uploadQueue.value = uploadQueue.value.filter((uid) => uid !== file.uid);
  const index = fileList.value.findIndex(f => f.uid === file.uid);
  if (index > -1) {
    const newFileList = [...fileList.value];
    newFileList.splice(index, 1);
    fileList.value = newFileList;
    emitFileChange(file);
    emit('remove', file, fileList.value);
  }
};

const handlePreview = (file: UploadFile) => {
  emit('preview', file);
};

const submit = () => {
  fileList.value
    .filter(file => file.status === 'ready')
    .forEach((file) => {
      if (!uploadQueue.value.includes(file.uid)) {
        uploadQueue.value.push(file.uid);
      }
    });
  flushQueue();
};

const clearFiles = () => {
  fileList.value.forEach(file => {
    if (file.thumbUrl) {
      URL.revokeObjectURL(file.thumbUrl);
    }
  });
  fileList.value = [];
};

onUnmounted(() => {
  requests.value.forEach((xhr) => xhr.abort());
  requests.value.clear();
  uploadQueue.value = [];
  fileList.value.forEach((file) => {
    if (file.thumbUrl) {
      URL.revokeObjectURL(file.thumbUrl);
    }
  });
});

defineExpose({
  submit,
  clearFiles,
  fileList,
});
</script>

<style scoped>
.upload {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.upload-input {
  display: none;
}

.upload-trigger {
  display: inline-block;
}

.upload-trigger--dragover {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.05);
}

.upload-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.upload-button:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
  box-shadow: var(--shadow-sm);
}

.upload-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-button-icon {
  width: 16px;
  height: 16px;
}

.upload-drag-text {
  margin-top: 12px;
  text-align: center;
  font-size: 14px;
  color: hsl(var(--text-muted));
}

.upload-drag-text em {
  color: hsl(var(--primary));
  font-style: normal;
  cursor: pointer;
}

.upload-picture-card {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background: hsl(var(--surface-inset));
  border: 1px dashed hsl(var(--border));
  border-radius: 12px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.upload-picture-card:hover:not(.upload-picture-card--disabled) {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.05);
}

.upload-picture-card--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-picture-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: hsl(var(--text-muted));
}

.upload-picture-icon svg {
  width: 24px;
  height: 24px;
}

.upload-picture-text {
  margin-top: 8px;
  font-size: 12px;
  color: hsl(var(--text-muted));
}

.upload-list {
  margin-top: 12px;
}

.upload-list--text .upload-list-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  margin-bottom: 8px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.upload-list--text .upload-list-item:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
}

.upload-list-item-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.upload-list-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  color: hsl(var(--text-muted));
  flex-shrink: 0;
}

.upload-list-item-icon svg {
  width: 16px;
  height: 16px;
}

.upload-icon-loading {
  animation: upload-spin 1s linear infinite;
}

@keyframes upload-spin {
  to { transform: rotate(360deg); }
}

.upload-list-item--success .upload-list-item-icon {
  color: hsl(var(--success));
}

.upload-list-item--error .upload-list-item-icon {
  color: hsl(var(--error));
}

.upload-list-item-name {
  flex: 1;
  font-size: 14px;
  color: hsl(var(--text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-list-item-size {
  margin-left: 8px;
  font-size: 12px;
  color: hsl(var(--text-muted));
  flex-shrink: 0;
}

.upload-list-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}

.upload-list-item-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.upload-list-item-btn:hover {
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text));
}

.upload-list-item-btn svg {
  width: 14px;
  height: 14px;
}

.upload-list-item-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: hsl(var(--border));
  border-radius: 0 0 10px 10px;
  overflow: hidden;
}

.upload-progress-bar {
  height: 100%;
  background: hsl(var(--primary));
  transition: width 0.3s;
}

.upload-list--picture {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.upload-list--picture .upload-list-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
}

.upload-list-item-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
}

.upload-list-item-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-list-item-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: hsl(var(--text-muted));
}

.upload-list-item-placeholder svg {
  width: 32px;
  height: 32px;
}

.upload-list-item-uploading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background) / 0.8);
}

.upload-progress-circle {
  position: relative;
  width: 48px;
  height: 48px;
}

.upload-progress-circle svg {
  width: 100%;
  height: 100%;
  color: hsl(var(--primary));
}

.upload-progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 500;
  color: hsl(var(--text));
}

.upload-list-item-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: hsl(var(--background) / 0.6);
  opacity: 0;
  transition: opacity 0.2s;
}

.upload-list--picture .upload-list-item:hover .upload-list-item-mask {
  opacity: 1;
}

.upload-list-item-mask-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: hsl(var(--surface));
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: hsl(var(--text));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.upload-list-item-mask-btn:hover {
  background: hsl(var(--primary));
  color: white;
}

.upload-list-item-mask-btn svg {
  width: 14px;
  height: 14px;
}

.upload-list-item-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: hsl(var(--background) / 0.8);
  color: hsl(var(--error));
  font-size: 12px;
}

.upload-list-item-error svg {
  width: 24px;
  height: 24px;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: hsl(var(--text-muted));
}

.upload--disabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>
