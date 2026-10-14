<!--
QRCode 组件

功能：生成并显示二维码

属性：
- value: 二维码内容（必填）
- size: 二维码尺寸（像素），默认值：128
- level: 纠错级别，可选值：L, M, Q, H，默认值：M
- bgColor: 背景颜色，默认值：#ffffff
- fgColor: 前景颜色，默认值：#000000
- customClass: 自定义类名
- ariaLabel: 无障碍标签

方法：
- download(filename, format): 下载二维码为图片
-->

<template>
  <div :class="qrCodeClass" :aria-label="ariaLabel">
    <canvas
      ref="canvasRef"
      class="qrcode-canvas"
      :width="size"
      :height="size"
    />
    <div v-if="loading" class="qrcode-loading" :aria-label="loadingLabel">
      <span class="qrcode-loading-spinner" />
    </div>
    <div v-if="error" class="qrcode-error" :aria-label="errorLabel">
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useUiT } from '@ocpui/vue/composables/useUiT';

type QRCodeLevel = 'L' | 'M' | 'Q' | 'H';
type ExportFormat = 'png' | 'jpeg' | 'webp';

interface Props {
  value: string;
  size?: number;
  level?: QRCodeLevel;
  bgColor?: string;
  fgColor?: string;
  customClass?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  size: 128,
  level: 'M',
  bgColor: '#ffffff',
  fgColor: '#000000',
  customClass: '',
  ariaLabel: '',
});

const { uiT: t } = useUiT();

const ariaLabelResolved = computed(() => props.ariaLabel || t('components.utility.qrCode.ariaLabel', '二维码'));
const loadingLabel = computed(() => t('components.utility.qrCode.loading', '生成中'));
const errorLabel = computed(() => t('components.utility.qrCode.error', '错误'));

// i18n 错误文案集中管理
const errorMessages = computed(() => ({
  empty: t('components.utility.qrCode.empty', '请输入内容'),
  canvasContext: t('components.utility.qrCode.canvasContext', '无法获取画布上下文'),
  generateFailedPrefix: t('components.utility.qrCode.generateFailedPrefix', '生成失败: '),
}));

const canvasRef = ref<HTMLCanvasElement>();
const loading = ref(true);
const error = ref('');

const SMALL_SCREEN_BREAKPOINT = 768;
const SMALL_SCREEN_MAX_SIZE = 128;

const size = computed(() => {
  if (typeof window !== 'undefined' && window.innerWidth < SMALL_SCREEN_BREAKPOINT) {
    return Math.min(props.size, SMALL_SCREEN_MAX_SIZE);
  }
  return props.size;
});

const qrCodeClass = computed(() => {
  const classes = ['qrcode'];
  if (props.customClass) classes.push(props.customClass);
  return classes;
});

// QR 矩阵固定 21x21（版本 1，含 3 个定位符 + 定时图案 + 数据区）
// 这是一个"视觉占位"实现，仅用于 UI 展示；如需可扫描的真实 QR，请接入专业库。
const QR_MATRIX_SIZE = 21;
const FINDER_SIZE = 7;
const TIMING_ROW = 6;

const isFinderCell = (row: number, col: number): boolean =>
  (row < FINDER_SIZE && col < FINDER_SIZE)
  || (row < FINDER_SIZE && col >= QR_MATRIX_SIZE - FINDER_SIZE + 1)
  || (row >= QR_MATRIX_SIZE - FINDER_SIZE + 1 && col < FINDER_SIZE);

const isTimingCell = (row: number, col: number): boolean =>
  row === TIMING_ROW || col === TIMING_ROW;

const addFinderPattern = (matrix: boolean[][], row: number, col: number): void => {
  for (let r = 0; r < FINDER_SIZE; r++) {
    for (let c = 0; c < FINDER_SIZE; c++) {
      const isBorder = r === 0 || r === FINDER_SIZE - 1 || c === 0 || c === FINDER_SIZE - 1;
      const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      if (isBorder || isCenter) {
        matrix[row + r][col + c] = true;
      }
    }
  }
};

