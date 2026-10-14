<script setup lang="ts">
import { computed, inject } from 'vue';
import { Icon } from '../utility';

interface Props {
  title?: string;
  name?: string | number;
  modelValue?: boolean;
  disabled?: boolean;
  showArrow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  modelValue: false,
  showArrow: true,
  disabled: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'change': [value: boolean];
}>();

const collapseGroup = inject<{
  activeNames: (string | number)[];
  toggle: (name: string | number) => void;
} | null>('collapseGroup', null);

const isActive = computed(() => {
  if (collapseGroup && props.name !== undefined) {
    return collapseGroup.activeNames.includes(props.name);
  }
  return props.modelValue;
});

const collapseClass = computed(() => {
  const classes = ['collapse'];
  if (isActive.value) {
    classes.push('collapse--active');
  }
  if (props.disabled) {
    classes.push('collapse--disabled');
  }
  return classes.join(' ');
});

const handleToggle = () => {
  if (props.disabled) return;

  if (collapseGroup && props.name !== undefined) {
    collapseGroup.toggle(props.name);
  } else {
    const newValue = !props.modelValue;
    emit('update:modelValue', newValue);
    emit('change', newValue);
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  handleToggle();
};
</script>

<template>
  <div :class="collapseClass">
    <div
      class="collapse-header"
      @click="handleToggle"
      @keydown.enter="handleKeydown"
      @keydown.space="handleKeydown"
      tabindex="0"
      :aria-expanded="isActive"
      :aria-disabled="disabled"
    >
      <Icon
        v-if="showArrow"
        name="chevron-right"
        :size="16"
        class="collapse-arrow"
      />
      <slot name="header">
        <span class="collapse-title">{{ title }}</span>
      </slot>
    </div>
    <Transition name="collapse">
      <div v-show="isActive" class="collapse-content">
        <div class="collapse-content-box">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.collapse {
  border-bottom: 1px solid hsl(var(--border));
}

.collapse:last-child {
  border-bottom: none;
}

.collapse-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
  user-select: none;
}

.collapse-header:hover {
  color: hsl(var(--primary));
}

.collapse--disabled .collapse-header {
  cursor: not-allowed;
  opacity: 0.5;
}

.collapse-arrow {
  transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  color: hsl(var(--text-muted));
}

.collapse--active .collapse-arrow {
  transform: rotate(90deg);
}

.collapse-title {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--text));
}

.collapse-content {
  overflow: hidden;
}

.collapse-content-box {
  padding: 0 0 16px 24px;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  height: 0;
}
</style>
