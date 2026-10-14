<template>
  <div :class="dynamicTagsClass">
    <template v-if="variant === 'inline'">
      <div
        class="dynamic-tags-inline"
        :class="{ 'dynamic-tags-inline--disabled': disabled }"
        @click="focusAppendInput"
      >
        <TransitionGroup name="dynamic-tags" tag="div" class="dynamic-tags-inline__inner">
          <span
            v-for="(tag, index) in modelValue"
            :key="`${tag}-${index}`"
            class="dynamic-tags-item"
            :class="{ 'dynamic-tags-item--disabled': disabled }"
            @click.stop
          >
            <input
              v-if="editingIndex === index"
              ref="editInputRef"
              v-model="editValue"
              type="text"
              class="dynamic-tags-edit-input"
              :disabled="disabled"
              @keydown.enter.prevent="commitEdit(index)"
              @keydown.esc.prevent="cancelEdit"
              @blur="commitEdit(index)"
            />
            <span
              v-else
              class="dynamic-tags-text dynamic-tags-text--editable"
              tabindex="0"
              role="button"
              @click="startEdit(index)"
              @keydown.enter.prevent="startEdit(index)"
            >
              {{ tag }}
            </span>
            <button
              v-if="!disabled"
              type="button"
              class="dynamic-tags-close"
              @click="handleRemoveAt(index)"
              :aria-label="t('components.dataEntry.dynamicTags.delete', { tag })"
            >
              <svg viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </span>
          <input
            v-if="!disabled && (max === 0 || modelValue.length < max)"
            ref="inputRef"
            key="append-input"
            v-model="inputValue"
            type="text"
            class="dynamic-tags-input dynamic-tags-input--inline"
            :placeholder="modelValue.length ? '' : placeholder"
            :disabled="disabled"
            @keydown="handleKeydown"
            @blur="handleBlur"
            @paste="handlePaste"
            @click.stop
          />
        </TransitionGroup>
      </div>
      <div v-if="!disabled && max > 0 && modelValue.length >= max" class="dynamic-tags-limit">
        <slot name="limit">
          {{ t('components.dataEntry.dynamicTags.maxTagsReached', { max }) }}
        </slot>
      </div>
    </template>

    <template v-else>
      <div v-if="modelValue.length === 0" class="dynamic-tags-empty">
        <slot name="empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <p>{{ t('components.dataEntry.dynamicTags.empty') }}</p>
          <p class="dynamic-tags-empty-hint">{{ t('components.dataEntry.dynamicTags.emptyHint') }}</p>
        </slot>
      </div>
      <div v-else class="dynamic-tags-list">
        <TransitionGroup name="dynamic-tags">
          <span
            v-for="(tag, index) in modelValue"
            :key="`${tag}-${index}`"
            class="dynamic-tags-item"
            :class="{ 'dynamic-tags-item--disabled': disabled }"
          >
            <span class="dynamic-tags-text">{{ tag }}</span>
            <button
              v-if="!disabled"
              type="button"
              class="dynamic-tags-close"
              @click="handleRemoveAt(index)"
              :aria-label="t('components.dataEntry.dynamicTags.delete', { tag })"
            >
              <svg viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </span>
        </TransitionGroup>
      </div>
      <div v-if="!disabled && (max === 0 || modelValue.length < max)" class="dynamic-tags-input-wrapper">
        <input
          ref="inputRef"
          v-model="inputValue"
          type="text"
          class="dynamic-tags-input"
          :placeholder="placeholder"
          :disabled="disabled"
          @keydown="handleKeydown"
          @blur="handleBlur"
          @paste="handlePaste"
        />
      </div>
      <div v-if="!disabled && max > 0 && modelValue.length >= max" class="dynamic-tags-limit">
        <slot name="limit">
          {{ t('components.dataEntry.dynamicTags.maxTagsReached', { max }) }}
        </slot>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface Props {
  modelValue: string[];
  placeholder?: string;
  disabled?: boolean;
  max?: number;
  inputStyle?: 'input' | 'button';
  createButtonLabel?: string;
  customClass?: string;
  /** inline：标签与追加输入同一行容器，支持点击标签编辑 */
  variant?: 'default' | 'inline';
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '添加标签',
  disabled: false,
  max: 0,
  inputStyle: 'input',
  createButtonLabel: '添加',
  customClass: '',
  variant: 'default',
});

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
  add: [value: string];
  remove: [value: string];
  change: [value: string[]];
}>();

