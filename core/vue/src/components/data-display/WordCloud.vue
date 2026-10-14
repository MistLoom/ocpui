<!--
WordCloud 词云组件

## 组件说明
基于 Canvas 的高性能词云组件，支持自定义数据、形状、颜色方案、旋转角度等配置

## 公开属性
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| data | WordData[] | [] | 词云数据数组 |
| width | number | 800 | 画布宽度 |
| height | number | 400 | 画布高度 |
| shape | 'circle' \| 'rectangle' \| 'diamond' \| 'triangle' \| 'heart' \| 'star' \| 'custom' | 'rectangle' | 词云形状 |
| customShapePath | string | '' | 自定义形状SVG路径（shape为custom时使用）|
| minFontSize | number | 12 | 最小字体大小(px) |
| maxFontSize | number | 64 | 最大字体大小(px) |
| fontFamily | string | 'Inter, sans-serif' | 字体家族 |
| fontWeight | string \| number | 500 | 字重 |
| colorScheme | 'default' \| 'tech' \| 'warm' \| 'cool' \| 'monochrome' \| string[] | 'default' | 颜色方案 |
| rotationRange | [number, number] | [-30, 30] | 旋转角度范围(度) |
| rotationProbability | number | 0.3 | 旋转概率(0-1) |
| padding | number | 4 | 词间距(px) |
| ellipticity | number | 1 | 椭圆度(1为圆形，>1为横向椭圆，<1为纵向椭圆) |
| shrinkToFit | boolean | true | 是否自动缩小以适应容器 |
| backgroundColor | string | 'transparent' | 背景颜色 |
| hoverHighlight | boolean | true | 是否启用悬停高亮 |
| animation | boolean | true | 是否启用入场动画 |
| animationDuration | number | 800 | 动画时长(ms) |
| loading | boolean | false | 是否显示加载状态 |
| emptyText | string | '暂无数据' | 空数据提示文本 |
| ariaLabel | string | '词云图表' | ARIA标签 |

## 事件
| 事件名 | 参数 | 说明 |
|--------|------|------|
| word-click | (word: WordData, index: number) | 点击词语时触发 |
| word-hover | (word: WordData, index: number) | 悬停词语时触发 |
| word-leave | () | 离开词语时触发 |
| render-complete | () | 渲染完成时触发 |
| render-error | (error: Error) | 渲染出错时触发 |

## 类型定义
```typescript
interface WordData {
  text: string;           // 词语文本
  value: number;          // 权重值（决定字体大小）
  color?: string;         // 自定义颜色（可选）
  fontSize?: number;      // 自定义字体大小（可选）
  rotation?: number;      // 自定义旋转角度（可选）
  url?: string;           // 点击跳转链接（可选）
  tooltip?: string;       // 悬停提示文本（可选）
}
```

