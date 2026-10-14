&lt;!--
头像组组件

Props:
- avatars: AvatarItem[] - 头像列表
- max?: number - 最大显示数量，默认值：3
- size?: 'xs' | 'sm' | 'md' | 'lg' - 头像大小，默认值：'sm'
- customClass?: string - 自定义类名

Usage:
&lt;AvatarGroup
  :avatars="[
    { src: 'https://example.com/avatar1.jpg', name: '张三' },
    { src: 'https://example.com/avatar2.jpg', name: '李四' },
    { src: 'https://example.com/avatar3.jpg', name: '王五' },
    { src: 'https://example.com/avatar4.jpg', name: '赵六' }
  ]"
  :max="3"
  size="sm"
/&gt;

AvatarItem 接口:
- src?: string - 头像图片地址
- name: string - 头像名称
--&gt;
<template>
  <div v-if="avatars.length > 0" :class="avatarGroupClass">
    <Tooltip
      v-for="(avatar, index) in displayedAvatars"
      :key="index"
      :content="avatar.name"
      placement="top"
    >
      <Avatar
        :src="avatar.src"
        :name="avatar.name"
        :size="size"
        :class="{ 'avatar-group-item': index > 0 }"
      />
    </Tooltip>
    <Tooltip
      v-if="remainingCount > 0"
      :content="remainingTooltip"
      placement="top"
    >
      <div class="avatar-group-more" :style="moreStyle">
        +{{ remainingCount }}
      </div>
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Avatar } from '../utility';
import { Tooltip } from '../feedback';

interface AvatarItem {
  src?: string;
  name: string;
}

interface Props {
  avatars: AvatarItem[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  max: 3,
  size: 'sm',
  customClass: '',
  avatars: () => [],
});

const avatarGroupClass = computed(() => {
  const classes = ['avatar-group'];
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const displayedAvatars = computed(() => {
  return props.avatars.slice(0, props.max);
});

const remainingCount = computed(() => {
  return Math.max(0, props.avatars.length - props.max);
});

const remainingAvatars = computed(() => {
  return props.avatars.slice(props.max);
});

const remainingTooltip = computed(() => {
  return remainingAvatars.value.map(a => a.name).join(', ');
});

const moreStyle = computed(() => {
  const sizeMap = { xs: 24, sm: 32, md: 40, lg: 48 };
  const size = sizeMap[props.size];
  return {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size * 0.35}px`,
  };
});
</script>

<style scoped>
.avatar-group {
  display: flex;
  align-items: center;
}

.avatar-group-item {
  margin-left: -8px;
  border: 2px solid hsl(var(--surface));
}

.avatar-group-more {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -8px;
  border-radius: 50%;
  background: hsl(var(--surface-container-high));
  color: hsl(var(--text-secondary));
  font-weight: 500;
  border: 2px solid hsl(var(--surface));
}
</style>
