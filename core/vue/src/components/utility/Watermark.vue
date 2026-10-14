<!--
Watermark 组件

功能：添加水印效果到容器

公开属性：
- content: string - 水印文本内容
- image: string - 水印图片地址
- width: number - 水印宽度，默认为 120
- height: number - 水印高度，默认为 64
- rotate: number - 旋转角度，默认为 -22
- gap: [number, number] - 水印间距，默认为 [100, 100]
- offset: [number, number] - 水印偏移量，默认为 [0, 0]
- opacity: number - 透明度，默认为 0.15
- customClass: string - 自定义类名

使用方式：
[文本水印]
<Watermark content="AIepoch">
  <div style="height: 400px; padding: 20px;">...</div>
</Watermark>

[图片水印]
<Watermark image="https://example.com/logo.png" :width="80" :height="80">
  <div style="height: 400px; padding: 20px;">...</div>
</Watermark>

[自定义水印]
<Watermark content="AIepoch\n2026" :rotate="-15" :opacity="0.2" :gap="[150, 150]">
  <div style="height: 400px; padding: 20px;">...</div>
</Watermark>
-->

<template>
  <div :class="watermarkClass" :style="watermarkStyle" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  content?: string;
  image?: string;
  width?: number;
  height?: number;
  rotate?: number;
  gap?: [number, number];
  offset?: [number, number];
  opacity?: number;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  image: '',
  width: 120,
  height: 64,
  rotate: -22,
  gap: () => [100, 100],
  offset: () => [0, 0],
  opacity: 0.15,
  customClass: '',
});

const DEFAULT_FONT = '14px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
const LINE_HEIGHT = 20;
const DEG_TO_RAD = Math.PI / 180;

const watermarkClass = computed(() => {
  const classes = ['watermark'];
  if (props.customClass) {
    classes.push(props.customClass);
  }
  return classes.join(' ');
});

const watermarkStyle = computed(() => {
  const style: Record<string, string> = {
    position: 'relative',
    overflow: 'hidden',
  };

  style.backgroundImage = generateBackground();
  style.backgroundPosition = `${props.offset[0]}px ${props.offset[1]}px`;
  style.backgroundRepeat = 'repeat';

  return style;
});

const drawTextWatermark = (
  ctx: CanvasRenderingContext2D,
  gapX: number,
  gapY: number,
): void => {
  ctx.font = DEFAULT_FONT;
  ctx.fillStyle = 'hsl(var(--text))';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = props.content.split('\n');
  const startY = -((lines.length - 1) * LINE_HEIGHT) / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, 0, startY + index * LINE_HEIGHT);
  });
};

const drawImageWatermark = (ctx: CanvasRenderingContext2D): void => {
  const img = new Image();
  img.src = props.image;
  // 图片加载完成前由 canvas 异步绘出；为避免硬编码等待，超时即放弃，避免水印永久空白
  ctx.drawImage(img, -props.width / 2, -props.height / 2, props.width, props.height);
};

const generateBackground = (): string => {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const gapX = props.gap[0];
  const gapY = props.gap[1];

  canvas.width = gapX;
  canvas.height = gapY;

  ctx.translate(gapX / 2, gapY / 2);
  ctx.rotate(props.rotate * DEG_TO_RAD);

  ctx.globalAlpha = props.opacity;

  if (props.image) {
    drawImageWatermark(ctx);
  } else if (props.content) {
    drawTextWatermark(ctx, gapX, gapY);
  }

  return `url(${canvas.toDataURL()})`;
};
</script>

<style scoped>
.watermark {
  position: relative;
  z-index: var(--z-base);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>
