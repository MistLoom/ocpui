<template>
  <div
    :class="itemClass"
    data-part="dropdown-item"
    role="menuitem"
    :tabindex="disabled ? -1 : 0"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <span v-if="$slots.icon || icon || iconSvg" class="dropdown-item-icon" data-part="dropdown-item-icon">
      <slot name="icon">
        <Icon v-if="iconSvg" :svg="iconSvg" :size="16" />
        <Icon v-else-if="icon" :name="icon" :size="16" />
      </slot>
    </span>
    <span class="dropdown-item-label" data-part="dropdown-item-label">
      <slot>{{ label }}</slot>
    </span>
    <span v-if="checked !== undefined || $slots.extra" class="dropdown-item-extra">
      <slot name="extra">
        <svg v-if="checked" viewBox="0 0 12 12" fill="currentColor" class="check-icon">
          <path d="M2 6L4.5 8.5L10 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '../utility';
import { useClosePopup } from '../composables/usePopupPanel';

/**
 * 下拉菜单项组件，用于 Dropdown 组件中
 * 
 * @props command - 菜单项的命令值
 * @props label - 菜单项的文本
 * @props icon - 菜单项的图标
 * @props disabled - 是否禁用，默认为 false
 * @props divided - 是否显示分割线，默认为 false
 * @props checked - 是否选中，默认为 undefined
 * @props danger - 是否为危险项，默认为 false
 * 
 * @emits click - 点击菜单项时触发，参数为 command
 * 
 * @usage
 * <DropdownItem label="选项1" command="1" />
 * <DropdownItem label="选项2" command="2" icon="edit" />
 */

interface Props {
  command?: string | number;
  label?: string;
  icon?: string;
  iconSvg?: string;
  disabled?: boolean;
  divided?: boolean;
  checked?: boolean;
  danger?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  disabled: false,
  divided: false,
  checked: undefined,
  danger: false,
});

const emit = defineEmits<{
  click: [command: string | number | undefined];
}>();

const itemClass = computed(() => {
  const classes = ['dropdown-item'];
  if (props.disabled) {
    classes.push('dropdown-item--disabled');
  }
  if (props.divided) {
    classes.push('dropdown-item--divided');
  }
  if (props.danger) {
    classes.push('dropdown-item--danger');
  }
  if (props.checked) {
    classes.push('dropdown-item--checked');
  }
  return classes.join(' ');
});

const close = useClosePopup();

const handleClick = () => {
  if (props.disabled) return;
  emit('click', props.command);
  // 自动关闭面板
  close();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
};
</script>

<style scoped>
.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px;
  margin-bottom: 0;
  font-size: 14px;
  color: hsl(var(--text));
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition-wash);
}

.dropdown-item:hover:not(.dropdown-item--disabled),
.dropdown-item--focused:not(.dropdown-item--disabled) {
  background: hsl(var(--surface-hover));
  transform: translateX(4px);
}

.dropdown-item:focus {
  outline: 1px solid hsl(var(--primary));
  outline-offset: 2px;
  border-radius: 8px;
}

.dropdown-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-item--divided {
  padding-top: calc(var(--space-2) + 1px);
  border-top: 1px solid hsl(var(--border));
}

.dropdown-item--divided:first-child {
  padding-top: 10px;
  border-top: none;
}

.dropdown-item--danger {
  color: hsl(var(--error));
}

.dropdown-item--danger:hover:not(.dropdown-item--disabled),
.dropdown-item--danger.dropdown-item--focused:not(.dropdown-item--disabled) {
  background: hsl(var(--error) / 0.1);
}

.dropdown-item--danger:focus {
  outline: 1px solid hsl(var(--error));
  outline-offset: 2px;
  border-radius: 8px;
}

.dropdown-item--checked {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  font-weight: 500;
}

.dropdown-item--checked:hover:not(.dropdown-item--disabled),
.dropdown-item--checked.dropdown-item--focused:not(.dropdown-item--disabled) {
  background: hsl(var(--primary) / 0.15);
}

.dropdown-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  flex-shrink: 0;
}

.dropdown-item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-item-extra {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 8px;
  flex-shrink: 0;
}

.check-icon {
  width: 12px;
  height: 12px;
}

/* 响应式样式 */
@media (max-width: 639.98px) {
  .dropdown-item {
    padding: 12px 14px;
    min-height: 44px;
    font-size: 14px;
    margin-bottom: 2px;
  }

  .dropdown-item--divided {
    padding-top: calc(var(--space-3) + 1px);
  }

  .dropdown-item-icon {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }

  .dropdown-item-extra {
    width: 18px;
    height: 18px;
    margin-left: 10px;
  }

  .check-icon {
    width: 14px;
    height: 14px;
  }
}
</style>
