&lt;!--
Empty 组件

公开属性：
- title: string - 空状态标题
- description: string - 空状态描述
- size: string - 空状态尺寸 ('sm' | 'md' | 'lg')
- iconSize: number | string - 图标尺寸
- iconColor: string - 图标颜色
- titleColor: string - 标题颜色
- descriptionColor: string - 描述颜色
- vertical: boolean - 是否垂直居中
- minHeight: number | string - 最小高度
- customClass: string - 自定义类名

使用方式：
&lt;template&gt;
  &lt;!-- 基本用法 --&gt;
  &lt;Empty /&gt;
  
  &lt;!-- 自定义文本 --&gt;
  &lt;Empty
    title="暂无数据"
    description="请添加数据后重试"
  /&gt;
  
  &lt;!-- 不同尺寸 --&gt;
  &lt;Empty size="sm" /&gt;
  &lt;Empty size="lg" /&gt;
  
  &lt;!-- 自定义图标 --&gt;
  &lt;Empty&gt;
    &lt;template #icon&gt;
      &lt;Icon name="search" size="48" /&gt;
    &lt;/template&gt;
  &lt;/Empty&gt;
  
  &lt;!-- 带操作按钮 --&gt;
  &lt;Empty
    title="暂无数据"
    description="请添加数据后重试"
  &gt;
    &lt;template #footer&gt;
      &lt;Button variant="primary"&gt;添加数据&lt;/Button&gt;
    &lt;/template&gt;
  &lt;/Empty&gt;
  
  &lt;!-- 自定义颜色 --&gt;
  &lt;Empty
    iconColor="#ff6b6b"
    titleColor="#333"
    descriptionColor="#666"
  /&gt;
&lt;/template&gt;
--&gt;

<template>
  <div 
    :class="emptyClass"
    :style="emptyStyle"
  >
    <div class="empty__inner">
      <div class="empty-icon" :style="iconStyle">
        <slot name="icon">
          <svg viewBox="0 0 64 64" fill="currentColor" class="empty-default-icon">
            <path d="M32 4C16.5 4 4 16.5 4 32s12.5 28 28 28 28-12.5 28-28S47.5 4 32 4zm0 52c-13.2 0-24-10.8-24-24S18.8 8 32 8s24 10.8 24 24-10.8 24-24 24z"/>
            <path d="M32 20c-2.2 0-4 1.8-4 4v10c0 2.2 1.8 4 4 4s4-1.8 4-4V24c0-2.2-1.8-4-4-4z"/>
            <circle cx="32" cy="46" r="3"/>
          </svg>
        </slot>
      </div>
      <div v-if="title" class="empty-title" :style="titleStyle">{{ title }}</div>
      <div v-if="description" class="empty-description" :style="descriptionStyle">{{ description }}</div>
      <div v-if="$slots.default" class="empty-content">
        <slot />
      </div>
      <div v-if="$slots.footer" class="empty-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  iconSize?: number | string;
  iconColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  vertical?: boolean;
  minHeight?: number | string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '暂无数据',
  description: '',
  size: 'md',
  vertical: false,
  customClass: '',
});

const emptyClass = computed(() => {
  const classes = ['empty', `empty-${props.size}`];
  if (props.vertical) {
    classes.push('empty--vertical');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const emptyStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.minHeight) {
    style.minHeight = typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight;
  }
  
  return style;
});

const iconStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.iconColor) {
    style.color = props.iconColor;
  }
  
  return style;
});

const titleStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.titleColor) {
    style.color = props.titleColor;
  }
  
  return style;
});

const descriptionStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.descriptionColor) {
    style.color = props.descriptionColor;
  }
  
  return style;
});
</script>

<style scoped>
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.empty__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8);
  text-align: center;
}

.empty--vertical {
  min-height: 300px;
  justify-content: center;
}

.empty-icon {
  color: hsl(var(--text-muted));
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-default-icon {
  width: 64px;
  height: 64px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--text));
  margin-bottom: 8px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.empty-description {
  font-size: 14px;
  color: hsl(var(--text-secondary));
  max-width: 300px;
  line-height: 1.5;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.empty-content {
  margin-top: 16px;
}

.empty-footer {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 尺寸变体 */
.empty-sm .empty__inner {
  padding: var(--space-6);
}

.empty-sm .empty-default-icon {
  width: 48px;
  height: 48px;
}

.empty-sm .empty-title {
  font-size: 14px;
}

.empty-sm .empty-description {
  font-size: 13px;
}

.empty-lg .empty__inner {
  padding: var(--space-12);
}

.empty-lg .empty-default-icon {
  width: 80px;
  height: 80px;
}

.empty-lg .empty-title {
  font-size: 18px;
}

.empty-lg .empty-description {
  font-size: 15px;
  max-width: 400px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .empty__inner {
    padding: var(--space-6) var(--space-4);
  }
  
  .empty--vertical {
    min-height: 200px;
  }
  
  .empty-lg .empty__inner {
    padding: var(--space-8) var(--space-4);
  }
  
  .empty-lg .empty-default-icon {
    width: 64px;
    height: 64px;
  }
  
  .empty-lg .empty-title {
    font-size: 16px;
  }
  
  .empty-footer {
    flex-direction: column;
    width: 100%;
  }
  
  .empty-footer :deep(.btn) {
    width: 100%;
  }
}

/* 动画效果 */
@keyframes empty-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty {
  animation: empty-fade-in 0.5s ease-out;
}

.empty-icon {
  animation: empty-fade-in 0.5s ease-out 0.1s both;
}

.empty-title {
  animation: empty-fade-in 0.5s ease-out 0.2s both;
}

.empty-description {
  animation: empty-fade-in 0.5s ease-out 0.3s both;
}

.empty-content {
  animation: empty-fade-in 0.5s ease-out 0.4s both;
}

.empty-footer {
  animation: empty-fade-in 0.5s ease-out 0.5s both;
}
</style>
