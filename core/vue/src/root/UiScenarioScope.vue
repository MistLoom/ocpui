<template>
  <div
    :data-ui-surface="localSurface"
    :data-ui-scene="localScene"
    :data-ui-presentation-mode="localPresentationMode"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, provide } from 'vue';
import {
  UI_SCENARIO_KEY,
  type SurfacePresetId,
  type ScenePresetId,
  type PresentationModeId,
} from '../types';

interface Props {
  surface?: SurfacePresetId;
  scene?: ScenePresetId;
  /** 信息密度与焦点策略：scan | summary | detail | progressive */
  presentationMode?: PresentationModeId;
}

const props = defineProps<Props>();

const parent = inject(UI_SCENARIO_KEY, null);

const localSurface = computed(
  () => props.surface ?? parent?.surface ?? undefined,
);
const localScene = computed(() => props.scene ?? parent?.scene ?? undefined);
const localPresentationMode = computed(
  () => props.presentationMode ?? parent?.presentationMode ?? undefined,
);

provide(UI_SCENARIO_KEY, {
  get surface() {
    return localSurface.value;
  },
  get scene() {
    return localScene.value;
  },
  get presentationMode() {
    return localPresentationMode.value;
  },
});
</script>
