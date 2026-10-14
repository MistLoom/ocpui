<template>
  <div :class="timelineClass" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue';

type TimelineMode = 'left' | 'right' | 'alternate';

interface Props {
  mode?: TimelineMode;
  pending?: boolean;
  reverse?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'left',
  pending: false,
  reverse: false,
  customClass: '',
});

// Provide timeline context to TimelineItem
const itemIndex = ref(0);

provide('timelineContext', {
  mode: computed(() => props.mode),
});

provide('timelineItemIndex', itemIndex);

watch(
  () => props.mode,
  () => {
    itemIndex.value = 0;
  },
);

const timelineClass = computed(() => {
  const classes = ['timeline'];
  if (props.mode !== 'left') {
    classes.push(`timeline--${props.mode}`);
  }
  if (props.pending) {
    classes.push('timeline--pending');
  }
  if (props.reverse) {
    classes.push('timeline--reverse');
  }
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});
</script>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.timeline--reverse {
  flex-direction: column-reverse;
}
</style>
