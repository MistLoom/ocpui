<template>
  <div :class="cropperClass">
    <!-- 裁剪区域 -->
    <div ref="containerRef" class="cropper-container" :style="containerStyle">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="cropper-loading">
        <div class="cropper-loading-spinner"></div>
        <p>{{ t('components.dataEntry.imageCropper.loading') }}</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="cropper-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ error.message || t('components.dataEntry.imageCropper.loadError') }}</p>
      </div>
      
      <!-- 原图 -->
      <img
        v-else
        ref="imageRef"
        :src="src"
        class="cropper-image"
        :style="imageStyle"
        @load="handleImageLoad"
        @error="handleImageError"
        draggable="false"
      />
      
      <!-- 遮罩层 -->
      <div v-if="!isLoading && !error" class="cropper-overlay" :style="overlayStyle">
        <!-- 暗色遮罩 -->
        <div class="cropper-mask cropper-mask--top" :style="maskTopStyle" />
        <div class="cropper-mask cropper-mask--right" :style="maskRightStyle" />
        <div class="cropper-mask cropper-mask--bottom" :style="maskBottomStyle" />
        <div class="cropper-mask cropper-mask--left" :style="maskLeftStyle" />
        
        <!-- 裁剪框 -->
        <div
          v-if="!isLoading && !error"
          ref="cropBoxRef"
          class="cropper-box"
          :style="cropBoxStyle"
          @mousedown="handleMouseDown"
          @touchstart="handleTouchStart"
        >
          <!-- 网格线 -->
          <div v-if="showGrid" class="cropper-grid">
            <div class="cropper-grid-line cropper-grid-line--v1" />
            <div class="cropper-grid-line cropper-grid-line--v2" />
            <div class="cropper-grid-line cropper-grid-line--h1" />
            <div class="cropper-grid-line cropper-grid-line--h2" />
          </div>
          
          <!-- 边框 -->
          <div class="cropper-border" />
          
          <!-- 拖拽手柄 -->
          <template v-if="!fixed">
            <div class="cropper-handle cropper-handle--nw" data-handle="nw" />
            <div class="cropper-handle cropper-handle--ne" data-handle="ne" />
            <div class="cropper-handle cropper-handle--sw" data-handle="sw" />
            <div class="cropper-handle cropper-handle--se" data-handle="se" />
            <div class="cropper-handle cropper-handle--n" data-handle="n" />
            <div class="cropper-handle cropper-handle--s" data-handle="s" />
            <div class="cropper-handle cropper-handle--w" data-handle="w" />
            <div class="cropper-handle cropper-handle--e" data-handle="e" />
          </template>
          
          <!-- 尺寸提示 -->
          <div v-if="showSize" class="cropper-size">
            {{ Math.round(cropBox.width) }} × {{ Math.round(cropBox.height) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="cropper-toolbar">
      <div class="cropper-toolbar-group">
        <button type="button" class="cropper-btn" @click="handleZoomIn" :title="t('components.dataEntry.imageCropper.zoomIn')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button type="button" class="cropper-btn" @click="handleZoomOut" :title="t('components.dataEntry.imageCropper.zoomOut')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button type="button" class="cropper-btn" @click="handleRotateLeft" :title="t('components.dataEntry.imageCropper.rotateLeft')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 14 4 9 9 4"/>
            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>
          </svg>
        </button>
        <button type="button" class="cropper-btn" @click="handleRotateRight" :title="t('components.dataEntry.imageCropper.rotateRight')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 14 20 9 15 4"/>
            <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/>
          </svg>
        </button>
        <button type="button" class="cropper-btn" @click="handleReset" :title="t('components.dataEntry.imageCropper.reset')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
      </div>
      
      <div v-if="showConfirm" class="cropper-toolbar-group">
        <button type="button" class="cropper-btn cropper-btn--secondary" @click="handleCancel">
          {{ t('components.dataEntry.imageCropper.cancel') }}
        </button>
        <button type="button" class="cropper-btn cropper-btn--primary" @click="handleConfirm">
          {{ t('components.dataEntry.imageCropper.confirmCrop') }}
        </button>
      </div>
    </div>
    
    <!-- 预览区域 -->
    <div v-if="showPreview" class="cropper-preview">
      <div class="cropper-preview-title">{{ t('components.dataEntry.imageCropper.preview') }}</div>
      <canvas ref="previewCanvasRef" class="cropper-preview-canvas" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 图片裁剪组件
 * @description 用于裁剪图片的组件
 * 
 * @props {
 *   src: string; // 图片地址
 *   aspectRatio?: number; // 宽高比
 *   minWidth?: number; // 最小宽度
 *   minHeight?: number; // 最小高度
 *   maxWidth?: number; // 最大宽度
 *   maxHeight?: number; // 最大高度
 *   fixed?: boolean; // 是否固定裁剪框大小
 *   showGrid?: boolean; // 是否显示网格
 *   showSize?: boolean; // 是否显示尺寸
 *   showToolbar?: boolean; // 是否显示工具栏
 *   showConfirm?: boolean; // 是否显示确认按钮
 *   showPreview?: boolean; // 是否显示预览
 *   previewWidth?: number; // 预览宽度
 *   previewHeight?: number; // 预览高度
 *   initialCrop?: Partial<CropData>; // 初始裁剪数据
 *   customClass?: string; // 自定义类名
 *   containerHeight?: string | number; // 容器高度
 *   disabled?: boolean; // 是否禁用
 * }
 * 
 * @emits {
 *   confirm: [cropData: CropData, canvas: HTMLCanvasElement]; // 确认裁剪事件
 *   cancel: []; // 取消事件
 *   change: [cropData: CropData]; // 裁剪变化事件
 *   ready: []; // 组件就绪事件
 *   error: [error: Error]; // 错误事件
 *   zoom: [scale: number]; // 缩放事件
 *   rotate: [rotation: number]; // 旋转事件
 * }
 * 
 * @example
 * // 基本使用
 * <ImageCropper src="https://example.com/image.jpg" @confirm="handleConfirm" />
 * 
 * // 带宽高比
 * <ImageCropper src="https://example.com/image.jpg" :aspectRatio="16/9" @confirm="handleConfirm" />
 */
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  scale: number;
}

interface Props {
  src: string;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  fixed?: boolean;
  showGrid?: boolean;
  showSize?: boolean;
  showToolbar?: boolean;
  showConfirm?: boolean;
  showPreview?: boolean;
  previewWidth?: number;
  previewHeight?: number;
  initialCrop?: Partial<CropData>;
  customClass?: string;
  containerHeight?: string | number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: undefined,
  minWidth: 50,
  minHeight: 50,
  maxWidth: Infinity,
  maxHeight: Infinity,
  fixed: false,
  showGrid: true,
  showSize: true,
  showToolbar: true,
  showConfirm: true,
  showPreview: false,
  previewWidth: 200,
  previewHeight: 150,
  initialCrop: () => ({}),
  customClass: '',
  containerHeight: '400px',
  disabled: false,
});

