<template>
  <span class="status-tag" :class="[`status-${status}`, `size-${size}`, { 'status-pulsing': pulsing }]">
    <span class="status-dot" />
    <span v-if="label || statusText" class="status-text">{{ label ?? statusText }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 所有可能的状态值
import type { StatusType } from './status-tag.types';

interface StatusTagProps {
  status: StatusType;
  size?: 'sm' | 'md';
  pulsing?: boolean;
  label?: string;
}

const props = withDefaults(defineProps<StatusTagProps>(), {
  size: 'md',
  pulsing: false,
});

// 状态映射配置 - 使用语义化颜色标识
const statusMap: Record<string, { text: string; color: string }> = {
  // 用户状态
  active: { text: '活跃', color: 'success' },
  inactive: { text: '非活跃', color: 'muted' },
  locked: { text: '锁定', color: 'error' },
  pending: { text: '待处理', color: 'warning' },
  // 服务器状态
  online: { text: '在线', color: 'success' },
  offline: { text: '离线', color: 'muted' },
  warning: { text: '警告', color: 'warning' },
  error: { text: '错误', color: 'error' },
  maintenance: { text: '维护中', color: 'info' },
  // 服务状态
  healthy: { text: '健康', color: 'success' },
  degraded: { text: '降级', color: 'warning' },
  unhealthy: { text: '异常', color: 'error' },
  stopped: { text: '已停止', color: 'muted' },
  // 数据库状态
  connected: { text: '已连接', color: 'success' },
  disconnected: { text: '已断开', color: 'error' },
  replicating: { text: '复制中', color: 'info' },
  lagging: { text: '延迟', color: 'warning' },
  // 审批状态
  approved: { text: '已批准', color: 'success' },
  rejected: { text: '已拒绝', color: 'error' },
  revoked: { text: '已收回', color: 'info' },
  // 临时权限状态
  expiring: { text: '即将到期', color: 'warning' },
  // 登录状态
  'login-success': { text: '成功', color: 'success' },
  'login-failed': { text: '失败', color: 'error' },
  // 风险等级
  'high-risk': { text: '高风险', color: 'error' },
  'medium-risk': { text: '中风险', color: 'warning' },
  'low-risk': { text: '低风险', color: 'success' },
  // 交易状态
  'pending-audit': { text: '待审核', color: 'warning' },
  'audit-passed': { text: '已通过', color: 'success' },
  'audit-rejected': { text: '已拒绝', color: 'error' },
  // 调度任务状态
  'enabled': { text: '已启用', color: 'success' },
  'disabled': { text: '已禁用', color: 'muted' },
  'executing': { text: '执行中', color: 'info' },
  'success': { text: '成功', color: 'success' },
  'failed': { text: '失败', color: 'error' },
  'idle': { text: '空闲', color: 'muted' },
  // 订阅状态
  'subscribed': { text: '已订阅', color: 'success' },
  'unsubscribed': { text: '未订阅', color: 'muted' },
  // 发送状态
  'sent': { text: '已发送', color: 'success' },
  'unsent': { text: '未发送', color: 'muted' },
  'sending': { text: '发送中', color: 'info' },
  // 项目状态
  'planning': { text: '规划中', color: 'info' },
  'in_progress': { text: '进行中', color: 'success' },
  'delayed': { text: '已延期', color: 'error' },
  'completed': { text: '已完成', color: 'success' },
  'archived': { text: '已归档', color: 'muted' },
  // 任务状态
  'todo': { text: '待办', color: 'muted' },
  'review': { text: '审核中', color: 'warning' },
  // 风险状态
  'open': { text: '开放', color: 'error' },
  'mitigated': { text: '已缓解', color: 'warning' },
  'closed': { text: '已关闭', color: 'success' },
  // 资源状态
  'available': { text: '可用', color: 'success' },
  'busy': { text: '忙碌', color: 'error' },
  // 员工状态
  'probation': { text: '试用期', color: 'warning' },
  'suspended': { text: '停职', color: 'muted' },
  'resigned': { text: '已离职', color: 'muted' },
  // 发票状态
  'normal': { text: '正常', color: 'success' },
  'void': { text: '作废', color: 'muted' },
  'red': { text: '红冲', color: 'error' },
  // 费用状态
  'draft': { text: '草稿', color: 'muted' },
  'paid': { text: '已支付', color: 'success' },
  // 收付款状态
  'partial': { text: '部分', color: 'warning' },
  'overdue': { text: '逾期', color: 'error' },
};

const statusText = computed(() => statusMap[props.status]?.text || props.status);
</script>

<script lang="ts">
export default { name: 'StatusTag' };
</script>

<style scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 尺寸 */
.size-sm {
  font-size: 12px;
}

.size-sm .status-dot {
  width: 6px;
  height: 6px;
}

.size-md {
  font-size: 14px;
}

/* 脉冲动画 - 仅透明度呼吸，禁止发光 */
.status-pulsing .status-dot {
  animation: status-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes status-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* ========== 状态颜色 - 统一使用主题变量 ========== */

/* 成功色 */
.status-active .status-dot,
.status-online .status-dot,
.status-healthy .status-dot,
.status-connected .status-dot,
.status-approved .status-dot,
.status-login-success .status-dot,
.status-low-risk .status-dot,
.status-audit-passed .status-dot,
.status-enabled .status-dot,
.status-success .status-dot,
.status-subscribed .status-dot,
.status-sent .status-dot,
.status-in_progress .status-dot,
.status-completed .status-dot,
.status-available .status-dot,
.status-normal .status-dot,
.status-paid .status-dot,
.status-closed .status-dot {
  background: hsl(var(--success));
}

.status-active .status-text,
.status-online .status-text,
.status-healthy .status-text,
.status-connected .status-text,
.status-approved .status-text,
.status-login-success .status-text,
.status-low-risk .status-text,
.status-audit-passed .status-text,
.status-enabled .status-text,
.status-success .status-text,
.status-subscribed .status-text,
.status-sent .status-text,
.status-in_progress .status-text,
.status-completed .status-text,
.status-available .status-text,
.status-normal .status-text,
.status-paid .status-text,
.status-closed .status-text {
  color: hsl(var(--success));
}

/* 错误色 */
.status-locked .status-dot,
.status-error .status-dot,
.status-unhealthy .status-dot,
.status-disconnected .status-dot,
.status-rejected .status-dot,
.status-login-failed .status-dot,
.status-high-risk .status-dot,
.status-audit-rejected .status-dot,
.status-failed .status-dot,
.status-busy .status-dot,
.status-delayed .status-dot,
.status-open .status-dot,
.status-red .status-dot,
.status-overdue .status-dot {
  background: hsl(var(--error));
}

.status-locked .status-text,
.status-error .status-text,
.status-unhealthy .status-text,
.status-disconnected .status-text,
.status-rejected .status-text,
.status-login-failed .status-text,
.status-high-risk .status-text,
.status-audit-rejected .status-text,
.status-failed .status-text,
.status-busy .status-text,
.status-delayed .status-text,
.status-open .status-text,
.status-red .status-text,
.status-overdue .status-text {
  color: hsl(var(--error));
}

/* 警告色 */
.status-pending .status-dot,
.status-warning .status-dot,
.status-degraded .status-dot,
.status-lagging .status-dot,
.status-expiring .status-dot,
.status-medium-risk .status-dot,
.status-pending-audit .status-dot,
.status-review .status-dot,
.status-mitigated .status-dot,
.status-probation .status-dot,
.status-partial .status-dot {
  background: hsl(var(--warning));
}

.status-pending .status-text,
.status-warning .status-text,
.status-degraded .status-text,
.status-lagging .status-text,
.status-expiring .status-text,
.status-medium-risk .status-text,
.status-pending-audit .status-text,
.status-review .status-text,
.status-mitigated .status-text,
.status-probation .status-text,
.status-partial .status-text {
  color: hsl(var(--warning));
}

/* 信息色 */
.status-maintenance .status-dot,
.status-replicating .status-dot,
.status-executing .status-dot,
.status-sending .status-dot,
.status-planning .status-dot,
.status-revoked .status-dot {
  background: hsl(var(--info));
}

.status-maintenance .status-text,
.status-replicating .status-text,
.status-executing .status-text,
.status-sending .status-text,
.status-planning .status-text,
.status-revoked .status-text {
  color: hsl(var(--info));
}

/* 中性色 */
.status-inactive .status-dot,
.status-offline .status-dot,
.status-stopped .status-dot,
.status-disabled .status-dot,
.status-idle .status-dot,
.status-unsubscribed .status-dot,
.status-unsent .status-dot,
.status-archived .status-dot,
.status-todo .status-dot,
.status-suspended .status-dot,
.status-resigned .status-dot,
.status-void .status-dot,
.status-draft .status-dot {
  background: hsl(var(--text-muted));
}

.status-inactive .status-text,
.status-offline .status-text,
.status-stopped .status-text,
.status-disabled .status-text,
.status-idle .status-text,
.status-unsubscribed .status-text,
.status-unsent .status-text,
.status-archived .status-text,
.status-todo .status-text,
.status-suspended .status-text,
.status-resigned .status-text,
.status-void .status-text,
.status-draft .status-text {
  color: hsl(var(--text-muted));
}

/* 响应式样式 */
@media (max-width: 639.98px) {
  .status-tag {
    padding: 3px 10px;
    font-size: 0.75rem;
  }

  .status-dot {
    width: 6px;
    height: 6px;
  }
}
</style>