## 使用示例
```vue
<template>
  <WordCloud
    :data="wordData"
    :width="800"
    :height="400"
    shape="circle"
    colorScheme="tech"
    @word-click="handleWordClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import WordCloud from './WordCloud.vue';

const wordData = ref([
  { text: 'Vue', value: 100 },
  { text: 'React', value: 80 },
  { text: 'Angular', value: 60 },
  { text: 'TypeScript', value: 90 },
  { text: 'JavaScript', value: 85 },
  // ...
]);

const handleWordClick = (word, index) => {
};
</script>
```
-->
<template>
  <div
    ref="containerRef"
    class="word-cloud"
    :class="{
      'word-cloud--loading': loading,
      'word-cloud--empty': isEmpty,
      'word-cloud--error': hasError
    }"
    :style="containerStyle"
    role="img"
    :aria-label="displayAriaLabel"
  >
    <!-- 加载状态 -->
    <div v-if="loading" class="word-cloud__loading" role="status" aria-live="polite">
      <div class="word-cloud__spinner" aria-hidden="true" />
      <span class="word-cloud__loading-text">{{ t('components.dataDisplay.wordCloud.loading') }}</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="word-cloud__error" role="alert">
      <Icon name="alert-circle" :size="32" class="word-cloud__error-icon" />
      <span class="word-cloud__error-text">{{ errorMessage }}</span>
      <Button variant="secondary" size="sm" @click="retryRender">
        {{ t('components.dataDisplay.wordCloud.retry') }}
      </Button>
    </div>

    <!-- 空数据状态 -->
    <div v-else-if="isEmpty" class="word-cloud__empty" role="status">
      <Icon name="cloud-off" :size="32" class="word-cloud__empty-icon" />
      <span class="word-cloud__empty-text">{{ displayEmptyText }}</span>
    </div>

    <!-- 词云画布 -->
    <template v-else>
      <canvas
        ref="canvasRef"
        :width="canvasWidth"
        :height="canvasHeight"
        class="word-cloud__canvas"
        :style="canvasStyle"
        @click="handleCanvasClick"
        @mousemove="handleCanvasMouseMove"
        @mouseleave="handleCanvasMouseLeave"
        @keydown="handleKeyDown"
        tabindex="0"
        role="application"
        :aria-label="t('components.dataDisplay.wordCloud.keyboardNav', { ariaLabel: displayAriaLabel })"
      />

      <!-- Tooltip -->
      <Transition name="tooltip">
        <div
          v-if="hoveredWord && tooltipVisible"
          class="word-cloud__tooltip"
          :style="tooltipStyle"
          role="tooltip"
        >
          <div class="word-cloud__tooltip-text">{{ hoveredWord.text }}</div>
          <div v-if="hoveredWord.tooltip || showValueInTooltip" class="word-cloud__tooltip-value">
            {{ hoveredWord.tooltip || t('components.dataDisplay.wordCloud.weight', { value: hoveredWord.value }) }}
          </div>
        </div>
      </Transition>

      <!-- 隐藏文本供屏幕阅读器使用 -->
      <div class="word-cloud__sr-only" role="list" :aria-label="t('components.dataDisplay.wordCloud.wordListAriaLabel')">
        <span
          v-for="(word, index) in normalizedData"
          :key="index"
          role="listitem"
        >
          {{ t('components.dataDisplay.wordCloud.wordItem', { text: word.text, value: word.value }) }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import Icon from '@ocpui/vue/utility/Icon.vue';
import Button from '@ocpui/vue/utility/Button.vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import { useRafLoop } from '../../composables/useRafLoop';
import { useReducedMotion } from '../../composables/useReducedMotion';

const { uiT: t } = useUiT();

export interface WordData {
  text: string;
  value: number;
  color?: string;
  fontSize?: number;
  rotation?: number;
  url?: string;
  tooltip?: string;
}

export type WordCloudShape = 'circle' | 'rectangle' | 'diamond' | 'triangle' | 'heart' | 'star' | 'custom';
export type ColorScheme = 'default' | 'tech' | 'warm' | 'cool' | 'monochrome' | string[];

export interface WordCloudProps {
  data?: WordData[];
  width?: number;
  height?: number;
  shape?: WordCloudShape;
  customShapePath?: string;
  minFontSize?: number;
  maxFontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  colorScheme?: ColorScheme;
  rotationRange?: [number, number];
  rotationProbability?: number;
  padding?: number;
  ellipticity?: number;
  shrinkToFit?: boolean;
  backgroundColor?: string;
  hoverHighlight?: boolean;
  animation?: boolean;
  animationDuration?: number;
  loading?: boolean;
  emptyText?: string;
  ariaLabel?: string;
  showValueInTooltip?: boolean;
}

const props = withDefaults(defineProps<WordCloudProps>(), {
  data: () => [],
  width: 800,
  height: 400,
  shape: 'rectangle',
  customShapePath: '',
  minFontSize: 12,
  maxFontSize: 64,
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  fontWeight: 500,
  colorScheme: 'default',
  rotationRange: () => [-30, 30],
  rotationProbability: 0.3,
  padding: 4,
  ellipticity: 1,
  shrinkToFit: true,
  backgroundColor: 'transparent',
  hoverHighlight: true,
  animation: true,
  animationDuration: 800,
  loading: false,
  emptyText: undefined,
  ariaLabel: undefined,
  showValueInTooltip: true,
});

const displayEmptyText = computed(() => props.emptyText ?? t('components.dataDisplay.wordCloud.emptyText'));
const displayAriaLabel = computed(() => props.ariaLabel ?? t('components.dataDisplay.wordCloud.ariaLabel'));

const emit = defineEmits<{
  (e: 'word-click', word: WordData, index: number): void;
  (e: 'word-hover', word: WordData, index: number): void;
  (e: 'word-leave'): void;
  (e: 'render-complete'): void;
  (e: 'render-error', error: Error): void;
}>();

// 响应式数据
const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWidth = ref(props.width);
const canvasHeight = ref(props.height);
const hasError = ref(false);
const errorMessage = ref('');
const hoveredWord = ref<WordData | null>(null);
const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const focusedIndex = ref(-1);
const renderedWords = ref<Array<WordData & { x: number; y: number; width: number; height: number; rotation: number; fontSize: number; color: string }>>([]);
const animationProgress = ref(0);
const reducedMotion = useReducedMotion();

// 逐帧渲染循环：统一 rAF 生命周期（卸载自动取消，Promise 不会悬挂）
let rafCtx: CanvasRenderingContext2D | null = null;
let rafStartTime = 0;
let rafResolve: (() => void) | null = null;
const renderLoop = useRafLoop((now, controls) => {
  const ctx = rafCtx;
  if (!ctx || !rafResolve) {
    controls.stop();
    return;
  }
  const elapsed = now - rafStartTime;
  const progress = Math.min(elapsed / props.animationDuration, 1);

  // easeOutQuart
  animationProgress.value = 1 - Math.pow(1 - progress, 4);

  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
  if (props.backgroundColor !== 'transparent') {
    ctx.fillStyle = props.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value);
  }
  drawWords(ctx, animationProgress.value);

  if (progress >= 1) {
    const resolve = rafResolve;
    rafCtx = null;
    rafResolve = null;
    controls.stop();
    resolve();
  }
});

