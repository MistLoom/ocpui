<!--
ThemePreviewCard 主题预览卡片

功能：展示单个主题风格的名称、描述与气质预览色板，支持选中态。

属性：
- theme: ThemeInfo - 主题信息
- selected: boolean - 是否选中
- disabled?: boolean - 是否禁用

事件：
- select: 点击选择时触发

使用方式：
  <ThemePreviewCard
    :theme="themeInfo"
    :selected="currentTheme === themeInfo.id"
    @select="handleSelect(themeInfo.id)"
  />
-->

<template>
  <div
    :class="cardClasses"
    role="radio"
    :aria-checked="selected"
    :aria-disabled="disabled"
    tabindex="0"
    @click="handleClick"
    @keydown.enter.space.prevent="handleClick"
  >
    <div class="theme-preview-card__header">
      <div v-if="theme.icon" class="theme-preview-card__icon">
        <Icon :svg="theme.icon" :size="20" />
      </div>
      <div class="theme-preview-card__meta">
        <Typography size="sm" weight="semibold" class="theme-preview-card__name">
          {{ displayName }}
        </Typography>
        <Typography v-if="displayDescription" size="xs" color="muted" class="theme-preview-card__desc">
          {{ displayDescription }}
        </Typography>
      </div>
    </div>

    <div v-if="theme.preview" class="theme-preview-card__palette" aria-hidden="true">
      <div
        class="theme-preview-card__swatch theme-preview-card__swatch--bg"
        :style="{ background: theme.preview.background }"
      />
      <div
        class="theme-preview-card__swatch theme-preview-card__swatch--surface"
        :style="{ background: theme.preview.surface }"
      />
      <div
        class="theme-preview-card__swatch theme-preview-card__swatch--primary"
        :style="{ background: theme.preview.primary }"
      />
      <div
        class="theme-preview-card__swatch theme-preview-card__swatch--text"
        :style="{ background: theme.preview.text }"
      />
    </div>

    <div v-if="selected" class="theme-preview-card__check" aria-hidden="true">
      <Icon name="check" :size="14" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Icon from './Icon.vue';
import Typography from './Typography.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import type { ThemeInfo } from '@ocpui/vue/themes';

interface Props {
  theme: ThemeInfo;
  selected?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  disabled: false,
});

const emit = defineEmits<{
  select: [];
}>();

const { uiT: t, te } = useUiT();

const displayName = computed(() => {
  if (props.theme.nameKey && te(props.theme.nameKey)) {
    return t(props.theme.nameKey);
  }
  return props.theme.name;
});

const displayDescription = computed(() => {
  if (props.theme.descriptionKey && te(props.theme.descriptionKey)) {
    return t(props.theme.descriptionKey);
  }
  return props.theme.description;
});

const cardClasses = computed(() => {
  const classes = ['theme-preview-card'];
  if (props.selected) classes.push('theme-preview-card--selected');
  if (props.disabled) classes.push('theme-preview-card--disabled');
  return classes;
});

const handleClick = () => {
  if (props.disabled) return;
  emit('select');
};
</script>

<style scoped>
.theme-preview-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: hsl(var(--surface-container-high));
  border: 2px solid hsl(var(--border));
  border-radius: var(--radius-lg, 16px);
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.theme-preview-card:hover:not(.theme-preview-card--disabled) {
  border-color: hsl(var(--border-hover));
  background: hsl(var(--surface-hover));
}

.theme-preview-card--selected {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.05);
}

.theme-preview-card--selected:hover:not(.theme-preview-card--disabled) {
  background: hsl(var(--primary) / 0.08);
}

.theme-preview-card--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.theme-preview-card:focus-visible {
  
  outline-offset: 2px;
}

.theme-preview-card__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.theme-preview-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md, 12px);
  background: hsl(var(--surface));
  color: hsl(var(--text-secondary));
  flex-shrink: 0;
}

.theme-preview-card--selected .theme-preview-card__icon {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
}

.theme-preview-card__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.theme-preview-card__name {
  color: hsl(var(--text));
}

.theme-preview-card--selected .theme-preview-card__name {
  color: hsl(var(--primary));
}

.theme-preview-card__desc {
  line-height: 1.5;
}

.theme-preview-card__palette {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.theme-preview-card__swatch {
  height: 32px;
  border-radius: var(--radius-md, 12px);
  border: 1px solid hsl(var(--border));
}

.theme-preview-card__check {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

@media (prefers-reduced-motion: reduce) {
  .theme-preview-card {
    transition: none;
  }
}
</style>