const emit = defineEmits<{
  confirm: [cropData: CropData, canvas: HTMLCanvasElement];
  cancel: [];
  change: [cropData: CropData];
  ready: [];
  error: [error: Error];
  zoom: [scale: number];
  rotate: [rotation: number];
}>();

// Refs
const containerRef = ref<HTMLDivElement>();
const imageRef = ref<HTMLImageElement>();
const cropBoxRef = ref<HTMLDivElement>();
const previewCanvasRef = ref<HTMLCanvasElement>();

// State
const containerSize = ref({ width: 0, height: 0 });
const imageSize = ref({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
const imageScale = ref(1);
const rotation = ref(0);
const isDragging = ref(false);
const isResizing = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const cropBoxStart = ref({ x: 0, y: 0, width: 0, height: 0 });
const activeHandle = ref<string>('');
const isLoading = ref(true);
const error = ref<Error | null>(null);

// Crop box state
const cropBox = ref<CropData>({
  x: 0,
  y: 0,
  width: 200,
  height: 200,
  rotate: 0,
  scale: 1,
});

// Computed
const cropperClass = computed(() => {
  const classes = ['image-cropper'];
  if (props.customClass) classes.push(props.customClass);
  if (isDragging.value || isResizing.value) classes.push('image-cropper--active');
  return classes;
});

const containerStyle = computed(() => ({
  width: '100%',
  height: props.containerHeight,
}));

const imageStyle = computed(() => {
  const scale = imageScale.value;
  const rotate = rotation.value;
  return {
    transform: `scale(${scale}) rotate(${rotate}deg)`,
    transformOrigin: 'center center',
  };
});

const overlayStyle = computed(() => ({
  width: `${imageSize.value.width * imageScale.value}px`,
  height: `${imageSize.value.height * imageScale.value}px`,
}));

const cropBoxStyle = computed(() => ({
  left: `${cropBox.value.x}px`,
  top: `${cropBox.value.y}px`,
  width: `${cropBox.value.width}px`,
  height: `${cropBox.value.height}px`,
  cursor: isDragging.value ? 'grabbing' : 'grab',
}));

const maskTopStyle = computed(() => ({
  top: 0,
  left: 0,
  right: 0,
  height: `${cropBox.value.y}px`,
}));

const maskRightStyle = computed(() => ({
  top: `${cropBox.value.y}px`,
  left: `${cropBox.value.x + cropBox.value.width}px`,
  right: 0,
  height: `${cropBox.value.height}px`,
}));

const maskBottomStyle = computed(() => ({
  top: `${cropBox.value.y + cropBox.value.height}px`,
  left: 0,
  right: 0,
  bottom: 0,
}));

const maskLeftStyle = computed(() => ({
  top: `${cropBox.value.y}px`,
  left: 0,
  width: `${cropBox.value.x}px`,
  height: `${cropBox.value.height}px`,
}));

// Methods
const handleImageLoad = () => {
  if (!imageRef.value || !containerRef.value) return;
  
  isLoading.value = false;
  error.value = null;
  
  const img = imageRef.value;
  const container = containerRef.value;
  
  imageSize.value = {
    width: img.offsetWidth,
    height: img.offsetHeight,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
  };
  
  containerSize.value = {
    width: container.offsetWidth,
    height: container.offsetHeight,
  };
  
  // Calculate initial scale to fit image in container
  const scaleX = containerSize.value.width / imageSize.value.naturalWidth;
  const scaleY = containerSize.value.height / imageSize.value.naturalHeight;
  imageScale.value = Math.min(scaleX, scaleY, 1);
  
  // Initialize crop box
  initializeCropBox();
  
  emit('ready');
};

const handleImageError = () => {
  isLoading.value = false;
  error.value = new Error('图片加载失败');
  emit('error', error.value);
};

const initializeCropBox = () => {
  const scaledWidth = imageSize.value.naturalWidth * imageScale.value;
  const scaledHeight = imageSize.value.naturalHeight * imageScale.value;
  
  let width = props.initialCrop?.width || Math.min(300, scaledWidth * 0.8);
  let height = props.initialCrop?.height || Math.min(200, scaledHeight * 0.8);
  
  // Apply aspect ratio constraint
  if (props.aspectRatio) {
    height = width / props.aspectRatio;
  }
  
  // Constrain to min/max
  width = Math.max(props.minWidth, Math.min(width, props.maxWidth, scaledWidth));
  height = Math.max(props.minHeight, Math.min(height, props.maxHeight, scaledHeight));
  
  // Center the crop box
  const x = (scaledWidth - width) / 2;
  const y = (scaledHeight - height) / 2;
  
  cropBox.value = {
    x: props.initialCrop?.x ?? x,
    y: props.initialCrop?.y ?? y,
    width,
    height,
    rotate: props.initialCrop?.rotate ?? 0,
    scale: props.initialCrop?.scale ?? 1,
  };
  
  updatePreview();
};

// Mouse/Touch event handlers
const handleMouseDown = (e: MouseEvent) => {
  if (props.disabled || props.fixed) return;
  
  const target = e.target as HTMLElement;
  const handle = target.dataset.handle;
  
  if (handle) {
    isResizing.value = true;
    activeHandle.value = handle;
  } else {
    isDragging.value = true;
  }
  
  dragStart.value = { x: e.clientX, y: e.clientY };
  cropBoxStart.value = { ...cropBox.value };
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleTouchStart = (e: TouchEvent) => {
  if (props.disabled || props.fixed) return;
  
  const touch = e.touches[0];
  const target = e.target as HTMLElement;
  const handle = target.dataset.handle;
  
  if (handle) {
    isResizing.value = true;
    activeHandle.value = handle;
  } else {
    isDragging.value = true;
  }
  
  dragStart.value = { x: touch.clientX, y: touch.clientY };
  cropBoxStart.value = { ...cropBox.value };
  
  document.addEventListener('touchmove', handleTouchMove);
  document.addEventListener('touchend', handleTouchEnd);
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value && !isResizing.value) return;
  
  const deltaX = e.clientX - dragStart.value.x;
  const deltaY = e.clientY - dragStart.value.y;
  
  if (isDragging.value) {
    moveCropBox(deltaX, deltaY);
  } else if (isResizing.value) {
    resizeCropBox(deltaX, deltaY);
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value && !isResizing.value) return;
  
  const touch = e.touches[0];
  const deltaX = touch.clientX - dragStart.value.x;
  const deltaY = touch.clientY - dragStart.value.y;
  
  if (isDragging.value) {
    moveCropBox(deltaX, deltaY);
  } else if (isResizing.value) {
    resizeCropBox(deltaX, deltaY);
  }
};

const moveCropBox = (deltaX: number, deltaY: number) => {
  const scaledWidth = imageSize.value.naturalWidth * imageScale.value;
  const scaledHeight = imageSize.value.naturalHeight * imageScale.value;
  
  let newX = cropBoxStart.value.x + deltaX;
  let newY = cropBoxStart.value.y + deltaY;
  
  // Constrain to image bounds
  newX = Math.max(0, Math.min(newX, scaledWidth - cropBox.value.width));
  newY = Math.max(0, Math.min(newY, scaledHeight - cropBox.value.height));
  
  cropBox.value.x = newX;
  cropBox.value.y = newY;
  
  updatePreview();
  emit('change', cropBox.value);
};

const resizeCropBox = (deltaX: number, deltaY: number) => {
  const handle = activeHandle.value;
  const scaledWidth = imageSize.value.naturalWidth * imageScale.value;
  const scaledHeight = imageSize.value.naturalHeight * imageScale.value;
  
  let newX = cropBoxStart.value.x;
  let newY = cropBoxStart.value.y;
  let newWidth = cropBoxStart.value.width;
  let newHeight = cropBoxStart.value.height;
  
  // Apply resize based on handle
  if (handle.includes('e')) {
    newWidth = Math.max(props.minWidth, Math.min(cropBoxStart.value.width + deltaX, props.maxWidth, scaledWidth - newX));
  }
  if (handle.includes('w')) {
    const maxDeltaX = cropBoxStart.value.width - props.minWidth;
    const minDeltaX = -(cropBoxStart.value.x);
    const clampedDeltaX = Math.max(minDeltaX, Math.min(deltaX, maxDeltaX));
    newX = cropBoxStart.value.x + clampedDeltaX;
    newWidth = cropBoxStart.value.width - clampedDeltaX;
  }
  if (handle.includes('s')) {
    newHeight = Math.max(props.minHeight, Math.min(cropBoxStart.value.height + deltaY, props.maxHeight, scaledHeight - newY));
  }
  if (handle.includes('n')) {
    const maxDeltaY = cropBoxStart.value.height - props.minHeight;
    const minDeltaY = -(cropBoxStart.value.y);
    const clampedDeltaY = Math.max(minDeltaY, Math.min(deltaY, maxDeltaY));
    newY = cropBoxStart.value.y + clampedDeltaY;
    newHeight = cropBoxStart.value.height - clampedDeltaY;
  }
  
  // Apply aspect ratio constraint
  if (props.aspectRatio) {
    if (handle.includes('n') || handle.includes('s')) {
      newWidth = newHeight * props.aspectRatio;
    } else {
      newHeight = newWidth / props.aspectRatio;
    }
  }
  
  cropBox.value.x = newX;
  cropBox.value.y = newY;
  cropBox.value.width = newWidth;
  cropBox.value.height = newHeight;
  
  updatePreview();
  emit('change', cropBox.value);
};

const handleMouseUp = () => {
  isDragging.value = false;
  isResizing.value = false;
  activeHandle.value = '';
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
};

const handleTouchEnd = () => {
  isDragging.value = false;
  isResizing.value = false;
  activeHandle.value = '';
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('touchend', handleTouchEnd);
};

// Toolbar actions
const handleZoomIn = () => {
  if (props.disabled) return;
  imageScale.value = Math.min(imageScale.value * 1.2, 3);
  emit('zoom', imageScale.value);
};

const handleZoomOut = () => {
  if (props.disabled) return;
  imageScale.value = Math.max(imageScale.value / 1.2, 0.3);
  emit('zoom', imageScale.value);
};

const handleRotateLeft = () => {
  if (props.disabled) return;
  rotation.value -= 90;
  emit('rotate', rotation.value);
};

const handleRotateRight = () => {
  if (props.disabled) return;
  rotation.value += 90;
  emit('rotate', rotation.value);
};

const handleReset = () => {
  if (props.disabled) return;
  rotation.value = 0;
  imageScale.value = 1;
  initializeCropBox();
  emit('zoom', imageScale.value);
  emit('rotate', rotation.value);
};

const handleConfirm = () => {
  const canvas = getCroppedCanvas();
  if (canvas) {
    emit('confirm', cropBox.value, canvas);
  }
};

const handleCancel = () => {
  emit('cancel');
};

// Canvas operations
const getCroppedCanvas = (): HTMLCanvasElement | null => {
  if (!imageRef.value) return null;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  const img = imageRef.value;
  const scaleX = imageSize.value.naturalWidth / (imageSize.value.width * imageScale.value);
  const scaleY = imageSize.value.naturalHeight / (imageSize.value.height * imageScale.value);
  
  const sourceX = cropBox.value.x * scaleX;
  const sourceY = cropBox.value.y * scaleY;
  const sourceWidth = cropBox.value.width * scaleX;
  const sourceHeight = cropBox.value.height * scaleY;
  
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;
  
  // Handle rotation
  if (rotation.value !== 0) {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation.value * Math.PI) / 180);
    ctx.drawImage(img, -sourceWidth / 2, -sourceHeight / 2, sourceWidth, sourceHeight);
    ctx.restore();
  } else {
    ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
  }
  
  return canvas;
};