// 颜色方案
const colorSchemes: Record<string, string[]> = {
  default: [
    'hsl(220, 90%, 56%)',
    'hsl(200, 95%, 50%)',
    'hsl(160, 84%, 45%)',
    'hsl(45, 95%, 50%)',
    'hsl(0, 85%, 55%)',
    'hsl(280, 80%, 60%)',
    'hsl(340, 90%, 60%)',
    'hsl(180, 90%, 45%)',
  ],
  tech: [
    'hsl(220, 90%, 56%)',
    'hsl(210, 95%, 55%)',
    'hsl(200, 95%, 50%)',
    'hsl(190, 90%, 55%)',
    'hsl(180, 85%, 50%)',
    'hsl(170, 80%, 55%)',
    'hsl(230, 85%, 60%)',
    'hsl(240, 80%, 55%)',
  ],
  warm: [
    'hsl(0, 85%, 55%)',
    'hsl(15, 90%, 55%)',
    'hsl(30, 95%, 55%)',
    'hsl(45, 95%, 50%)',
    'hsl(60, 90%, 50%)',
    'hsl(340, 90%, 60%)',
    'hsl(25, 95%, 60%)',
    'hsl(55, 95%, 55%)',
  ],
  cool: [
    'hsl(180, 90%, 45%)',
    'hsl(190, 85%, 50%)',
    'hsl(200, 90%, 55%)',
    'hsl(210, 95%, 55%)',
    'hsl(220, 90%, 56%)',
    'hsl(160, 84%, 45%)',
    'hsl(170, 90%, 50%)',
    'hsl(230, 85%, 60%)',
  ],
  monochrome: [
    'hsl(220, 20%, 20%)',
    'hsl(220, 15%, 35%)',
    'hsl(220, 10%, 50%)',
    'hsl(220, 15%, 40%)',
    'hsl(220, 20%, 30%)',
    'hsl(220, 10%, 45%)',
    'hsl(220, 25%, 25%)',
    'hsl(220, 5%, 55%)',
  ],
};

// 计算属性
const isEmpty = computed(() => !props.loading && props.data.length === 0);

