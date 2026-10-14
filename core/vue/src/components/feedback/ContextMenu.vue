<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="context-menu-overlay"
      @click="close"
      @contextmenu.prevent="close"
    />
    <div
      v-if="visible"
      ref="menuRef"
      class="context-menu"
      :style="menuStyle"
      role="menu"
      tabindex="-1"
    >
      <template v-for="(item, index) in items" :key="item.key || index">
        <div
          v-if="item.divider"
          class="context-menu-divider"
          role="separator"
        />
        <button
          v-else
          class="context-menu-item"
          :class="{
            'context-menu-item--danger': item.danger,
            'context-menu-item--disabled': item.disabled,
          }"
          :disabled="item.disabled"
          role="menuitem"
          @click="onSelect(item)"
        >
          <Icon v-if="item.icon" :name="item.icon" :size="14" class="context-menu-item-icon" />
          <span class="context-menu-item-label">{{ item.label }}</span>
        </button>
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import Icon from '@ocpui/vue/utility/Icon.vue'
import { useOverlayLayer } from '@ocpui/vue/system'

export interface ContextMenuItem {
  key: string
  label: string
  icon?: string
  disabled?: boolean
  danger?: boolean
  divider?: boolean
}

interface Props {
  visible: boolean
  x: number
  y: number
  items: ContextMenuItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  select: [item: ContextMenuItem]
}>()

const visibleRef = computed(() => props.visible)

const menuRef = ref<HTMLElement | null>(null)

const menuStyle = computed(() => {
  const style: Record<string, string> = {
    left: `${props.x}px`,
    top: `${props.y}px`,
  }
  return style
})

function close() {
  emit('close')
}

function onSelect(item: ContextMenuItem) {
  if (item.disabled) return
  emit('select', item)
  close()
}

// 非模态浮层：入栈统一 Esc（按栈顶派发）；无离场动画，隐藏即出栈
useOverlayLayer(visibleRef, {
  modal: false,
  lockScroll: false,
  deemphasis: false,
  isolate: false,
  releaseWhenHidden: true,
  onRequestClose: close,
})

// 滚动锚点失效，滚动时关闭
function onWindowScroll() {
  close()
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      // 打开后聚焦菜单以支持键盘；Esc 由栈派发
      requestAnimationFrame(() => {
        menuRef.value?.focus()
      })
    }
  },
)

onMounted(() => {
  window.addEventListener('scroll', onWindowScroll, true)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onWindowScroll, true)
})
</script>

<style scoped>
.context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-dropdown);
}

.context-menu {
  position: fixed;
  z-index: var(--z-popover);
  min-width: 160px;
  padding: 4px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  box-shadow: 0 4px 24px hsl(0 0% 0% / 0.12);
  outline: none;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 13px;
  color: hsl(var(--text));
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.context-menu-item:hover:not(:disabled) {
  background: hsl(var(--surface-hover));
}

.context-menu-item--danger {
  color: hsl(var(--danger));
}

.context-menu-item--danger:hover:not(:disabled) {
  background: hsl(var(--danger) / 0.08);
}

.context-menu-item--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.context-menu-item-icon {
  flex-shrink: 0;
  color: hsl(var(--text-muted));
}

.context-menu-item--danger .context-menu-item-icon {
  color: hsl(var(--danger));
}

.context-menu-divider {
  height: 1px;
  margin: 4px 8px;
  background: hsl(var(--border));
}
</style>