const updatePreview = () => {
  if (!props.showPreview || !previewCanvasRef.value) return;
  
  const canvas = getCroppedCanvas();
  if (!canvas) return;
  
  const previewCanvas = previewCanvasRef.value;
  const ctx = previewCanvas.getContext('2d');
  if (!ctx) return;
  
  previewCanvas.width = props.previewWidth;
  previewCanvas.height = props.previewHeight;
  
  ctx.drawImage(canvas, 0, 0, props.previewWidth, props.previewHeight);
};

// Watch for src changes
watch(() => props.src, () => {
  nextTick(() => {
    if (imageRef.value?.complete) {
      handleImageLoad();
    }
  });
});

// Lifecycle
onMounted(() => {
  window.addEventListener('resize', handleImageLoad);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleImageLoad);
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('touchend', handleTouchEnd);
});

// Expose methods
defineExpose({
  getCroppedCanvas,
  getCropData: () => cropBox.value,
  setCropData: (data: Partial<CropData>) => {
    cropBox.value = { ...cropBox.value, ...data };
    updatePreview();
  },
});
</script>

<style scoped>
.image-cropper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.cropper-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--surface-container-high));
  border-radius: 12px;
  overflow: hidden;
  user-select: none;
}

.cropper-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.cropper-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.cropper-mask {
  position: absolute;
  background: hsl(var(--background) / 0.7);
  pointer-events: none;
}