const normalizedData = computed(() => {
  if (!props.data || props.data.length === 0) return [];

  const maxValue = Math.max(...props.data.map(d => d.value));
  const minValue = Math.min(...props.data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;

  return props.data
    .filter(item => item.text && item.value > 0)
    .map((item, index) => ({
      ...item,
      // 根据权重计算字体大小
      fontSize: item.fontSize || calculateFontSize(item.value, minValue, maxValue, valueRange),
      // 根据概率决定是否旋转
      rotation: item.rotation !== undefined
        ? item.rotation
        : (Math.random() < props.rotationProbability
          ? randomRange(props.rotationRange[0], props.rotationRange[1])
          : 0),
      // 分配颜色
      color: item.color || getColor(index),
    }))
    .sort((a, b) => b.value - a.value); // 按权重降序排列
});

const containerStyle = computed(() => ({
  width: '100%',
  maxWidth: `${props.width}px`,
  height: `${props.height}px`,
  backgroundColor: props.backgroundColor,
}));

const canvasStyle = computed(() => ({
  width: '100%',
  height: '100%',
  cursor: hoveredWord.value ? 'pointer' : 'default',
}));

const tooltipStyle = computed(() => ({
  left: `${tooltipX.value}px`,
  top: `${tooltipY.value - 8}px`,
  transform: 'translate(-50%, -100%)',
}));

// 获取颜色
function getColor(index: number): string {
  const scheme = props.colorScheme;
  if (Array.isArray(scheme)) {
    return scheme[index % scheme.length];
  }
  const colors = colorSchemes[scheme as string] || colorSchemes.default;
  return colors[index % colors.length];
}

// 计算字体大小
function calculateFontSize(value: number, minValue: number, _maxValue: number, valueRange: number): number {
  const normalizedValue = (value - minValue) / valueRange;
  return props.minFontSize + normalizedValue * (props.maxFontSize - props.minFontSize);
}

// 随机范围
function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// 检查点是否在形状内
function isPointInShape(x: number, y: number, width: number, height: number): boolean {
  const centerX = width / 2;
  const centerY = height / 2;
  const dx = (x - centerX) / (width / 2);
  const dy = (y - centerY) / (height / 2) * props.ellipticity;

  switch (props.shape) {
    case 'circle':
      return dx * dx + dy * dy <= 1;
    case 'rectangle':
      return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
    case 'diamond':
      return Math.abs(dx) + Math.abs(dy) <= 1;
    case 'triangle':
      return dy >= -0.5 && dy <= 1 && Math.abs(dx) <= (1 - dy) * 0.866;
    case 'heart':
      // 简化的爱心形状
      const x2 = dx * 2;
      const y2 = dy * 2 + 0.5;
      return Math.pow(x2 * x2 + y2 * y2 - 1, 3) - x2 * x2 * y2 * y2 * y2 <= 0;
    case 'star': {
      // 简化的五角星
      const angle = Math.atan2(dy, dx);
      const radius = Math.sqrt(dx * dx + dy * dy);
      const starRadius = 0.5 + 0.5 * Math.cos(5 * angle);
      return radius <= starRadius;
    }
    case 'custom':
      // 自定义形状使用矩形边界框
      return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
    default:
      return true;
  }
}

// 获取形状的边界
function getShapeBounds(width: number, height: number): { minX: number; maxX: number; minY: number; maxY: number } {
  const centerX = width / 2;
  const centerY = height / 2;

  switch (props.shape) {
    case 'circle':
      return {
        minX: centerX - width / 2,
        maxX: centerX + width / 2,
        minY: centerY - height / (2 * props.ellipticity),
        maxY: centerY + height / (2 * props.ellipticity),
      };
    case 'diamond':
      return {
        minX: centerX - width / 2,
        maxX: centerX + width / 2,
        minY: centerY - height / (2 * props.ellipticity),
        maxY: centerY + height / (2 * props.ellipticity),
      };
    default:
      return {
        minX: 0,
        maxX: width,
        minY: 0,
        maxY: height,
      };
  }
}

// 测量文本尺寸
function measureText(ctx: CanvasRenderingContext2D, text: string, fontSize: number): { width: number; height: number } {
  ctx.font = `${props.fontWeight} ${fontSize}px ${props.fontFamily}`;
  const metrics = ctx.measureText(text);
  return {
    width: metrics.width,
    height: fontSize * 1.2, // 估算高度
  };
}

// 检查碰撞
function checkCollision(
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
  placedWords: Array<{ x: number; y: number; width: number; height: number; rotation: number }>
): boolean {
  // 简化的碰撞检测 - 使用边界框
  void rotation; // 避免未使用警告

  for (const word of placedWords) {
    const dx = Math.abs(x - word.x);
    const dy = Math.abs(y - word.y);
    const minDistance = (width + word.width) / 2 + props.padding;
    const minDistanceY = (height + word.height) / 2 + props.padding;

    if (dx < minDistance && dy < minDistanceY) {
      return true;
    }
  }

  return false;
}

// 螺旋布局算法
function* spiralGenerator(centerX: number, centerY: number): Generator<{ x: number; y: number }> {
  let angle = 0;
  let radius = 0;
  const step = 0.5;

  while (true) {
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle) / props.ellipticity;
    yield { x, y };

    angle += step;
    radius += step * 2;
  }
}

