<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUiT } from '@ocpui/vue/composables/useUiT'
import { shellDispatchAttrs, useOverlayLayer } from '@ocpui/vue/system'
import type { MenuItem } from '@ocpui/vue/navigation/types'

const overlayDispatch = shellDispatchAttrs('overlay-host', 'restore-trigger')

const props = withDefaults(
  defineProps<{
    visible: boolean
    menuItems: MenuItem[]
  }>(),
  {
    visible: false,
    menuItems: () => [],
  },
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const router = useRouter()
const { uiT: t } = useUiT()

const query = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

// 展平所有菜单项
interface FlatItem {
  label: string
  path: string
  group?: string
}

const flatItems = computed<FlatItem[]>(() => {
  const result: FlatItem[] = []
  function walk(items: MenuItem[], group?: string) {
    for (const item of items) {
      if (item.path) {
        result.push({ label: item.label, path: item.path, group })
      }
      if (item.children) {
        walk(item.children, item.label)
      }
    }
  }
  walk(props.menuItems)
  return result
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return flatItems.value
  return flatItems.value.filter(
    (item) => item.label.toLowerCase().includes(q) || item.path.toLowerCase().includes(q),
  )
})

const showPalette = computed(() => props.visible)

/* overlay 统一收口：滚动锁 + W4 降焦 + 背景 inert + 焦点 trap/恢复；
   Esc/方向键由面板 onKeydown 处理，关闭即释放（无离场动画） */
useOverlayLayer(showPalette, {
  container: panelRef,
  initialFocus: inputRef,
  closeOnEscape: false,
  releaseWhenHidden: true,
})

watch(
  () => props.visible,
  async (v) => {
    if (v) {
      query.value = ''
      activeIndex.value = 0
      await nextTick()
      inputRef.value?.focus()
    }
  },
)

function select(index: number) {
  const item = filtered.value[index]
  if (!item) return
  close()
  void router.push(item.path)
}

function navigate(delta: number) {
  const max = filtered.value.length - 1
  if (max < 0) return
  activeIndex.value = Math.max(0, Math.min(max, activeIndex.value + delta))
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    close()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    navigate(1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    navigate(-1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    select(activeIndex.value)
  }
}

function close() {
  emit('update:visible', false)
}

// 全局快捷键 Ctrl+K
function onGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    emit('update:visible', true)
  }
}

onMounted(() => {
  document.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="showPalette" v-bind="overlayDispatch" class="command-palette-overlay" @click="close" />
    <div v-if="showPalette" ref="panelRef" class="command-palette" @keydown="onKeydown">
      <div class="command-palette-search">
        <svg class="command-palette-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref="inputRef"
          v-model="query"
          class="command-palette-input"
          :placeholder="t('navigation.commandPalette.searchPlaceholder')"
        />
        <kbd class="command-palette-kbd">Esc</kbd>
      </div>
      <div class="command-palette-list">
        <div
          v-for="(item, index) in filtered"
          :key="item.path"
          class="command-palette-item"
          :class="{ active: index === activeIndex }"
          @click="select(index)"
          @mouseenter="activeIndex = index"
        >
          <span class="command-palette-item-label">{{ item.label }}</span>
          <span v-if="item.group" class="command-palette-item-group">{{ item.group }}</span>
        </div>
        <div v-if="filtered.length === 0" class="command-palette-empty">
          {{ t('navigation.commandPalette.noData') }}
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.command-palette-overlay {
  position: fixed;
  inset: 0;
  background: hsl(var(--background) / 0.7);
  backdrop-filter: blur(2px);
  z-index: var(--z-overlay);
}

.command-palette {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: min(480px, 90vw);
  max-height: 60vh;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  box-shadow: 0 16px 48px -12px hsl(var(--foreground) / 0.15);
  z-index: var(--z-modal);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.command-palette-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid hsl(var(--border));
}

.command-palette-search-icon {
  flex-shrink: 0;
  color: hsl(var(--muted-foreground));
}

.command-palette-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  background: transparent;
  color: hsl(var(--foreground));
}

.command-palette-input::placeholder {
  color: hsl(var(--muted-foreground));
}

.command-palette-kbd {
  font-size: 0.7rem;
  padding: 0.1em 0.4em;
  border: 1px solid hsl(var(--border));
  border-radius: 0.25rem;
  color: hsl(var(--muted-foreground));
  font-family: inherit;
  flex-shrink: 0;
}

.command-palette-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.4rem;
}

.command-palette-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: 0.35rem;
  cursor: pointer;
  transition: background 0.1s;
}

.command-palette-item.active {
  background: hsl(var(--surface-hover));
}

.command-palette-item-label {
  font-size: 0.85rem;
  color: hsl(var(--foreground));
}

.command-palette-item-group {
  font-size: 0.7rem;
  color: hsl(var(--muted-foreground));
}

.command-palette-empty {
  padding: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: hsl(var(--muted-foreground));
}
</style>