.cropper-box {
  position: absolute;
  box-sizing: border-box;
  cursor: grab;
}

.cropper-box:active {
  cursor: grabbing;
}

.cropper-border {
  position: absolute;
  inset: 0;
  border: 2px solid hsl(var(--primary));
  pointer-events: none;
}

.cropper-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cropper-grid-line {
  position: absolute;
  background: hsl(var(--primary) / 0.3);
}

.cropper-grid-line--v1,
.cropper-grid-line--v2 {
  width: 1px;
  height: 100%;
  top: 0;
}

.cropper-grid-line--v1 { left: 33.33%; }
.cropper-grid-line--v2 { left: 66.66%; }

.cropper-grid-line--h1,
.cropper-grid-line--h2 {
  width: 100%;
  height: 1px;
  left: 0;
}

.cropper-grid-line--h1 { top: 33.33%; }
.cropper-grid-line--h2 { top: 66.66%; }

.cropper-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: hsl(var(--primary));
  border: 2px solid white;
  border-radius: 50%;
  z-index: 1;
}

.cropper-handle--nw { top: -5px; left: -5px; cursor: nw-resize; }
.cropper-handle--ne { top: -5px; right: -5px; cursor: ne-resize; }
.cropper-handle--sw { bottom: -5px; left: -5px; cursor: sw-resize; }
.cropper-handle--se { bottom: -5px; right: -5px; cursor: se-resize; }
.cropper-handle--n { top: -5px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
.cropper-handle--s { bottom: -5px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
.cropper-handle--w { left: -5px; top: 50%; transform: translateY(-50%); cursor: w-resize; }
.cropper-handle--e { right: -5px; top: 50%; transform: translateY(-50%); cursor: e-resize; }

.cropper-size {
  position: absolute;
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  font-size: 12px;
  color: hsl(var(--text-secondary));
  white-space: nowrap;
}

.cropper-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
}

.cropper-toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cropper-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  background: hsl(var(--surface-container-high));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--text));
  cursor: pointer;
  transition: color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), background-color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.cropper-btn:hover {
  background: hsl(var(--surface-hover));
  border-color: hsl(var(--border-hover));
}