// 渲染词云
async function renderWordCloud() {
  if (!canvasRef.value || normalizedData.value.length === 0) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  try {
    hasError.value = false;
    errorMessage.value = '';

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);

    // 填充背景
    if (props.backgroundColor !== 'transparent') {
      ctx.fillStyle = props.backgroundColor;
      ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value);
    }

    const placedWords: Array<{ x: number; y: number; width: number; height: number; rotation: number }> = [];
    const bounds = getShapeBounds(canvasWidth.value, canvasHeight.value);
    const centerX = canvasWidth.value / 2;
    const centerY = canvasHeight.value / 2;

    renderedWords.value = [];

    // 放置每个词
    for (let i = 0; i < normalizedData.value.length; i++) {
      const word = normalizedData.value[i];
      const { width: textWidth, height: textHeight } = measureText(ctx, word.text, word.fontSize);

      // 尝试找到合适的位置
      let placed = false;
      const spiral = spiralGenerator(centerX, centerY);
      let attempts = 0;
      const maxAttempts = 2000;

      while (!placed && attempts < maxAttempts) {
        const { x, y } = spiral.next().value;
        attempts++;

        // 检查是否在形状内
        if (!isPointInShape(x, y, canvasWidth.value, canvasHeight.value)) {
          continue;
        }

        // 检查是否在边界内
        if (x < bounds.minX + textWidth / 2 || x > bounds.maxX - textWidth / 2 ||
            y < bounds.minY + textHeight / 2 || y > bounds.maxY - textHeight / 2) {
          continue;
        }

        // 检查碰撞
        if (!checkCollision(x, y, textWidth, textHeight, word.rotation, placedWords)) {
          placedWords.push({ x, y, width: textWidth, height: textHeight, rotation: word.rotation });
          renderedWords.value.push({
            ...word,
            x,
            y,
            width: textWidth,
            height: textHeight,
          });
          placed = true;
        }
      }

      // 如果无法放置，缩小字体重试
      if (!placed && props.shrinkToFit && word.fontSize > props.minFontSize) {
        const smallerFontSize = Math.max(props.minFontSize, word.fontSize * 0.8);
        const { width: smallerWidth, height: smallerHeight } = measureText(ctx, word.text, smallerFontSize);

        const spiral2 = spiralGenerator(centerX, centerY);
        attempts = 0;

        while (!placed && attempts < maxAttempts) {
          const { x, y } = spiral2.next().value;
          attempts++;

          if (!isPointInShape(x, y, canvasWidth.value, canvasHeight.value)) continue;

          if (!checkCollision(x, y, smallerWidth, smallerHeight, word.rotation, placedWords)) {
            placedWords.push({ x, y, width: smallerWidth, height: smallerHeight, rotation: word.rotation });
            renderedWords.value.push({
              ...word,
              x,
              y,
              width: smallerWidth,
              height: smallerHeight,
              fontSize: smallerFontSize,
            });
            placed = true;
          }
        }
      }
    }

    // 执行动画或立即绘制
    if (props.animation) {
      await animateRender(ctx);
    } else {
      drawWords(ctx, 1);
    }

    emit('render-complete');
  } catch (error) {
    hasError.value = true;
    errorMessage.value = error instanceof Error ? error.message : t('components.dataDisplay.wordCloud.renderError');
    emit('render-error', error instanceof Error ? error : new Error(String(error)));
  }
}

// 动画渲染：逐帧循环由 useRafLoop 统一管理；减动效时直接终态绘制
function animateRender(ctx: CanvasRenderingContext2D): Promise<void> {
  if (reducedMotion.value) {
    animationProgress.value = 1;
    ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
    if (props.backgroundColor !== 'transparent') {
      ctx.fillStyle = props.backgroundColor;
      ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value);
    }
    drawWords(ctx, 1);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    // 上一轮渲染被新一轮取代时先结算，避免 Promise 悬挂
    rafResolve?.();
    rafCtx = ctx;
    rafStartTime = performance.now();
    rafResolve = resolve;
    renderLoop.start();
  });
}

