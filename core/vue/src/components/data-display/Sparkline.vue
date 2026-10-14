<!--
Sparkline 静态微型折线（非交互，适用于卡片内趋势预览）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| values | number[] | — | 数值序列（至少 2 个点） |
| color | string | hsl(var(--primary)) | 线条与端点颜色 |
| width | number | 160 | SVG 宽度 |
| height | number | 30 | SVG 高度 |
| strokeWidth | number | 1.5 | 线宽 |
| padding | number | 2 | 上下内边距 |
| showArea | boolean | true | 是否填充区域 |
| showEndDot | boolean | true | 是否显示末点 |
| ariaLabel | string | '' | 无障碍标签 |
-->
<template>
  <svg
    class="ocp-sparkline"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    fill="none"
    role="img"
    :aria-label="ariaLabel || undefined"
  >
    <polygon
      v-if="showArea && areaPoints"
      :points="areaPoints"
      :fill="color"
      opacity="0.1"
    />
    <polyline
      v-if="linePoints"
      :points="linePoints"
      :stroke="color"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle
      v-if="showEndDot && lastPoint"
      :cx="lastPoint.x"
      :cy="lastPoint.y"
      :r="endDotRadius"
      :fill="color"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    values: number[]
    color?: string
    width?: number
    height?: number
    strokeWidth?: number
    padding?: number
    showArea?: boolean
    showEndDot?: boolean
    endDotRadius?: number
    ariaLabel?: string
  }>(),
  {
    color: 'hsl(var(--primary))',
    width: 160,
    height: 30,
    strokeWidth: 1.5,
    padding: 2,
    showArea: true,
    showEndDot: true,
    endDotRadius: 2.5,
    ariaLabel: '',
  },
)

const normalized = computed(() => {
  const raw = props.values.filter((n) => Number.isFinite(n))
  if (raw.length < 2) return null
  const min = Math.min(...raw)
  const max = Math.max(...raw)
  const range = max - min || 1
  const pad = props.padding
  const innerH = props.height - pad * 2
  const innerW = props.width
  return raw.map((value, index) => {
    const x = (index / (raw.length - 1)) * innerW
    const y = props.height - pad - ((value - min) / range) * innerH
    return { x, y }
  })
})

const linePoints = computed(() =>
  normalized.value?.map((p) => `${p.x},${p.y}`).join(' ') ?? '',
)

const areaPoints = computed(() => {
  if (!normalized.value?.length) return ''
  const pts = normalized.value.map((p) => `${p.x},${p.y}`).join(' ')
  return `${pts} ${props.width},${props.height} 0,${props.height}`
})

const lastPoint = computed(() => {
  const pts = normalized.value
  if (!pts?.length) return null
  return pts[pts.length - 1]
})
</script>

<style scoped>
.ocp-sparkline {
  display: block;
  max-width: 100%;
}
</style>
