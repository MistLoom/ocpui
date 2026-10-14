<template>
  <div :class="itemClass" v-bind="$attrs">
    <div class="timeline-item-tail" />
    <div :class="dotClass">
      <slot name="dot">
        <span v-if="icon" class="timeline-item-icon">{{ icon }}</span>
        <div v-else class="timeline-item-dot-default" />
      </slot>
    </div>
    <div class="timeline-item-content">
      <div v-if="label || $slots.label" class="timeline-item-label">
        <slot name="label">{{ label }}</slot>
      </div>
      <div v-if="title || $slots.title" class="timeline-item-title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="description || $slots.description" class="timeline-item-description">
        <slot name="description">{{ description }}</slot>
      </div>
      <div v-if="time || $slots.time" class="timeline-item-time">
        <slot name="time">{{ time }}</slot>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeMount, ref, unref, type ComputedRef, type Ref } from 'vue';

type TimelineItemPosition = 'left' | 'right';
type TimelineItemColor = 'blue' | 'green' | 'red' | 'yellow' | 'gray' | string;
type TimelineItemStatus = 'pending' | 'completed' | 'active';

interface TimelineContext {
  mode: 'left' | 'right' | 'alternate' | ComputedRef<'left' | 'right' | 'alternate'>;
}

interface Props {
  title?: string;
  description?: string;
  time?: string;
  label?: string;
  icon?: string;
  color?: TimelineItemColor;
  position?: TimelineItemPosition;
  status?: TimelineItemStatus;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  time: '',
  label: '',
  icon: '',
  color: '',
  position: undefined,
  status: 'pending',
  customClass: '',
});

const timelineContext = inject<TimelineContext>('timelineContext', { mode: 'left' });
const itemIndex = inject<Ref<number>>('timelineItemIndex', ref(-1));
const assignedIndex = ref(-1);

onBeforeMount(() => {
  if (itemIndex.value >= 0) {
    assignedIndex.value = itemIndex.value;
    itemIndex.value += 1;
  }
});

const timelineMode = computed(() => unref(timelineContext.mode));

const resolvedPosition = computed((): TimelineItemPosition | undefined => {
  if (props.position) return props.position;
  if (timelineMode.value !== 'alternate') return undefined;
  if (assignedIndex.value < 0) return 'left';
  return assignedIndex.value % 2 === 0 ? 'left' : 'right';
});

const itemClass = computed(() => {
  const classes = ['timeline-item'];
  const mode = timelineMode.value;

  if (mode === 'alternate') {
    const pos = resolvedPosition.value || 'left';
    classes.push(`timeline-item--${pos}`);
  } else {
    classes.push(`timeline-item--${mode}`);
  }

  if (props.status) {
    classes.push(`timeline-item--status-${props.status}`);
  }

  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes;
});

const dotClass = computed(() => {
  const classes = ['timeline-item-dot'];
  if (props.color) {
    if (['blue', 'green', 'red', 'yellow', 'gray'].includes(props.color)) {
      classes.push(`timeline-item-dot--${props.color}`);
    } else {
      classes.push('timeline-item-dot--custom');
    }
  }
  if (props.icon) {
    classes.push('timeline-item-dot--with-icon');
  }
  return classes;
});
</script>

<style scoped>
.timeline-item {
  display: flex;
  position: relative;
  padding: 0 0 24px 48px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item:last-child .timeline-item-tail {
  display: none;
}

.timeline-item--left {
  padding-left: 48px;
  padding-right: 0;
}

.timeline-item--right {
  padding-left: 0;
  padding-right: 48px;
  flex-direction: row-reverse;
}

.timeline-item--right .timeline-item-content {
  text-align: right;
}

.timeline-item--alternate {
  width: 50%;
}

.timeline-item--alternate.timeline-item--left {
  padding-right: 24px;
  margin-left: 0;
}

.timeline-item--alternate.timeline-item--right {
  padding-left: 24px;
  margin-left: 50%;
}

.timeline-item-tail {
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: hsl(var(--border));
  transform: translateX(-50%);
  pointer-events: none;
}

.timeline-item--right .timeline-item-tail {
  left: auto;
  right: 20px;
}

.timeline-item--alternate.timeline-item--left .timeline-item-tail {
  left: auto;
  right: 0;
}

.timeline-item--alternate.timeline-item--right .timeline-item-tail {
  left: 0;
  right: auto;
}

.timeline-item-dot {
  position: absolute;
  left: 20px;
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: hsl(var(--surface-container-high));
  border: 2px solid hsl(var(--primary));
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%);
}

