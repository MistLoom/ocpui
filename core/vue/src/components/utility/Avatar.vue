&lt;!--
Avatar 组件

公开属性：
- src: string - 头像图片地址
- alt: string - 图片替代文本
- name: string - 用户名称（用于生成回退文本和渐变色）
- text: string - 自定义回退文本
- icon: string - 自定义回退图标
- size: AvatarSize - 头像尺寸 ('xs' | 'sm' | 'md' | 'lg' | 'xl' | number)
- shape: AvatarShape - 头像形状 ('circle' | 'square' | 'rounded')
- status: AvatarStatus - 状态指示器 ('online' | 'offline' | 'away' | 'busy')
- statusPosition: string - 状态指示器位置 ('top-right' | 'top-left' | 'bottom-right' | 'bottom-left')
- badge: string | number - 角标内容
- bgColor: string - 回退背景色
- textColor: string - 回退文本/图标颜色
- border: boolean - 是否显示边框
- borderColor: string - 边框颜色
- customClass: string - 自定义类名
- gradientFallback: boolean - 是否使用渐变回退背景

事件处理器：
- error: (event: Event) - 图片加载失败时触发
- load: (event: Event) - 图片加载成功时触发

使用方式：
&lt;template&gt;
  &lt;!-- 基本用法 --&gt;
  &lt;Avatar src="https://example.com/avatar.jpg" alt="User Avatar" /&gt;
  
  &lt;!-- 使用名称生成回退 --&gt;
  &lt;Avatar name="John Doe" /&gt;
  
  &lt;!-- 带状态指示器 --&gt;
  &lt;Avatar src="https://example.com/avatar.jpg" status="online" /&gt;
  
  &lt;!-- 带角标 --&gt;
  &lt;Avatar src="https://example.com/avatar.jpg" badge="3" /&gt;
  
  &lt;!-- 自定义尺寸和形状 --&gt;
  &lt;Avatar src="https://example.com/avatar.jpg" size="lg" shape="square" /&gt;
&lt;/template&gt;
--&gt;

<template>
  <div
    :class="avatarClass"
    :style="avatarStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 内部容器（用于裁剪图片和回退内容） -->
    <div class="avatar-inner">
      <!-- 图片 -->
      <img
        v-if="shouldShowImage"
        :src="src"
        :alt="alt || name || 'Avatar'"
        :class="imageClass"
        @error="handleImageError"
        @load="handleImageLoad"
      />

      <!-- 文字/图标回退 -->
      <div
        v-else
        :class="fallbackClass"
        :style="fallbackStyle"
      >
        <Icon
          v-if="icon"
          :name="icon"
          :size="iconSize"
          color="default"
          :style="{ color: iconColor }"
        />
        <span v-else :class="textClass">{{ displayText }}</span>
      </div>
    </div>

    <!-- 状态指示器 -->
    <span
      v-if="status"
      :class="statusClass"
      :style="statusStyle"
    />

    <!-- 角标 -->
    <span
      v-if="badge || $slots.badge"
      :class="badgeClass"
    >
      <slot name="badge">{{ badge }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Icon from './Icon.vue';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
export type AvatarShape = 'circle' | 'square' | 'rounded';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

interface Props {
  src?: string;
  alt?: string;
  name?: string;
  text?: string;
  icon?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  statusPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  badge?: string | number;
  bgColor?: string;
  textColor?: string;
  border?: boolean;
  borderColor?: string;
  customClass?: string;
  // 渐变回退
  gradientFallback?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  shape: 'circle',
  statusPosition: 'bottom-right',
  border: false,
  gradientFallback: true,
});

const emit = defineEmits<{
  'error': [event: Event];
  'load': [event: Event];
}>();

// 状态
const imageLoaded = ref(false);
const imageError = ref(false);
const isHovered = ref(false);

// 尺寸映射
const sizeMap: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

// 计算实际尺寸
const actualSize = computed(() => {
  if (typeof props.size === 'number') {
    return props.size;
  }
  return sizeMap[props.size] || 40;
});

// 图标尺寸
const iconSize = computed(() => {
  return Math.max(12, Math.floor(actualSize.value * 0.4));
});

// 是否显示图片
const shouldShowImage = computed(() => {
  return props.src && !imageError.value;
});

// 计算显示文本
const displayText = computed(() => {
  if (props.text) return props.text;
  if (props.name) {
    // 提取首字母或前两个字符
    const parts = props.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return props.name.slice(0, 2).toUpperCase();
  }
  return '?';
});

// 生成背景色（基于名称）
const generateBackground = (name: string) => {
  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--success))',
    'hsl(var(--warning))',
    'hsl(var(--error))',
    'hsl(var(--info))',
    'hsl(var(--text-muted))',
  ];

  // 使用名称的哈希值选择颜色
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// 计算回退背景色
const fallbackBackground = computed(() => {
  if (props.bgColor) {
    return props.bgColor;
  }
  if (props.gradientFallback && props.name) {
    return generateBackground(props.name);
  }
  return 'hsl(var(--primary) / 0.15)';
});

