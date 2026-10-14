<template>
  <UiScenarioScope
    :surface="surface"
    :scene="scene"
    :presentation-mode="presentationMode"
  >
  <div
    :class="rootClass"
    v-bind="$attrs"
    data-ui-dispatch-role="focus-host"
  >
    <div v-if="showHeader" class="admin-page__header">
      <slot name="header">
        <PageHeader
          :title="title"
          :subtitle="subtitle"
          :show-back="showBack"
          :back-text="backText"
          @back="emit('back')"
        >
          <template v-if="$slots.extra" #extra>
            <slot name="extra" />
          </template>
        </PageHeader>
      </slot>
    </div>

    <div v-if="$slots.tabs" class="admin-page__tabs">
      <slot name="tabs" />
    </div>

    <div v-if="$slots.toolbar" class="admin-page__toolbar">
      <SizeScope size="sm">
        <slot name="toolbar" />
      </SizeScope>
    </div>

    <div class="admin-page__body" data-ui-dispatch-role="content-host">
      <slot />
    </div>
  </div>
  </UiScenarioScope>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

defineOptions({ inheritAttrs: false });
import { PageHeader, UiScenarioScope } from '@ocpui/vue';
import type { SurfacePresetId, ScenePresetId, PresentationModeId } from '@ocpui/vue/types';
import SizeScope from './SizeScope.vue';

/**
 * 后台列表/工作台页壳。
 * 分区：header → tabs → toolbar → body；不负责页面 padding（由 AppShell 独占）。
 * toolbar 内控件默认继承 size=sm。
 */

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backText?: string;
  customClass?: string;
  /** L3 surface preset，默认 list */
  surface?: SurfacePresetId;
  /** L4 scene preset，默认 workbench */
  scene?: ScenePresetId;
  /** 列表 scan / 标准 summary / 详情 detail / 分步 progressive */
  presentationMode?: PresentationModeId;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  showBack: false,
  backText: '返回',
  customClass: '',
  surface: 'list',
  scene: 'workbench',
  presentationMode: 'summary',
});

const emit = defineEmits<{
  back: [];
}>();

const slots = useSlots();

const showHeader = computed(() => {
  return Boolean(props.title || props.subtitle || slots.header || slots.extra);
});

const rootClass = computed(() => {
  const classes = ['admin-page'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  box-sizing: border-box;
}

.admin-page__header {
  flex-shrink: 0;
}

.admin-page__header :deep(.page-header) {
  padding: 0;
}

.admin-page__tabs {
  flex-shrink: 0;
}

.admin-page__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.admin-page__toolbar > :deep(*) {
  flex: 1 1 100%;
  min-width: 0;
}

.admin-page__toolbar :deep(button.btn) {
  flex: 0 0 auto;
  width: auto;
  max-width: none;
}

.admin-page__body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
