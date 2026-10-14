<!--
Image 图片组件

## 组件说明
图片组件，支持懒加载、预览、错误处理等功能

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| src | string | - | 图片地址 |
| alt | string | '' | 图片替代文本 |
| width | string \| number | '' | 图片宽度 |
| height | string \| number | '' | 图片高度 |
| fit | 'fill' \| 'contain' \| 'cover' \| 'none' \| 'scale-down' | 'cover' | 图片适应方式 |
| preview | boolean | false | 是否支持预览 |
| previewSrc | string | '' | 预览图片地址 |
| lazy | boolean | true | 是否懒加载 |
| errorText | string | '加载失败' | 错误提示文本 |
| customClass | string | '' | 自定义类名 |

## 事件
| 事件名 | 参数 | 说明 |
|-------|------|------|
| load | event: Event | 图片加载成功事件 |
| error | event: Event | 图片加载失败事件 |

## 使用示例
```vue
<template>
  <div>
    <Image
      src="https://example.com/image.jpg"
      alt="示例图片"
      :width="200"
      :height="200"
      :preview="true"
    />
  </div>
</template>

<script setup lang="ts">
import Image from './Image.vue';
</script>
```
-->
<template>
  <div :class="imageClass">
    <div
      class="image-wrapper"
      :style="wrapperStyle"
      :role="preview ? 'button' : undefined"
      :tabindex="preview ? 0 : undefined"
      :aria-label="preview ? t('components.dataDisplay.image.previewImage') : undefined"
      @click="handlePreview"
      @keydown.enter.prevent="handlePreview"
      @keydown.space.prevent="handlePreview"
    >
      <img
        ref="imgRef"
        :src="currentSrc"
        :alt="alt"
        :class="imgClass"
        :style="imgStyle"
        @load="handleLoad"
        @error="handleError"
        loading="lazy"
      />
      <div v-if="loading && !loaded" class="image-placeholder">
        <span class="image-loading-spinner" />
      </div>
      <div v-if="hasError" class="image-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>{{ displayErrorText }}</span>
      </div>
      <div v-if="preview && loaded" class="image-mask">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
    </div>
    
    <Teleport to="body">
      <Transition name="image-preview" @after-leave="afterLeave">
        <div
          v-if="previewVisible"
          ref="previewRef"
          class="image-preview-overlay"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          v-bind="overlayDispatch"
          @click="handleClosePreview"
        >
          <div class="image-preview-container">
            <button type="button" class="image-preview-close" @click="handleClosePreview" :aria-label="t('components.dataDisplay.image.close')">
              <svg viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            <img
              :src="previewSrc"
              :alt="alt"
              class="image-preview-img"
              :style="previewImgStyle"
            />
            <div class="image-preview-actions">
              <button type="button" class="image-preview-action" @click.stop="handleZoomIn" :aria-label="t('components.dataDisplay.image.zoomIn')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </button>
              <button type="button" class="image-preview-action" @click.stop="handleZoomOut" :aria-label="t('components.dataDisplay.image.zoomOut')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </button>
              <button type="button" class="image-preview-action" @click.stop="handleRotate" :aria-label="t('components.dataDisplay.image.rotate')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
              </button>
              <button type="button" class="image-preview-action" @click.stop="handleReset" :aria-label="t('components.dataDisplay.image.reset')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { shellDispatchAttrs, useOverlayLayer } from '@ocpui/vue/system';

const { uiT: t } = useUiT();
const overlayDispatch = shellDispatchAttrs('overlay-host', 'restore-trigger');

type ImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

interface Props {
  src: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  fit?: ImageFit;
  preview?: boolean;
  previewSrc?: string;
  lazy?: boolean;
  errorText?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  width: '',
  height: '',
  fit: 'cover',
  preview: false,
  previewSrc: '',
  lazy: true,
  errorText: undefined,
  customClass: '',
});

const emit = defineEmits<{
  load: [event: Event];
  error: [event: Event];
}>();