const inputRef = ref<HTMLInputElement>();
const editInputRef = ref<HTMLInputElement>();
const inputValue = ref('');
const editingIndex = ref(-1);
const editValue = ref('');

const dynamicTagsClass = computed(() => {
  const classes = ['dynamic-tags'];
  if (props.disabled) classes.push('dynamic-tags--disabled');
  if (props.variant === 'inline') classes.push('dynamic-tags--inline-variant');
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

function emitValue(newValue: string[]) {
  emit('update:modelValue', newValue);
  emit('change', newValue);
}

function handleAdd() {
  const raw = inputValue.value.trim();
  if (!raw) return;
  const parts = splitTokens(raw);
  if (parts.length === 0) return;

  let next = [...props.modelValue];
  for (const value of parts) {
    if (props.max > 0 && next.length >= props.max) break;
    if (next.includes(value)) continue;
    next.push(value);
    emit('add', value);
  }
  emitValue(next);
  inputValue.value = '';
}

function handleRemoveAt(index: number) {
  const tag = props.modelValue[index];
  if (tag === undefined) return;
  const newValue = props.modelValue.filter((_, i) => i !== index);
  emitValue(newValue);
  emit('remove', tag);
  if (editingIndex.value === index) {
    editingIndex.value = -1;
    editValue.value = '';
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    handleAdd();
  } else if (event.key === 'Backspace' && !inputValue.value && props.modelValue.length > 0) {
    handleRemoveAt(props.modelValue.length - 1);
  }
}

function handleBlur() {
  if (inputValue.value.trim()) {
    handleAdd();
  }
}

function handlePaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData('text') ?? '';
  if (!/[\n,，]/.test(text)) return;
  event.preventDefault();
  const parts = splitTokens(text);
  if (parts.length === 0) return;
  let next = [...props.modelValue];
  for (const value of parts) {
    if (props.max > 0 && next.length >= props.max) break;
    if (next.includes(value)) continue;
    next.push(value);
    emit('add', value);
  }
  emitValue(next);
  inputValue.value = '';
}

function splitTokens(raw: string): string[] {
  return raw
    .split(/[\n,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function startEdit(index: number) {
  if (props.disabled) return;
  editingIndex.value = index;
  editValue.value = props.modelValue[index] ?? '';
  void nextTick(() => editInputRef.value?.focus());
}

function cancelEdit() {
  editingIndex.value = -1;
  editValue.value = '';
}

function commitEdit(index: number) {
  if (editingIndex.value !== index) return;
  const trimmed = editValue.value.trim();
  if (!trimmed) {
    handleRemoveAt(index);
    cancelEdit();
    return;
  }
  const next = [...props.modelValue];
  const dup = next.findIndex((t, i) => i !== index && t === trimmed);
  if (dup >= 0) {
    handleRemoveAt(index);
    cancelEdit();
    return;
  }
  next[index] = trimmed;
  emitValue(next);
  cancelEdit();
}

function focusAppendInput() {
  if (props.disabled) return;
  inputRef.value?.focus();
}

const focus = () => {
  inputRef.value?.focus();
};

defineExpose({
  focus,
});
</script>

<style scoped>
.dynamic-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.dynamic-tags--inline-variant {
  display: block;
  width: 100%;
}

.dynamic-tags-inline {
  width: 100%;
  min-height: 2.25rem;
  padding: 0.25rem 0.5rem;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  cursor: text;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.dynamic-tags-inline:focus-within {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.1);
}

.dynamic-tags-inline--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dynamic-tags-inline__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.dynamic-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dynamic-tags-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: hsl(var(--primary) / 0.1);
  border: 1px solid hsl(var(--primary) / 0.2);
  border-radius: 6px;
  font-size: 13px;
  color: hsl(var(--primary));
  transition: color 0.2s, background-color 0.2s, border-color 0.2s, opacity 0.2s;
}

.dynamic-tags-item:hover:not(.dynamic-tags-item--disabled) {
  background: hsl(var(--primary) / 0.15);
  border-color: hsl(var(--primary) / 0.3);
}

.dynamic-tags-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dynamic-tags-text {
  line-height: 1.4;
}

.dynamic-tags-text--editable {
  cursor: text;
}

.dynamic-tags-edit-input {
  min-width: 4rem;
  max-width: 12rem;
  padding: 0 2px;
  font-size: 13px;
  color: hsl(var(--primary));
  background: transparent;
  border: none;
  outline: none;
}

.dynamic-tags-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  color: hsl(var(--primary) / 0.7);
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.dynamic-tags-close:hover {
  background: hsl(var(--primary) / 0.2);
  color: hsl(var(--primary));
}

.dynamic-tags-close svg {
  width: 8px;
  height: 8px;
}

.dynamic-tags-input-wrapper {
  display: inline-flex;
  align-items: center;
}

.dynamic-tags-input {
  width: 100px;
  padding: 4px 10px;
  background: hsl(var(--surface-inset));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  font-size: 13px;
  color: hsl(var(--text));
  outline: none;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.dynamic-tags-input--inline {
  flex: 1;
  min-width: 5rem;
  width: auto;
  padding: 4px 6px;
  background: transparent;
  border: none;
  box-shadow: none;
}

.dynamic-tags-input--inline:focus {
  box-shadow: none;
}

.dynamic-tags-input::placeholder {
  color: hsl(var(--text-muted));
}

.dynamic-tags-input:hover {
  border-color: hsl(var(--border-hover));
}

.dynamic-tags-input:focus {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.1);
}

.dynamic-tags--disabled {
  pointer-events: none;
  opacity: 0.6;
}

.dynamic-tags-enter-active,
.dynamic-tags-leave-active {
  transition: opacity 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.dynamic-tags-enter-from,
.dynamic-tags-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.dynamic-tags-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  text-align: center;
  background: hsl(var(--surface-container-high));
  border: 2px dashed hsl(var(--border));
  border-radius: 8px;
  margin-bottom: 8px;
  width: 100%;
}

.dynamic-tags-empty svg {
  width: 32px;
  height: 32px;
  color: hsl(var(--text-muted));
  margin-bottom: 12px;
}

.dynamic-tags-empty p {
  margin: 0 0 6px 0;
  color: hsl(var(--text));
  font-size: 14px;
  font-weight: 500;
}

.dynamic-tags-empty-hint {
  color: hsl(var(--text-muted)) !important;
  font-size: 13px !important;
  font-weight: 400 !important;
}

.dynamic-tags-limit {
  font-size: 12px;
  color: hsl(var(--text-muted));
  margin-left: 8px;
  align-self: center;
}

@media (max-width: 575.98px) {
  .dynamic-tags {
    gap: 6px;
  }

  .dynamic-tags-list {
    gap: 6px;
  }

  .dynamic-tags-item {
    padding: 3px 8px;
    font-size: 12px;
  }

  .dynamic-tags-input {
    width: 80px;
    padding: 3px 8px;
    font-size: 12px;
  }

  .dynamic-tags-empty {
    padding: 24px 16px;
  }

  .dynamic-tags-empty svg {
    width: 24px;
    height: 24px;
  }
}
</style>
