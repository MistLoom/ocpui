<!--
RefreshButton 组件

功能：统一的刷新按钮，基于 Button variant=text + Icon refresh，
loading 时图标旋转 + 按钮禁用，提供细粒度刷新指示以替代容器级 loading 灰显。

属性：
- loading: boolean - 是否刷新中（图标旋转 + 禁用），默认值：false
- size: 'sm' | 'md' | 'lg' - 按钮尺寸，默认值：md
- label: string - 按钮文案，留空则仅显示图标；传 '' 则纯图标
- disabled: boolean - 是否禁用，默认值：false

事件：
- refresh: () => void - 点击刷新

无障碍：
- aria-busy: loading 状态同步
- aria-label: 始终具备可访问名称（图标模式或文案模式均覆盖）

使用方式：
<RefreshButton :loading="isFetching" @refresh="refetch" />
<RefreshButton :loading="refreshing" @refresh="trigger" label="" />
-->

<template>
  <Button
    variant="text"
    :size="resolvedSize"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <Icon
      name="refresh"
      :size="iconSize"
      :spin="loading"
      :style="iconStyle"
    />
    <span v-if="showLabel">{{ resolvedLabel }}</span>
  </Button>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import Button from './Button.vue';
import Icon from './Icon.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import type { Size } from '@ocpui/vue/types';
import { useComponentSize } from '../composables/useComponentSize';

interface Props {
  loading?: boolean;
  size?: Size;
  label?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  size: undefined,
  label: undefined,
  disabled: false,
});

const emit = defineEmits<{
  refresh: [];
}>();

const resolvedSize = useComponentSize(toRef(props, 'size'));

const { uiT: t } = useUiT();

/**
 * 解析文案：label 显式传值时按传值渲染（含空串 → 纯图标）；
 * 未传值时回退到 i18n common.refresh。
 */
const resolvedLabel = computed(() => {
  if (props.label !== undefined) return props.label;
  return t('common.refresh');
});

const showLabel = computed(() => resolvedLabel.value.length > 0);

const ariaLabel = computed(() => {
  const text = resolvedLabel.value;
  return text.length > 0 ? text : t('common.refresh');
});

const iconSize = computed(() => {
  const map: Record<Size, number> = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
  };
  return map[resolvedSize.value] ?? 20;
});

const iconStyle = computed(() => ({
  marginRight: showLabel.value ? '4px' : '0',
}));

function handleClick(): void {
  if (props.disabled || props.loading) return;
  emit('refresh');
}
</script>
