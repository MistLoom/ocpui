&lt;!--
告警项组件

Props:
- title: string - 告警标题
- message?: string - 告警消息
- details?: string - 告警详情
- source?: string - 告警来源
- time: string - 告警时间显示文本
- timestamp?: string - 告警时间戳
- isRead?: boolean - 是否已读，默认值：false
- status?: 'new' | 'confirmed' | 'ignored' - 告警状态，默认值：'confirmed'
- level?: 'info' | 'warning' | 'error' | 'critical' - 告警级别，默认值：'info'
- riskLevel?: 'critical' | 'high' | 'medium' | 'low' | 'info' - 风险级别
- actions?: AlertAction[] - 自定义操作按钮，默认值：[]
- showDefaultActions?: boolean - 是否显示默认操作，默认值：true
- customClass?: string - 自定义类名
- iconSize?: number - 图标大小，默认值：16

Events:
- click: [] - 点击告警项
- mark-read: [] - 标记为已读
- view-detail: [] - 查看详情
- action: [key: string] - 自定义操作

Usage:
&lt;AlertItem
  title="系统异常"
  message="服务器CPU使用率超过90%"
  time="2024-01-01 12:00"
  :level="'error'"
  :isRead="false"
  @click="handleAlertClick"
  @mark-read="handleMarkRead"
  @view-detail="handleViewDetail"
/&gt;

