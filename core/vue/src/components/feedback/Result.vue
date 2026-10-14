<template>
  <div :class="resultClass" v-bind="$attrs">
    <div class="result-icon">
      <slot name="icon">
        <Icon :name="iconName" :size="iconSize" />
      </slot>
    </div>
    <div class="result-title">
      <slot name="title">
        {{ title || defaultTitle }}
      </slot>
    </div>
    <div v-if="subtitle || $slots.subtitle" class="result-subtitle">
      <slot name="subtitle">
        {{ subtitle }}
      </slot>
    </div>
    <div v-if="$slots.extra" class="result-extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '../utility';

/**
 * Result 结果组件
 *
 * @props status - 状态类型，可选值：'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500' | 'maintenance' | 'account-locked'，默认为 'info'
 * @props title - 标题文本
 * @props subtitle - 副标题文本
 * @props iconSize - 图标大小，默认为 64
 * @props customClass - 自定义类名
 *
 * @slots icon - 自定义图标
 * @slots title - 自定义标题
 * @slots subtitle - 自定义副标题
 * @slots extra - 额外内容
 *
 * @usage
 * <template>
 *   <Result
 *     status="success"
 *     title="操作成功"
 *     subtitle="您的操作已成功完成"
 *   />
 *
 *   <Result
 *     status="maintenance"
 *     title="系统维护中"
 *     subtitle="请稍后再试"
 *   />
 *
 *   <Result
 *     status="account-locked"
 *     title="账户已被锁定"
 *     subtitle="请联系管理员解锁"
 *   />
 * </template>
 */

type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500' | 'maintenance' | 'account-locked';

interface Props {
  status?: ResultStatus;
  title?: string;
  subtitle?: string;
  iconSize?: number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  status: 'info',
  title: '',
  subtitle: '',
  iconSize: 64,
  customClass: '',
});

const resultClass = computed(() => {
  const classes = ['result', `result--${props.status}`];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const iconName = computed(() => {
  const iconMap: Record<ResultStatus, string> = {
    success: 'success',
    error: 'error',
    info: 'info',
    warning: 'warning',
    '404': 'search',
    '403': 'lock',
    '500': 'warning',
    maintenance: 'tool',
    'account-locked': 'lock',
  };
  return iconMap[props.status];
});

const defaultTitle = computed(() => {
  const titleMap: Record<ResultStatus, string> = {
    success: '操作成功',
    error: '操作失败',
    info: '提示信息',
    warning: '警告信息',
    '404': '页面不存在',
    '403': '无权限访问',
    '500': '服务器错误',
    maintenance: '系统维护中',
    'account-locked': '账户已被锁定',
  };
  return titleMap[props.status];
});
</script>

<style scoped>
.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.result-icon {
  margin-bottom: 24px;
}

.result--success .result-icon {
  color: hsl(var(--success));
}

.result--error .result-icon {
  color: hsl(var(--error));
}

.result--info .result-icon {
  color: hsl(var(--primary));
}

.result--warning .result-icon {
  color: hsl(var(--warning));
}

.result--404 .result-icon,
.result--403 .result-icon,
.result--500 .result-icon {
  color: hsl(var(--text-muted));
}

.result--maintenance .result-icon {
  color: hsl(var(--warning));
}

.result--account-locked .result-icon {
  color: hsl(var(--error));
}

.result-title {
  font-size: 24px;
  font-weight: 600;
  color: hsl(var(--text));
  margin-bottom: 12px;
  text-align: center;
}

.result-subtitle {
  font-size: 14px;
  color: hsl(var(--text-muted));
  text-align: center;
  max-width: 480px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.result-extra {
  margin-top: 16px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .result {
    padding: 32px 16px;
  }

  .result-icon {
    margin-bottom: 20px;
  }

  .result-title {
    font-size: 20px;
  }

  .result-subtitle {
    font-size: 13px;
    margin-bottom: 20px;
  }
}
</style>
