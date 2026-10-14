<template>
  <Teleport to="body">
    <Transition :name="transitionName">
      <div
        v-if="visible && anchor"
        ref="floatingRef"
        class="ocpui-floating-hint"
        :class="[variantClass, customClass]"
        role="tooltip"
        :style="{ visibility: positioned ? 'visible' : 'hidden' }"
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue';
import {
  useFloatingPosition,
  type FloatingPlacement,
  type VirtualAnchor,
} from '../composables/useFloatingPosition';

/**
 * 虚拟锚点浮层提示：图表 crosshair、gauge hover 等。
 * 规范：@ocpui/docs/spec/foundation/layer-stack.md — 禁止在 overflow 容器内 absolute 定位 tooltip。
 */
interface Props {
  visible: boolean;
  anchor: VirtualAnchor | null;
  placement?: FloatingPlacement;
  offset?: number;
  variant?: 'compact' | 'panel';
  customClass?: string;
  transitionName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  offset: 8,
  variant: 'compact',
  customClass: '',
  transitionName: 'ocpui-floating-hint',
});

const floatingRef = ref<HTMLElement>();
const positioned = ref(false);
const anchorRef = toRef(props, 'anchor');
const visibleRef = toRef(props, 'visible');

const variantClass = computed(() =>
  props.variant === 'panel' ? 'ocpui-floating-hint--panel' : 'ocpui-floating-hint--compact',
);

useFloatingPosition({
  reference: anchorRef,
  floating: floatingRef,
  visible: visibleRef,
  placement: toRef(props, 'placement'),
  offsetPx: toRef(props, 'offset'),
  onUpdate: () => {
    positioned.value = true;
  },
});

watch(visibleRef, (val) => {
  if (!val) positioned.value = false;
});
</script>

<script lang="ts">
export default { name: 'FloatingHint' };
</script>

<style scoped>
.ocpui-floating-hint-enter-active,
.ocpui-floating-hint-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.ocpui-floating-hint-enter-from,
.ocpui-floating-hint-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