.timeline-item-dot-default {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: hsl(var(--primary));
}

.timeline-item--right .timeline-item-dot {
  left: auto;
  right: 20px;
  transform: translateX(50%);
}

.timeline-item--alternate.timeline-item--left .timeline-item-dot {
  left: auto;
  right: 0;
  transform: translateX(50%);
}

.timeline-item--alternate.timeline-item--right .timeline-item-dot {
  left: 0;
  right: auto;
  transform: translateX(-50%);
}

.timeline-item-dot--blue {
  border-color: hsl(217 91% 60%);
  background: hsl(217 91% 60% / 0.1);
}

.timeline-item-dot--blue .timeline-item-dot-default {
  background: hsl(217 91% 60%);
}

.timeline-item-dot--green {
  border-color: hsl(142 76% 36%);
  background: hsl(142 76% 36% / 0.1);
}

.timeline-item-dot--green .timeline-item-dot-default {
  background: hsl(142 76% 36%);
}

.timeline-item-dot--red {
  border-color: hsl(0 84% 60%);
  background: hsl(0 84% 60% / 0.1);
}

.timeline-item-dot--red .timeline-item-dot-default {
  background: hsl(0 84% 60%);
}

.timeline-item-dot--yellow {
  border-color: hsl(45 93% 47%);
  background: hsl(45 93% 47% / 0.1);
}

.timeline-item-dot--yellow .timeline-item-dot-default {
  background: hsl(45 93% 47%);
}

.timeline-item-dot--gray {
  border-color: hsl(var(--text-muted));
  background: hsl(var(--text-muted) / 0.1);
}

.timeline-item-dot--gray .timeline-item-dot-default {
  background: hsl(var(--text-muted));
}

.timeline-item-dot--with-icon {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

.timeline-item-icon {
  font-size: 10px;
  color: hsl(var(--primary));
}

.timeline-item-content {
  flex: 1;
  min-width: 0;
}

.timeline-item-label {
  margin-bottom: 4px;
  font-size: 12px;
  color: hsl(var(--text-muted));
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timeline-item-title {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--text));
  margin-bottom: 4px;
  line-height: 1.4;
}

.timeline-item-description {
  font-size: 13px;
  color: hsl(var(--text-secondary));
  line-height: 1.5;
  margin-bottom: 4px;
}

.timeline-item-time {
  font-size: 12px;
  color: hsl(var(--text-muted));
}

/* 状态样式 */
.timeline-item--status-completed .timeline-item-dot {
  border-color: hsl(142 76% 36%);
  background: hsl(142 76% 36%);
}

.timeline-item--status-completed .timeline-item-dot-default {
  background: hsl(var(--surface));
}

.timeline-item--status-completed .timeline-item-title {
  color: hsl(142 76% 36%);
}

.timeline-item--status-active .timeline-item-dot {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary));
  box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2);
}

.timeline-item--status-active .timeline-item-title {
  color: hsl(var(--primary));
  font-weight: 700;
}

.timeline-item--status-pending .timeline-item-dot {
  border-color: hsl(var(--border));
  background: hsl(var(--surface-container-high));
}

.timeline-item--status-pending .timeline-item-dot-default {
  background: hsl(var(--text-muted));
}

/* Responsive styles */
@media (max-width: 575.98px) {
  .timeline-item,
  .timeline-item--left,
  .timeline-item--right,
  .timeline-item--alternate,
  .timeline-item--alternate.timeline-item--left,
  .timeline-item--alternate.timeline-item--right {
    padding-left: 40px;
    padding-right: 0;
    margin-left: 0;
    width: 100%;
    flex-direction: row;
  }
  
  .timeline-item--right .timeline-item-content {
    text-align: left;
  }
  
  .timeline-item-tail,
  .timeline-item--right .timeline-item-tail,
  .timeline-item--alternate.timeline-item--left .timeline-item-tail,
  .timeline-item--alternate.timeline-item--right .timeline-item-tail {
    left: 16px;
    right: auto;
    transform: translateX(-50%);
  }
  
  .timeline-item-dot,
  .timeline-item--right .timeline-item-dot,
  .timeline-item--alternate.timeline-item--left .timeline-item-dot,
  .timeline-item--alternate.timeline-item--right .timeline-item-dot {
    left: 16px;
    right: auto;
    transform: translateX(-50%);
  }
  
  .timeline-item-title {
    font-size: var(--font-size-sm);
  }
  
  .timeline-item-description {
    font-size: var(--font-size-sm);
  }
}
</style>