.cropper-btn svg {
  width: 16px;
  height: 16px;
}

.cropper-btn--primary {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: white;
}

.cropper-btn--primary:hover {
  background: hsl(var(--primary) / 0.9);
  border-color: hsl(var(--primary) / 0.9);
}

.cropper-btn--secondary {
  background: transparent;
}

.cropper-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cropper-preview-title {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--text-secondary));
}

.cropper-preview-canvas {
  border-radius: 8px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--surface-container-high));
}

/* 加载状态 */
.cropper-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: hsl(var(--surface-container-high));
  z-index: var(--z-dropdown);
}

.cropper-loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid hsl(var(--border));
  border-top: 3px solid hsl(var(--primary));
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.cropper-loading p {
  margin: 0;
  font-size: 14px;
  color: hsl(var(--text-secondary));
}

/* 错误状态 */
.cropper-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: hsl(var(--surface-container-high));
  z-index: var(--z-dropdown);
  padding: 24px;
  text-align: center;
}

.cropper-error svg {
  width: 48px;
  height: 48px;
  color: hsl(var(--error));
  margin-bottom: 16px;
}

.cropper-error p {
  margin: 0;
  font-size: 14px;
  color: hsl(var(--text));
}

/* 禁用状态 */
.image-cropper--disabled .cropper-container {
  opacity: 0.6;
  pointer-events: none;
}

.image-cropper--disabled .cropper-toolbar {
  opacity: 0.6;
  pointer-events: none;
}

/* Active state */
.image-cropper--active .cropper-box {
  z-index: 10;
}

/* Responsive */
@media (max-width: 639.98px) {
  .cropper-toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .cropper-toolbar-group {
    width: 100%;
    justify-content: center;
  }
  
  .cropper-btn {
    padding: 10px 12px;
    font-size: 12px;
  }
}
</style>
