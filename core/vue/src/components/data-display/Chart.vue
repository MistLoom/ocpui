&lt;!--
图表组件

Props:
- type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea' - 图表类型
- data: ChartData - 图表数据
- options?: ChartOptions - 图表配置选项
- width?: number - 图表宽度
- height?: number - 图表高度
- className?: string - 自定义类名

Events:
- chart-click: (event: MouseEvent, elements: any[]) - 图表点击事件
- chart-hover: (event: MouseEvent, elements: any[]) - 图表悬停事件

Usage:
&lt;Chart
  type="bar"
  :data="{
    labels: ['一月', '二月', '三月', '四月', '五月'],
    datasets: [{
      label: '销售额',
      data: [1200, 1900, 1500, 2100, 1800],
      backgroundColor: 'hsl(var(--primary))',
      borderColor: 'hsl(var(--primary))',
      borderWidth: 1
    }]
  }"
  :options="{
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    }
  }"
  :height="300"
  @chart-click="handleChartClick"
/&gt;

ChartData 接口:
- labels: string[] - 标签数组
- datasets: Array&lt;{
  label: string - 数据集标签
  data: number[] - 数据数组
  backgroundColor?: string | string[] - 背景颜色
  borderColor?: string | string[] - 边框颜色
  borderWidth?: number - 边框宽度
  fill?: boolean - 是否填充
  tension?: number - 线条张力
}&gt;

ChartOptions 接口:
- responsive?: boolean - 是否响应式
- maintainAspectRatio?: boolean - 是否保持宽高比
- plugins?: {
  legend?: {
    display?: boolean - 是否显示图例
    position?: string - 图例位置
  }
  tooltip?: {
    enabled?: boolean - 是否启用 tooltip
  }
}
- scales?: {
  x?: {
    display?: boolean - 是否显示 x 轴
    title?: {
      display?: boolean - 是否显示 x 轴标题
      text?: string - x 轴标题文本
    }
  }
  y?: {
    display?: boolean - 是否显示 y 轴
    title?: {
      display?: boolean - 是否显示 y 轴标题
      text?: string - y 轴标题文本
    }
  }
}
--&gt;
<template>
  <div class="chart-container" :class="className" :style="containerStyle">
    <canvas ref="chartRef" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }>;
}

interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: string;
    };
    tooltip?: {
      enabled?: boolean;
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    y?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
  };
}

const props = defineProps<{
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  data: ChartData;
  options?: ChartOptions;
  width?: number;
  height?: number;
  className?: string;
}>();

const emit = defineEmits<{
  (e: 'chart-click', event: MouseEvent, elements: any[]): void;
  (e: 'chart-hover', event: MouseEvent, elements: any[]): void;
}>();

const chartRef = ref<HTMLCanvasElement | null>(null);

const containerStyle = ref<{
  width: string;
  height: string;
  position: 'relative' | 'absolute' | 'fixed' | 'static' | 'sticky';
}>({
  width: props.width ? `${props.width}px` : '100%',
  height: props.height ? `${props.height}px` : '300px',
  position: 'relative'
});

// 模拟Chart.js的功能
const createChart = () => {
  if (!chartRef.value) return;
  
  const canvas = chartRef.value;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return;
  
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制简单的图表
  const { type, data } = props;
  
  switch (type) {
    case 'bar':
      drawBarChart(ctx, data);
      break;
    case 'line':
      drawLineChart(ctx, data);
      break;
    case 'pie':
    case 'doughnut':
      drawPieChart(ctx, data);
      break;
    default:
      drawBarChart(ctx, data);
  }
};

const drawBarChart = (ctx: CanvasRenderingContext2D, data: ChartData) => {
  const { labels, datasets } = data;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  // 绘制背景
  ctx.fillStyle = 'hsl(var(--surface))';
  ctx.fillRect(0, 0, width, height);
  
  // 绘制网格
  ctx.strokeStyle = 'hsl(var(--border))';
  ctx.lineWidth = 1;
  
  for (let i = 0; i <= 5; i++) {
    const y = height - (i * height / 5);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // 绘制柱子
  const barWidth = (width - 100) / labels.length;
  const colors = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--error))', 'hsl(var(--info))'];
  
  datasets.forEach((dataset, datasetIndex) => {
    dataset.data.forEach((value, index) => {
      const x = 50 + (index * barWidth) + (datasetIndex * barWidth / datasets.length);
      const barHeight = (value / Math.max(...dataset.data)) * (height - 50);
      const y = height - barHeight - 25;
      
      ctx.fillStyle = (Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[0] : dataset.backgroundColor) || colors[datasetIndex % colors.length];
      ctx.fillRect(x, y, barWidth / datasets.length - 5, barHeight);
    });
  });
  
  // 绘制标签
  ctx.fillStyle = 'hsl(var(--text-secondary))';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  
  labels.forEach((label, index) => {
    const x = 50 + (index * barWidth) + (barWidth / 2);
    ctx.fillText(label, x, height - 5);
  });
};