const addTimingPatterns = (matrix: boolean[][]): void => {
  for (let i = 8; i < QR_MATRIX_SIZE - 8; i++) {
    matrix[TIMING_ROW][i] = i % 2 === 0;
    matrix[i][TIMING_ROW] = i % 2 === 0;
  }
};

const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const fillData = (matrix: boolean[][], hash: number): void => {
  let seed = hash;
  for (let row = 0; row < QR_MATRIX_SIZE; row++) {
    for (let col = 0; col < QR_MATRIX_SIZE; col++) {
      const isReserved = isFinderCell(row, col) || isTimingCell(row, col);
      if (!isReserved) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        matrix[row][col] = (seed % 3) === 0;
      }
    }
  }
};

const generateQRMatrix = (data: string): boolean[][] => {
  const matrix: boolean[][] = Array.from(
    { length: QR_MATRIX_SIZE },
    () => Array(QR_MATRIX_SIZE).fill(false),
  );

  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, QR_MATRIX_SIZE - FINDER_SIZE, 0);
  addFinderPattern(matrix, 0, QR_MATRIX_SIZE - FINDER_SIZE);

  addTimingPatterns(matrix);

  fillData(matrix, simpleHash(data));

  return matrix;
};

const drawMatrix = (ctx: CanvasRenderingContext2D, side: number): void => {
  const qrData = generateQRMatrix(props.value);
  const moduleSize = side / QR_MATRIX_SIZE;

  ctx.fillStyle = props.fgColor;
  for (let row = 0; row < QR_MATRIX_SIZE; row++) {
    for (let col = 0; col < QR_MATRIX_SIZE; col++) {
      if (qrData[row][col]) {
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
      }
    }
  }
};

const generateQRCode = async (): Promise<void> => {
  if (!props.value) {
    error.value = errorMessages.value.empty;
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const side = size.value;
    canvas.width = side;
    canvas.height = side;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      error.value = errorMessages.value.canvasContext;
      loading.value = false;
      return;
    }

    ctx.fillStyle = props.bgColor;
    ctx.fillRect(0, 0, side, side);

    drawMatrix(ctx, side);

    loading.value = false;
  } catch (e) {
    error.value = errorMessages.value.generateFailedPrefix + (e instanceof Error ? e.message : String(e));
    loading.value = false;
  }
};

const download = (filename = 'qrcode.png', format: ExportFormat = 'png'): void => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const mimeType: Record<ExportFormat, string> = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
  };

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL(mimeType[format]);
  link.click();
};

watch(
  () => [props.value, props.size, props.level, props.bgColor, props.fgColor],
  () => {
    generateQRCode();
  },
);

onMounted(() => {
  generateQRCode();
});

defineExpose({
  download,
  canvas: canvasRef,
  generateQRCode,
});
</script>

<style scoped>
.qrcode {
  position: relative;
  display: inline-block;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.qrcode-canvas {
  display: block;
  border-radius: 8px;
  border: 1px solid hsl(var(--border));
}

.qrcode-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background) / 0.8);
  border-radius: 8px;
  backdrop-filter: blur(2px);
}

.qrcode-loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid hsl(var(--border));
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
  animation: qrcode-spin 0.8s linear infinite;
}

@keyframes qrcode-spin {
  to { transform: rotate(360deg); }
}

.qrcode-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background) / 0.8);
  border-radius: 8px;
  font-size: 14px;
  color: hsl(var(--error));
  text-align: center;
  padding: 16px;
  backdrop-filter: blur(2px);
}

@media (max-width: 768px) {
  .qrcode {
    transform: scale(0.9);
  }
}

@media (max-width: 480px) {
  .qrcode {
    transform: scale(0.8);
  }
}
</style>
