<!--
ProcessProgress 流程进度组件

功能：可视化多步骤流程进度，支持当前步骤详情、文件进度、预计时间、取消与完成操作。

属性：
- steps: ProcessStep[] - 步骤列表，每项包含 key、title、可选 description
- currentStep: string - 当前步骤的 key
- progress: number - 进度百分比
- files: ProcessFile[] - 文件列表
- showProgress: boolean - 是否显示进度条
- showTime: boolean - 是否显示预计时间
- estimatedTime: string - 预计剩余时间
- cancellable: boolean - 是否可取消
- cancelText: string - 取消按钮文本
- completeText: string - 完成按钮文本

事件：
- cancel: [] - 取消操作时触发
- complete: [] - 完成操作时触发

公开方法：
- currentStepIndex - 当前步骤索引

使用方式：
<ProcessProgress
  :steps="steps"
  :current-step="currentStep"
  :progress="progress"
  :files="files"
  @cancel="handleCancel"
  @complete="handleComplete"
/>
-->
<template>
  <div class="process-progress">
    <!-- 步骤指示器 -->
    <div class="process-progress-steps">
      <div
        v-for="(step, index) in steps"
        :key="step.key"
        class="process-progress-step"
        :class="{
          'process-progress-step--completed': index < currentStepIndex,
          'process-progress-step--current': index === currentStepIndex,
          'process-progress-step--pending': index > currentStepIndex,
        }"
      >
        <div class="process-progress-step-indicator">
          <div class="process-progress-step-icon">
            <svg v-if="index < currentStepIndex" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <span v-else class="process-progress-step-number">
              {{ index + 1 }}
            </span>
          </div>
          <div v-if="index < steps.length - 1" class="process-progress-step-line">
            <div
              class="process-progress-step-line-fill"
              :style="{ width: index < currentStepIndex ? '100%' : '0%' }"
            />
          </div>
        </div>
        <div class="process-progress-step-content">
          <div class="process-progress-step-title">{{ step?.title || '' }}</div>
          <div v-if="step?.description" class="process-progress-step-description">
            {{ step.description }}
          </div>
        </div>
      </div>
    </div>

    <!-- 当前步骤详情 -->
    <div class="process-progress-detail">
      <div class="process-progress-status">
        <div class="process-progress-status-text">{{ currentStatus }}</div>
        <div v-if="showTime && estimatedTime" class="process-progress-time">
          {{ t('components.feedback.processProgress.estimatedTime', { time: estimatedTime }) }}
        </div>
      </div>

      <!-- 进度条 -->
      <div v-if="showProgress" class="process-progress-bar">
        <div class="process-progress-bar-track">
          <div
            class="process-progress-bar-fill"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <div class="process-progress-bar-text">{{ progress }}%</div>
      </div>

      <!-- 文件列表 -->
      <div v-if="files.length > 0" class="process-progress-files">
        <div
          v-for="file in files"
          :key="file.name"
          class="process-progress-file"
        >
          <div class="process-progress-file-info">
            <Icon :name="fileIcon(file)" :size="16" />
            <span class="process-progress-file-name">{{ file.name }}</span>
            <span class="process-progress-file-size">{{ file.size }}</span>
          </div>
          <div class="process-progress-file-status">
            <div v-if="file.status === 'uploading'" class="process-progress-file-progress">
              <div class="process-progress-file-bar">
                <div
                  class="process-progress-file-fill"
                  :style="{ width: `${file.progress}%` }"
                />
              </div>
              <span class="process-progress-file-percent">{{ file.progress }}%</span>
            </div>
            <Icon
              v-else-if="file.status === 'success'"
              name="check-circle"
              :size="16"
              class="process-progress-file-success"
            />
            <Icon
              v-else-if="file.status === 'error'"
              name="x-circle"
              :size="16"
              class="process-progress-file-error"
            />
            <Icon
              v-else-if="file.status === 'pending'"
              name="clock"
              :size="16"
              class="process-progress-file-pending"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="process-progress-actions">
      <Button
        v-if="cancellable"
        variant="text"
        :loading="cancelling"
        @click="handleCancel"
      >
        {{ cancelText }}
      </Button>
      <Button
        v-if="isLastStepCompleted"
        variant="primary"
        @click="handleComplete"
      >
        {{ completeText }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button, Icon } from '../utility';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

export interface ProcessStep {
  key: string;
  title: string;
  description?: string;
}

export interface ProcessFile {
  name: string;
  size: string;
  status: 'uploading' | 'success' | 'error' | 'pending';
  progress: number;
  type?: string;
}