const drawLineChart = (ctx: CanvasRenderingContext2D, data: ChartData) => {
  const { labels, datasets } = data;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  // 绘制背景
  ctx.fillStyle = 'hsl(var(--surface))';
  ctx.fillRect(0, 0, width, height);
  
  // 绘制网格
  ctx.strokeStyle = 'hsl(var(--border))';
  ctx.lineWidth = 1;
  
  for (let i = 0; i <= 5; i++) {
    const y = height - (i * height / 5);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // 绘制线条
  const colors = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--error))', 'hsl(var(--info))'];
  
  datasets.forEach((dataset, datasetIndex) => {
    const points = dataset.data.map((value, index) => {
      const x = 50 + (index * (width - 100) / (labels.length - 1));
      const y = height - (value / Math.max(...dataset.data)) * (height - 50) - 25;
      return { x, y };
    });
    
    // 绘制线条
    ctx.strokeStyle = (Array.isArray(dataset.borderColor) ? dataset.borderColor[0] : dataset.borderColor) || colors[datasetIndex % colors.length];
    ctx.lineWidth = dataset.borderWidth || 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    
    // 绘制点
    ctx.fillStyle = (Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[0] : dataset.backgroundColor) || colors[datasetIndex % colors.length];
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  });
  
  // 绘制标签
  ctx.fillStyle = 'hsl(var(--text-secondary))';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  
  labels.forEach((label, index) => {
    const x = 50 + (index * (width - 100) / (labels.length - 1));
    ctx.fillText(label, x, height - 5);
  });
};

const drawPieChart = (ctx: CanvasRenderingContext2D, data: ChartData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 20;
  
  // 绘制背景
  ctx.fillStyle = 'hsl(var(--surface))';
  ctx.fillRect(0, 0, width, height);
  
  // 计算数据总和
  const dataset = data.datasets[0];
  const total = dataset.data.reduce((sum, value) => sum + value, 0);
  
  // 绘制饼图
  const colors = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--error))', 'hsl(var(--info))'];
  let startAngle = 0;
  
  dataset.data.forEach((value, index) => {
    const sliceAngle = (value / total) * Math.PI * 2;
    
    // 绘制扇形
    ctx.fillStyle = (Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[index % dataset.backgroundColor.length] : dataset.backgroundColor) || colors[index % colors.length];
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();
    
    // 绘制边框
    ctx.strokeStyle = 'hsl(var(--surface))';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    startAngle += sliceAngle;
  });
  
  // 绘制标签
  ctx.fillStyle = 'hsl(var(--text-secondary))';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  
  data.labels.forEach((label, index) => {
    const x = 20;
    const y = 30 + (index * 20);
    
    // 绘制颜色方块
    ctx.fillStyle = (Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[index % dataset.backgroundColor.length] : dataset.backgroundColor) || colors[index % colors.length];
    ctx.fillRect(x, y - 8, 12, 12);
    
    // 绘制标签文本
    ctx.fillStyle = 'hsl(var(--text-secondary))';
    ctx.fillText(`${label}: ${dataset.data[index]}`, x + 20, y);
  });
};

const handleClick = (event: MouseEvent) => {
  emit('chart-click', event, []);
};

const handleMouseMove = (event: MouseEvent) => {
  emit('chart-hover', event, []);
};

onMounted(() => {
  createChart();
  
  // 添加事件监听器
  if (chartRef.value) {
    chartRef.value.addEventListener('click', handleClick);
    chartRef.value.addEventListener('mousemove', handleMouseMove);
  }
});

onUnmounted(() => {
  // 移除事件监听器
  if (chartRef.value) {
    chartRef.value.removeEventListener('click', handleClick);
    chartRef.value.removeEventListener('mousemove', handleMouseMove);
  }
});

watch(() => props.data, () => {
  createChart();
}, { deep: true });

watch(() => props.type, () => {
  createChart();
});

watch(() => props.options, () => {
  createChart();
}, { deep: true });

watch(() => [props.width, props.height], () => {
  containerStyle.value = {
    width: props.width ? `${props.width}px` : '100%',
    height: props.height ? `${props.height}px` : '300px',
    position: 'relative'
  };
  createChart();
});
</script>

<style scoped>
.chart-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 2px 8px hsl(var(--shadow) / 0.08);
  background: hsl(var(--surface));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>