AlertAction 接口:
- key: string - 操作键
- label: string - 操作标签
- type?: 'primary' | 'secondary' | 'danger' - 操作类型
- icon?: string - 操作图标
--&gt;
<template>
  <div
    :class="alertClass"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="handleClick"
  >
    <!-- 左侧彩色边框 -->
    <div class="alert-border" :style="{ backgroundColor: levelColor }" />

    <!-- 告警图标 -->
    <div class="alert-icon-wrapper" :style="{ backgroundColor: `${levelColor}15` }">
      <Icon :name="levelIcon" :size="iconSize" :color="iconColor" />
    </div>

    <!-- 告警内容 -->
    <div class="alert-content">
      <div class="alert-header">
        <div class="alert-header-left">
          <span class="alert-title" :title="title">{{ title }}</span>
          <RiskBadge v-if="riskLevel" :level="riskLevel" size="sm" class="alert-risk-badge" />
        </div>
        <div class="alert-header-right">
          <span class="alert-time">{{ displayTime }}</span>
          <span v-if="!isRead" class="unread-badge" :style="{ color: levelColor, backgroundColor: `${levelColor}20` }">{{ t('components.dataDisplay.alertItem.unread') }}</span>
        </div>
      </div>
      <div v-if="message" class="alert-message">{{ message }}</div>
      <div v-if="details || source" class="alert-meta">
        <span v-if="source" class="alert-source">
          <Icon name="server" :size="10" color="default" />
          {{ source }}
        </span>
        <span v-if="details" class="alert-details">{{ details }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="(actions.length > 0 || showDefaultActions) && isHovered" class="alert-actions">
      <button
        v-if="showDefaultActions && !isRead"
        class="action-btn"
        :title="t('components.dataDisplay.alertItem.markAsRead')"
        @click.stop="handleMarkRead"
      >
        <Icon name="check" :size="12" />
      </button>
      <button
        v-if="showDefaultActions"
        class="action-btn"
        :title="t('components.dataDisplay.alertItem.viewDetail')"
        @click.stop="handleViewDetail"
      >
        <Icon name="arrow-right" :size="12" />
      </button>
      <button
        v-for="action in actions"
        :key="action.key"
        type="button"
        :class="['action-btn', action.type ? `action-btn--${action.type}` : '']"
        :title="action.label"
        @click.stop="handleAction(action.key)"
      >
        <Icon v-if="action.icon" :name="action.icon" :size="12" />
        <span v-if="!action.icon" class="action-label">{{ action.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '../utility';
import RiskBadge from './RiskBadge.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

// 类型定义
type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
type AlertLevel = 'info' | 'warning' | 'error' | 'critical';
type ActionType = 'primary' | 'secondary' | 'danger';

interface AlertAction {
  key: string;
  label: string;
  type?: ActionType;
  icon?: string;
}

interface Props {
  // 基本信息
  title: string;
  message?: string;
  details?: string;
  source?: string;
  time: string;
  timestamp?: string;
  
  // 状态信息
  isRead?: boolean;
  status?: 'new' | 'confirmed' | 'ignored';
  
  // 级别信息
  level?: AlertLevel;
  riskLevel?: RiskLevel;
  
  // 操作信息
  actions?: AlertAction[];
  showDefaultActions?: boolean;
  
  // 样式信息
  customClass?: string;
  iconSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  details: '',
  source: '',
  timestamp: '',
  isRead: false,
  status: 'confirmed',
  level: 'info',
  riskLevel: undefined,
  actions: () => [],
  showDefaultActions: true,
  customClass: '',
  iconSize: 16,
});

const emit = defineEmits<{
  'click': [];
  'mark-read': [];
  'view-detail': [];
  'action': [key: string];
}>();

// 悬停状态
const isHovered = ref(false);

// 计算属性
const alertClass = computed(() => {
  const classes = ['alert-item', `level-${props.level}`];
  if (props.status === 'new') classes.push('alert-item--new');
  if (props.status === 'ignored') classes.push('alert-item--ignored');
  if (props.isRead) classes.push('is-read');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const levelConfig = computed(() => {
  const configs: Record<AlertLevel, { icon: string; color: string; iconColor: 'info' | 'warning' | 'error'; label: string }> = {
    info: { icon: 'info-circle', color: 'hsl(var(--info))', iconColor: 'info', label: t('components.dataDisplay.alertItem.levelLabels.info') },
    warning: { icon: 'alert-triangle', color: 'hsl(var(--warning))', iconColor: 'warning', label: t('components.dataDisplay.alertItem.levelLabels.warning') },
    error: { icon: 'alert-circle', color: 'hsl(var(--error))', iconColor: 'error', label: t('components.dataDisplay.alertItem.levelLabels.error') },
    critical: { icon: 'alert-octagon', color: 'hsl(var(--error))', iconColor: 'error', label: t('components.dataDisplay.alertItem.levelLabels.critical') },
  };
  return configs[props.level];
});

const riskLevelConfig = computed(() => {
  const configs: Record<RiskLevel, { icon: string; color: string; iconColor: 'error' | 'warning' | 'info' | 'default' }> = {
    critical: { icon: 'alert-octagon', color: 'hsl(var(--error))', iconColor: 'error' },
    high: { icon: 'alert-triangle', color: 'hsl(var(--error))', iconColor: 'error' },
    medium: { icon: 'alert-circle', color: 'hsl(var(--warning))', iconColor: 'warning' },
    low: { icon: 'info', color: 'hsl(var(--info))', iconColor: 'info' },
    info: { icon: 'info', color: 'hsl(var(--text-secondary))', iconColor: 'default' },
  };
  return props.riskLevel ? configs[props.riskLevel] : null;
});

const levelIcon = computed(() => {
  return props.riskLevel && riskLevelConfig.value 
    ? riskLevelConfig.value.icon 
    : levelConfig.value.icon;
});

const levelColor = computed(() => {
  return props.riskLevel && riskLevelConfig.value 
    ? riskLevelConfig.value.color 
    : levelConfig.value.color;
});

const iconColor = computed(() => {
  const result = props.riskLevel && riskLevelConfig.value 
    ? riskLevelConfig.value.iconColor 
    : levelConfig.value.iconColor;
  return result as 'info' | 'warning' | 'error' | 'default';
});

// 显示时间
const displayTime = computed(() => {
  if (!props.timestamp) return props.time;
  
  const now = new Date().getTime();
  const alertTime = new Date(props.timestamp).getTime();
  const diff = now - alertTime;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t('components.dataDisplay.alertItem.timeFormat.justNow');
  if (minutes < 60) return t('components.dataDisplay.alertItem.timeFormat.minutesAgo', { minutes });
  if (hours < 24) return t('components.dataDisplay.alertItem.timeFormat.hoursAgo', { hours });
  if (days < 7) return t('components.dataDisplay.alertItem.timeFormat.daysAgo', { days });
  return new Date(props.timestamp).toLocaleDateString('zh-CN');
});

// 事件处理
const handleClick = () => {
  emit('click');
};

const handleMarkRead = () => {
  emit('mark-read');
};

const handleViewDetail = () => {
  emit('view-detail');
};

const handleAction = (key: string) => {
  emit('action', key);
};
</script>

<style scoped>
.alert-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.alert-item:hover {
  border-color: v-bind(levelColor);
}

.alert-item--new {
  background: hsl(var(--primary) / 0.03);
  border-color: hsl(var(--primary) / 0.2);
}

.alert-item--new .alert-icon-wrapper {
  outline: 2px solid v-bind(levelColor);
  outline-offset: 2px;
}

.alert-item--ignored {
  opacity: 0.6;
}

.alert-item.is-read .alert-title {
  font-weight: 400;
}

/* 左侧彩色边框 */
.alert-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.alert-item:hover .alert-border,
.alert-item:not(.is-read) .alert-border {
  opacity: 1;
}

/* 告警图标 */
.alert-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.alert-item:hover .alert-icon-wrapper {
  opacity: 0.8;
}

/* 告警内容 */
.alert-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alert-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.alert-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.alert-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.alert-title {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.alert-risk-badge {
  flex-shrink: 0;
}

.alert-time {
  font-size: 12px;
  color: hsl(var(--text-muted));
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.unread-badge {
  font-size: 10px;
  font-weight: 500;
  color: v-bind(levelColor);
  background: v-bind(levelColor + '20');
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}

.alert-message {
  font-size: 13px;
  color: hsl(var(--text-secondary));
  line-height: 1.4;
}

.alert-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.alert-source,
.alert-details {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: hsl(var(--text-muted));
  line-height: 1.3;
}

/* 操作按钮 */
.alert-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 10px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--surface));
  border-radius: 6px;
  color: hsl(var(--text-secondary));
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  font-size: 12px;
  white-space: nowrap;
}

.action-btn:hover {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.action-btn--primary {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.action-btn--primary:hover {
  background: hsl(var(--primary) / 0.9);
}

.action-btn--danger {
  border-color: hsl(var(--error) / 0.3);
  color: hsl(var(--error));
}

.action-btn--danger:hover {
  background: hsl(var(--error));
  border-color: hsl(var(--error));
  color: hsl(var(--primary-foreground));
}

.action-label {
  font-size: 11px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 767.98px) {
  .alert-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;
    gap: 10px;
  }
  
  .alert-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .alert-header-left,
  .alert-header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .alert-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid hsl(var(--border));
  }
  
  .action-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}

@media (max-width: 575.98px) {
  .alert-icon-wrapper {
    width: 32px;
    height: 32px;
  }
  
  .alert-title {
    font-size: 15px;
  }
  
  .alert-message {
    font-size: 14px;
  }
  
  .alert-source,
  .alert-details {
    font-size: 13px;
  }
}
</style>