const imgRef = ref<HTMLImageElement>();
const loaded = ref(false);
const hasError = ref(false);
const loading = ref(true);
const previewVisible = ref(false);
const previewRef = ref<HTMLElement>();
const scale = ref(1);
const rotate = ref(0);

/* overlay 统一收口：滚动锁 + W4 降焦 + 背景 inert + 焦点 trap/Esc/恢复 */
const { afterLeave } = useOverlayLayer(previewVisible, {
  container: previewRef,
  onRequestClose: () => handleClosePreview(),
});

const imageClass = computed(() => {
  const classes = ['image'];
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

const wrapperStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  return style;
});

const imgClass = computed(() => ['image-img', `image-img--${props.fit}`]);

const imgStyle = computed(() => {
  const style: Record<string, string> = {};
  if (loaded.value) {
    style.opacity = '1';
  }
  return style;
});

const currentSrc = computed(() => props.src);
const previewSrc = computed(() => props.previewSrc || props.src);
const displayErrorText = computed(
  () => props.errorText || t('components.dataDisplay.image.errorText'),
);

const previewImgStyle = computed(() => ({
  transform: `scale(${scale.value}) rotate(${rotate.value}deg)`,
}));

const handleLoad = (event: Event) => {
  loaded.value = true;
  loading.value = false;
  hasError.value = false;
  emit('load', event);
};

const handleError = (event: Event) => {
  loading.value = false;
  hasError.value = true;
  emit('error', event);
};

const handlePreview = () => {
  if (props.preview && loaded.value) {
    previewVisible.value = true;
  }
};

const handleClosePreview = () => {
  if (!previewVisible.value) return;
  previewVisible.value = false;
  handleReset();
};

const handleZoomIn = () => {
  scale.value = Math.min(scale.value + 0.5, 5);
};

const handleZoomOut = () => {
  scale.value = Math.max(scale.value - 0.5, 0.5);
};

const handleRotate = () => {
  rotate.value = (rotate.value + 90) % 360;
};

const handleReset = () => {
  scale.value = 1;
  rotate.value = 0;
};
</script>

<style scoped>
.image {
  display: inline-block;
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.image-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  background: hsl(var(--surface-container-high));
  cursor: pointer;
}

.image-img {
  max-width: 100%;
  max-height: 100%;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-img--fill {
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.image-img--contain {
  object-fit: contain;
}

.image-img--cover {
  object-fit: cover;
}

.image-img--none {
  object-fit: none;
}

.image-img--scale-down {
  object-fit: scale-down;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: image-spin 0.8s linear infinite;
}

@keyframes image-spin {
  to { transform: rotate(360deg); }
}

.image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: hsl(var(--text-muted));
}

.image-error svg {
  width: 32px;
  height: 32px;
}

.image-error span {
  font-size: 12px;
}

.image-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background) / 0.5);
  opacity: 0;
  transition: opacity 0.2s;
}

.image-wrapper:hover .image-mask {
  opacity: 1;
}

.image-mask svg {
  width: 24px;
  height: 24px;
  color: hsl(var(--primary-foreground));
}

.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background) / 0.9);
  backdrop-filter: blur(8px);
}

.image-preview-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-preview-close {
  position: absolute;
  top: -40px;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: hsl(var(--surface));
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: hsl(var(--text));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.image-preview-close:hover {
  background: hsl(var(--surface-hover));
}

.image-preview-close svg {
  width: 12px;
  height: 12px;
}

.image-preview-img {
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 12px;
  transition: transform 0.3s;
}

.image-preview-actions {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: hsl(var(--surface));
  border-radius: 10px;
  box-shadow: 0 4px 12px hsl(var(--shadow));
}

.image-preview-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: hsl(var(--text-muted));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.image-preview-action:hover {
  background: hsl(var(--surface-hover));
  color: hsl(var(--text));
}

.image-preview-action svg {
  width: 18px;
  height: 18px;
}

.image-preview-enter-active,
.image-preview-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.image-preview-enter-from,
.image-preview-leave-to {
  opacity: 0;
}

.image-preview-enter-from .image-preview-img,
.image-preview-leave-to .image-preview-img {
  transform: scale(0.9);
}
</style>