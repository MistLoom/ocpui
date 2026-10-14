import { ref, computed, type MaybeRef, type ComputedRef } from 'vue';

export interface UseHoverActiveOptions {
  disabled?: MaybeRef<boolean>;
}

export interface UseHoverActiveReturn {
  isHovered: ComputedRef<boolean>;
  isActive: ComputedRef<boolean>;
  hoverClass: ComputedRef<string>;
  activeClass: ComputedRef<string>;
  interactionClass: ComputedRef<string>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
}

export function useHoverActive(options: UseHoverActiveOptions = {}): UseHoverActiveReturn {
  const { disabled = false } = options;

  const isHovered = ref(false);
  const isActive = ref(false);
  const isDisabled = computed(() => {
    return typeof disabled === 'boolean' ? disabled : disabled.value;
  });

  const hoverClass = computed(() => {
    if (isDisabled.value) return '';
    return isHovered.value ? 'hover' : '';
  });

  const activeClass = computed(() => {
    if (isDisabled.value) return '';
    return isActive.value ? 'active' : '';
  });

  const interactionClass = computed(() => {
    const classes: string[] = [];
    if (!isDisabled.value) {
      if (isHovered.value) classes.push('hover');
      if (isActive.value) classes.push('active');
    }
    return classes.join(' ');
  });

  const onMouseEnter = () => {
    if (!isDisabled.value) {
      isHovered.value = true;
    }
  };

  const onMouseLeave = () => {
    isHovered.value = false;
    isActive.value = false;
  };

  const onMouseDown = () => {
    if (!isDisabled.value && isHovered.value) {
      isActive.value = true;
    }
  };

  const onMouseUp = () => {
    isActive.value = false;
  };

  return {
    isHovered: computed(() => isHovered.value),
    isActive: computed(() => isActive.value),
    hoverClass,
    activeClass,
    interactionClass,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
  };
}