interface Props {
  steps: ProcessStep[];
  currentStep: string;
  progress?: number;
  files?: ProcessFile[];
  showProgress?: boolean;
  showTime?: boolean;
  estimatedTime?: string;
  cancellable?: boolean;
  cancelText?: string;
  completeText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  files: () => [],
  showProgress: true,
  showTime: true,
  estimatedTime: '',
  cancellable: true,
  cancelText: '',
  completeText: '',
});

const emit = defineEmits<{
  cancel: [];
  complete: [];
}>();

const cancelling = ref(false);

const currentStepIndex = computed(() => {
  return props.steps.findIndex(step => step.key === props.currentStep);
});

const isLastStepCompleted = computed(() => {
  return currentStepIndex.value === props.steps.length - 1 && props.progress === 100;
});

const currentStatus = computed(() => {
  const step = props.steps[currentStepIndex.value];
  if (!step) return '';

  if (isLastStepCompleted.value) {
    return t('components.feedback.processProgress.completed');
  }

  return t('components.feedback.processProgress.processing', { title: step.title });
});

const fileIcon = (file: ProcessFile): string => {
  const type = file.type || file.name.split('.').pop()?.toLowerCase();

  const iconMap: Record<string, string> = {
    pdf: 'file-text',
    doc: 'file-text',
    docx: 'file-text',
    xls: 'table',
    xlsx: 'table',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    zip: 'archive',
    rar: 'archive',
  };

  return iconMap[type || ''] || 'file';
};

const handleCancel = async () => {
  cancelling.value = true;
  emit('cancel');
  cancelling.value = false;
};

const handleComplete = () => {
  emit('complete');
};

defineExpose({
  currentStepIndex,
});
</script>

<style scoped>
.process-progress {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 步骤指示器 */
.process-progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.process-progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.process-progress-step-indicator {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
}

.process-progress-step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.process-progress-step-icon svg {
  width: 18px;
  height: 18px;
}

.process-progress-step-number {
  font-size: 14px;
  font-weight: 600;
}

.process-progress-step--completed .process-progress-step-icon {
  background: hsl(var(--success) / 0.1);
  color: hsl(var(--success));
}

.process-progress-step--current .process-progress-step-icon {
  background: hsl(var(--primary));
  color: white;
  box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2);
}

.process-progress-step--pending .process-progress-step-icon {
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text-muted));
  border: 2px solid hsl(var(--border));
}

.process-progress-step-line {
  flex: 1;
  height: 2px;
  background: hsl(var(--border));
  margin: 0 8px;
  position: relative;
  overflow: hidden;
}

.process-progress-step-line-fill {
  height: 100%;
  background: hsl(var(--success));
  transition: width 0.3s ease;
}

.process-progress-step-content {
  text-align: center;
}

.process-progress-step-title {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--text));
  margin-bottom: 2px;
}

.process-progress-step-description {
  font-size: 11px;
  color: hsl(var(--text-muted));
}

/* 详情区域 */
.process-progress-detail {
  background: hsl(var(--surface-container-high));
  border-radius: 12px;
  padding: 20px;
}

.process-progress-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.process-progress-status-text {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
}

.process-progress-time {
  font-size: 12px;
  color: hsl(var(--text-muted));
}

/* 进度条 */
.process-progress-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.process-progress-bar-track {
  flex: 1;
  height: 6px;
  background: hsl(var(--border));
  border-radius: 3px;
  overflow: hidden;
}

.process-progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.8));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.process-progress-bar-text {
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--primary));
  min-width: 36px;
  text-align: right;
}

/* 文件列表 */
.process-progress-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.process-progress-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: hsl(var(--surface));
  border-radius: 8px;
}

.process-progress-file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.process-progress-file-name {
  font-size: 13px;
  color: hsl(var(--text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.process-progress-file-size {
  font-size: 11px;
  color: hsl(var(--text-muted));
  flex-shrink: 0;
}

.process-progress-file-status {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.process-progress-file-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100px;
}

.process-progress-file-bar {
  flex: 1;
  height: 4px;
  background: hsl(var(--border));
  border-radius: 2px;
  overflow: hidden;
}

.process-progress-file-fill {
  height: 100%;
  background: hsl(var(--primary));
  border-radius: 2px;
  transition: width 0.3s ease;
}

.process-progress-file-percent {
  font-size: 11px;
  color: hsl(var(--text-muted));
  min-width: 28px;
  text-align: right;
}

.process-progress-file-success {
  color: hsl(var(--success));
}

.process-progress-file-error {
  color: hsl(var(--error));
}

.process-progress-file-pending {
  color: hsl(var(--warning));
}

/* 操作按钮 */
.process-progress-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