// 计算文字/图标颜色
const iconColor = computed((): string => {
  if (props.textColor) return props.textColor;
  return 'hsl(var(--primary))';
});

// 类名计算
const avatarClass = computed(() => {
  const classes = ['avatar', `avatar--${props.shape}`];
  if (props.border) {
    classes.push('avatar--border');
  }
  if (props.status) {
    classes.push(`avatar--status-${props.statusPosition}`);
  }
  if (props.badge) {
    classes.push('avatar--badge');
  }
  if (isHovered.value) {
    classes.push('avatar--hover');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const avatarStyle = computed(() => {
  const size = actualSize.value;
  const style: Record<string, string> = {
    width: `${size}px`,
    height: `${size}px`,
  };

  if (props.border && props.borderColor) {
    style.borderColor = props.borderColor;
  }

  return style;
});

const imageClass = computed(() => {
  return ['avatar-image', { 'avatar-image--loaded': imageLoaded.value }];
});

const fallbackClass = computed(() => {
  return ['avatar-fallback'];
});

const fallbackStyle = computed(() => {
  return {
    background: fallbackBackground.value,
    color: props.textColor || 'hsl(var(--primary))',
  };
});

const textClass = computed(() => {
  return ['avatar-text', `avatar-text--${props.size}`];
});

const statusClass = computed(() => {
  return ['avatar-status', `avatar-status--${props.status}`];
});

const statusStyle = computed(() => {
  const size = actualSize.value;
  const statusSize = Math.max(8, Math.floor(size * 0.25));
  return {
    width: `${statusSize}px`,
    height: `${statusSize}px`,
  };
});

const badgeClass = computed(() => {
  return ['avatar-badge'];
});

// 事件处理
const handleImageError = (event: Event) => {
  imageError.value = true;
  emit('error', event);
};

const handleImageLoad = (event: Event) => {
  imageLoaded.value = true;
  emit('load', event);
};

const handleMouseEnter = () => {
  isHovered.value = true;
};

const handleMouseLeave = () => {
  isHovered.value = false;
};

// 监听 src 变化
watch(() => props.src, () => {
  imageLoaded.value = false;
  imageError.value = false;
});
</script>

<style scoped>
.avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.avatar-inner {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: hsl(var(--surface-container-high));
}

/* 形状 */
.avatar--circle .avatar-inner {
  border-radius: 50%;
}

.avatar--square .avatar-inner {
  border-radius: 4px;
}

.avatar--rounded .avatar-inner {
  border-radius: 12px;
}

/* 边框 */
.avatar--border .avatar-inner {
  border: 2px solid hsl(var(--surface));
  box-shadow: 0 0 0 2px hsl(var(--border));
}

/* 图片 */
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s var(--ease-out);
}

.avatar-image--loaded {
  opacity: 1;
}

/* 回退 */
.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  user-select: none;
}

.avatar-text {
  font-size: 14px;
  line-height: 1;
}

.avatar-text--xs {
  font-size: 10px;
}

.avatar-text--sm {
  font-size: 12px;
}

.avatar-text--md {
  font-size: 14px;
}

.avatar-text--lg {
  font-size: 16px;
}

.avatar-text--xl {
  font-size: 20px;
}

/* 状态指示器 */
.avatar-status {
  position: absolute;
  border-radius: 50%;
  border: 2px solid hsl(var(--surface));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.avatar--status-top-right .avatar-status {
  top: 0;
  right: 0;
  transform: translate(25%, -25%);
}

.avatar--status-top-left .avatar-status {
  top: 0;
  left: 0;
  transform: translate(-25%, -25%);
}

.avatar--status-bottom-right .avatar-status {
  bottom: 0;
  right: 0;
  transform: translate(25%, 25%);
}

.avatar--status-bottom-left .avatar-status {
  bottom: 0;
  left: 0;
  transform: translate(-25%, 25%);
}

.avatar-status--online {
  background: hsl(var(--success));
}

.avatar-status--offline {
  background: hsl(var(--text-muted));
}

.avatar-status--away {
  background: hsl(var(--warning));
}

.avatar-status--busy {
  background: hsl(var(--error));
}

/* 角标 */
.avatar-badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: hsl(var(--error));
  color: hsl(var(--surface));
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(30%, -30%);
  border: 2px solid hsl(var(--surface));
  z-index: 10;
}

/* 组样式（当多个 Avatar 一起使用时） */
.avatar-group {
  display: flex;
  align-items: center;
}

.avatar-group .avatar {
  margin-left: -8px;
}

.avatar-group .avatar:first-child {
  margin-left: 0;
}

.avatar-group .avatar:hover {
  z-index: 1;
}
</style>