// 绘制词语
function drawWords(ctx: CanvasRenderingContext2D, progress: number) {
  const wordsToDraw = Math.ceil(renderedWords.value.length * progress);

  for (let i = 0; i < wordsToDraw; i++) {
    const word = renderedWords.value[i];
    if (!word) continue;

    ctx.save();

    // 应用变换
    ctx.translate(word.x, word.y);
    ctx.rotate(word.rotation * Math.PI / 180);

    // 设置字体
    ctx.font = `${props.fontWeight} ${word.fontSize}px ${props.fontFamily}`;

    // 高亮效果
    if (props.hoverHighlight && hoveredWord.value?.text === word.text) {
      ctx.fillStyle = 'hsl(var(--primary))';
    } else {
      ctx.fillStyle = word.color;
    }

    // 绘制文本
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(word.text, 0, 0);

    ctx.restore();
  }
}

// 获取鼠标位置对应的词语
function getWordAtPosition(x: number, y: number): { word: WordData & { x: number; y: number; width: number; height: number; rotation: number; fontSize: number; color: string }; index: number } | null {
  const canvas = canvasRef.value;
  if (!canvas) return null;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvasWidth.value / rect.width;
  const scaleY = canvasHeight.value / rect.height;
  const canvasX = (x - rect.left) * scaleX;
  const canvasY = (y - rect.top) * scaleY;

  // 从后往前查找（后绘制的在上层）
  for (let i = renderedWords.value.length - 1; i >= 0; i--) {
    const word = renderedWords.value[i];

    // 简化的点击检测 - 使用边界框
    const cos = Math.cos(-word.rotation * Math.PI / 180);
    const sin = Math.sin(-word.rotation * Math.PI / 180);
    const dx = canvasX - word.x;
    const dy = canvasY - word.y;
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    if (Math.abs(localX) <= word.width / 2 && Math.abs(localY) <= word.height / 2) {
      return { word, index: i };
    }
  }

  return null;
}

// 事件处理
function handleCanvasClick(event: MouseEvent) {
  const result = getWordAtPosition(event.clientX, event.clientY);
  if (result) {
    emit('word-click', result.word, result.index);

    // 如果有URL，打开链接
    if (result.word.url) {
      window.open(result.word.url, '_blank');
    }
  }
}

function handleCanvasMouseMove(event: MouseEvent) {
  const result = getWordAtPosition(event.clientX, event.clientY);

  if (result) {
    if (!hoveredWord.value || hoveredWord.value.text !== result.word.text) {
      hoveredWord.value = result.word;
      emit('word-hover', result.word, result.index);

      // 重绘以显示高亮
      if (props.hoverHighlight && canvasRef.value) {
        const ctx = canvasRef.value.getContext('2d');
        if (ctx) {
          drawWords(ctx, 1);
        }
      }
    }

    // 更新tooltip位置
    const rect = (event.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    tooltipX.value = event.clientX - rect.left;
    tooltipY.value = event.clientY - rect.top;
    tooltipVisible.value = true;
  } else {
    if (hoveredWord.value) {
      hoveredWord.value = null;
      emit('word-leave');
      tooltipVisible.value = false;

      // 重绘以移除高亮
      if (props.hoverHighlight && canvasRef.value) {
        const ctx = canvasRef.value.getContext('2d');
        if (ctx) {
          drawWords(ctx, 1);
        }
      }
    }
  }
}

function handleCanvasMouseLeave() {
  if (hoveredWord.value) {
    hoveredWord.value = null;
    emit('word-leave');
    tooltipVisible.value = false;

    if (props.hoverHighlight && canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d');
      if (ctx) {
        drawWords(ctx, 1);
      }
    }
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (renderedWords.value.length === 0) return;

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      focusedIndex.value = (focusedIndex.value + 1) % renderedWords.value.length;
      hoveredWord.value = renderedWords.value[focusedIndex.value];
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      focusedIndex.value = focusedIndex.value <= 0
        ? renderedWords.value.length - 1
        : focusedIndex.value - 1;
      hoveredWord.value = renderedWords.value[focusedIndex.value];
      break;
    case 'Enter':
      if (hoveredWord.value && focusedIndex.value >= 0) {
        emit('word-click', hoveredWord.value, focusedIndex.value);
        if (hoveredWord.value.url) {
          window.open(hoveredWord.value.url, '_blank');
        }
      }
      break;
    case 'Escape':
      hoveredWord.value = null;
      focusedIndex.value = -1;
      emit('word-leave');
      break;
  }
}

function retryRender() {
  hasError.value = false;
  errorMessage.value = '';
  nextTick(() => {
    renderWordCloud();
  });
}

// 监听数据变化
watch(() => props.data, () => {
  if (!props.loading) {
    nextTick(() => {
      renderWordCloud();
    });
  }
}, { deep: true });

watch(() => props.width, (newWidth) => {
  canvasWidth.value = newWidth;
  nextTick(() => {
    renderWordCloud();
  });
});

watch(() => props.height, (newHeight) => {
  canvasHeight.value = newHeight;
  nextTick(() => {
    renderWordCloud();
  });
});

watch(() => props.loading, (isLoading) => {
  if (!isLoading) {
    nextTick(() => {
      renderWordCloud();
    });
  }
});

// 响应式处理
function handleResize() {
  if (containerRef.value && props.shrinkToFit) {
    const containerWidth = containerRef.value.clientWidth;
    if (containerWidth < props.width) {
      const scale = containerWidth / props.width;
      canvasWidth.value = containerWidth;
      canvasHeight.value = props.height * scale;
    } else {
      canvasWidth.value = props.width;
      canvasHeight.value = props.height;
    }
    renderWordCloud();
  }
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    handleResize();
    if (!props.loading) {
      renderWordCloud();
    }
  });

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  // 卸载时结算进行中的渲染 Promise，避免悬挂
  rafResolve?.();
  rafResolve = null;
  rafCtx = null;
});

