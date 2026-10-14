<!--
StatusBlock 状态块组件

CMS专用状态块组件，用于展示不同状态的错误、空状态、权限等场景。

属性：
- status: 状态类型，可选值：'error' | 'empty' | 'permission' | 'offline' | 'partial'，默认值：'error'
- title: 标题文本，默认值：根据status自动显示
- description: 描述文本，可选
- actions: 操作按钮配置，格式为 [{ text: string, variant?: string, onClick?: () => void }]，可选
- compact: 是否为紧凑模式，默认值：false

插槽：
- default: 自定义描述内容
- actions: 自定义操作区域
- icon: 自定义图标

事件：-

使用方式：
<StatusBlock
  status="error"
  title="加载失败"
  description="获取数据时出现错误"
  :actions="[{ text: '重试', variant: 'primary', onClick: handleRetry }]"
/>

<StatusBlock
  status="empty"
  title="暂无数据"
>
  <template #actions>
    <Button variant="secondary" @click="handleRefresh">{{ t('components.feedback.statusBlock.refresh') }}</Button>
  </template>
</StatusBlock>

<StatusBlock
  status="permission"
  title="无权限"
  description="您没有访问此内容的权限"
/>

<StatusBlock
  status="offline"
  title="网络已断开"
  description="请检查网络连接"
/>

<StatusBlock
  status="partial"
  title="部分失败"
  description="有 3 项操作失败"
  :actions="[{ text: '查看详情', variant: 'secondary' }]"
/>
-->
<template>
  <div class="status-block" :class="[`status-block--${status}`, { 'status-block--compact': compact }]">
    <div class="status-block-header">
      <div class="status-block-icon">
        <slot name="icon">
          <svg v-if="status === 'error'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <svg v-else-if="status === 'empty'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/>
          </svg>
          <svg v-else-if="status === 'permission'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
          <svg v-else-if="status === 'offline'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-3.22 10.42l-1.41-1.41L12 20 6.42 14.41 5 15.82 12 22.82l7-7-1.58-1.4zM3.41 1.31L2 2.72l2.05 2.05C1.91 5.76.59 6.82.36 7L12 21l6.36-2.65c.47-.47.47-1.24.34-1.57l-1.29-1.29-7.43 7.43L2.72 4.09 3.41 1.31z"/>
          </svg>
          <svg v-else-if="status === 'partial'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </slot>
      </div>
      <div class="status-block-content">
        <h4 class="status-block-title">{{ title || defaultTitle }}</h4>
        <div v-if="description || $slots.default" class="status-block-description">
          <slot>{{ description }}</slot>
        </div>
      </div>
    </div>

    <div v-if="actions.length > 0 || $slots.actions" class="status-block-actions">
      <slot name="actions">
        <template v-for="(action, index) in actions" :key="index">
          <button
            :class="['status-block-action', `status-block-action--${action.variant || 'secondary'}`]"
            @click="handleAction(action)"
          >
            {{ action.text }}
          </button>
        </template>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

type StatusType = 'error' | 'empty' | 'permission' | 'offline' | 'partial';

interface Action {
  text: string;
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  onClick?: () => void;
}

interface Props {
  status?: StatusType;
  title?: string;
  description?: string;
  actions?: Action[];
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  status: 'error',
  title: '',
  description: '',
  actions: () => [],
  compact: false,
});

const defaultTitle = computed(() => {
  const titleMap: Record<StatusType, string> = {
    error: t('components.feedback.statusBlock.defaultTitles.error'),
    empty: t('components.feedback.statusBlock.defaultTitles.empty'),
    permission: t('components.feedback.statusBlock.defaultTitles.permission'),
    offline: t('components.feedback.statusBlock.defaultTitles.offline'),
    partial: t('components.feedback.statusBlock.defaultTitles.partial'),
  };
  return titleMap[props.status];
});

const handleAction = (action: Action) => {
  action.onClick?.();
};
</script>

<style scoped>
.status-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--surface));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.status-block--error {
  background: hsl(var(--error) / 0.05);
  border-color: hsl(var(--error) / 0.2);
}

.status-block--error .status-block-icon {
  color: hsl(var(--error));
}

.status-block--empty {
  background: hsl(var(--surface-container-high));
  border-color: hsl(var(--border));
}

.status-block--empty .status-block-icon {
  color: hsl(var(--text-muted));
}

.status-block--permission {
  background: hsl(var(--warning) / 0.05);
  border-color: hsl(var(--warning) / 0.2);
}

.status-block--permission .status-block-icon {
  color: hsl(var(--warning));
}

.status-block--offline {
  background: hsl(var(--text) / 0.03);
  border-color: hsl(var(--border));
}

.status-block--offline .status-block-icon {
  color: hsl(var(--text-muted));
}

.status-block--partial {
  background: hsl(var(--warning) / 0.08);
  border-color: hsl(var(--warning) / 0.25);
}

.status-block--partial .status-block-icon {
  color: hsl(var(--warning));
}

.status-block-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.status-block-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin-top: 2px;
}

.status-block-icon svg {
  width: 100%;
  height: 100%;
}

.status-block-content {
  flex: 1;
  min-width: 0;
}

.status-block-title {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--text));
  margin: 0 0 4px;
  line-height: 1.4;
}

.status-block-description {
  font-size: 13px;
  color: hsl(var(--text-secondary));
  line-height: 1.5;
  margin: 0;
}

.status-block-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 4px;
}

.status-block-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.status-block-action--primary {
  background: hsl(var(--primary));
  color: white;
}

.status-block-action--primary:hover {
  background: hsl(var(--primary) / 0.9);
}

.status-block-action--secondary {
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text));
  border: 1px solid hsl(var(--border));
}

.status-block-action--secondary:hover {
  background: hsl(var(--surface-hover));
}

.status-block-action--text {
  background: transparent;
  color: hsl(var(--primary));
  padding: 8px 12px;
}

.status-block-action--text:hover {
  background: hsl(var(--primary) / 0.08);
}

.status-block-action--danger {
  background: hsl(var(--error));
  color: white;
}

.status-block-action--danger:hover {
  background: hsl(var(--error) / 0.9);
}

/* Compact 紧凑模式 */
.status-block--compact {
  padding: 12px 16px;
  gap: 12px;
}

.status-block--compact .status-block-header {
  gap: 10px;
}

.status-block--compact .status-block-icon {
  width: 20px;
  height: 20px;
  margin-top: 1px;
}

.status-block--compact .status-block-title {
  font-size: 13px;
  margin-bottom: 2px;
}

.status-block--compact .status-block-description {
  font-size: 12px;
}

.status-block--compact .status-block-actions {
  padding-top: 0;
}

.status-block--compact .status-block-action {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .status-block {
    padding: 16px;
    gap: 12px;
  }

  .status-block-title {
    font-size: 13px;
  }

  .status-block-description {
    font-size: 12px;
  }

  .status-block-actions {
    flex-direction: column;
    width: 100%;
  }

  .status-block-action {
    width: 100%;
  }
}
</style>