// 暴露方法
defineExpose({
  render: renderWordCloud,
  getWords: () => renderedWords.value,
  clear: () => {
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
      }
    }
    renderedWords.value = [];
  },
});
</script>

<style scoped>
.word-cloud {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md-lg);
  overflow: hidden;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.word-cloud:hover {
  border-color: hsl(var(--border-hover));
  box-shadow: var(--shadow-sm);
}

.word-cloud--loading,
.word-cloud--empty,
.word-cloud--error {
  min-height: 200px;
}

.word-cloud__canvas {
  display: block;
  outline: none;
}

.word-cloud__canvas:focus-visible {
  
  outline-offset: 2px;
}

/* 加载状态 */
.word-cloud__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: hsl(var(--text-secondary));
}

.word-cloud__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: word-cloud-spin 1s linear infinite;
}

@keyframes word-cloud-spin {
  to { transform: rotate(360deg); }
}

.word-cloud__loading-text {
  font-size: var(--font-size-sm);
  color: hsl(var(--text-muted));
}

/* 空数据状态 */
.word-cloud__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: hsl(var(--text-muted));
}

.word-cloud__empty-icon {
  opacity: 0.5;
}

.word-cloud__empty-text {
  font-size: var(--font-size-sm);
}

/* 错误状态 */
.word-cloud__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-5);
  text-align: center;
}

.word-cloud__error-icon {
  color: hsl(var(--error));
}

.word-cloud__error-text {
  font-size: var(--font-size-sm);
  color: hsl(var(--text-secondary));
  max-width: 300px;
}

/* Tooltip */
.word-cloud__tooltip {
  position: absolute;
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md-md);
  padding: var(--space-2) var(--space-3);
  box-shadow: var(--shadow-md);
  pointer-events: none;
  z-index: 100;
  min-width: 80px;
  text-align: center;
}

.word-cloud__tooltip-text {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: hsl(var(--text));
}

.word-cloud__tooltip-value {
  font-size: var(--font-size-xs);
  color: hsl(var(--text-muted));
  margin-top: var(--space-1);
}

/* Tooltip 动画 */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translate(-50%, -100%) translateY(-4px);
}

/* 屏幕阅读器专用 */
.word-cloud__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 响应式 */
@media (max-width: 639.98px) {
  .word-cloud {
    border-radius: var(--radius-md-md);
  }

  .word-cloud__tooltip {
    padding: var(--space-1) var(--space-2);
  }

  .word-cloud__tooltip-text {
    font-size: var(--font-size-xs);
  }

  .word-cloud__tooltip-value {
    font-size: 10px;
  }
}
</style>
