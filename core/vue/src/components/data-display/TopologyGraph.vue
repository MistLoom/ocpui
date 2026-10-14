<template>
  <div class="topology-graph" ref="containerRef">
    <svg
      class="topology-svg"
      :viewBox="viewBox"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel="handleWheel"
    >
      <defs>
        <!-- 箭头标记 -->
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="28"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--text-muted))" />
        </marker>
        <!-- 阴影滤镜 -->
        <filter id="node-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="hsl(0 0% 0% / 0.15)" />
        </filter>
      </defs>

      <!-- 连线 -->
      <g class="edges">
        <path
          v-for="edge in edges"
          :key="edge.id"
          class="edge-path"
          :d="getEdgePath(edge)"
          :stroke-width="getEdgeWidth(edge)"
          :class="{ 'edge-highlighted': highlightedEdge === edge.id }"
          marker-end="url(#arrowhead)"
          @mouseenter="highlightedEdge = edge.id"
          @mouseleave="highlightedEdge = null"
        />
      </g>

      <!-- 节点 -->
      <g class="nodes">
        <g
          v-for="node in nodes"
          :key="node.id"
          class="node-group"
          :transform="`translate(${node.x}, ${node.y})`"
          :class="{ 'node-selected': selectedNode === node.id }"
          @click="handleNodeClick(node)"
          @mouseenter="handleNodeHover(node)"
          @mouseleave="handleNodeLeave"
        >
          <!-- 节点外圈（健康状态） -->
          <circle
            class="node-outer-ring"
            :r="nodeRadius + 4"
            :fill="getNodeStatusColor(node.status)"
            opacity="0.3"
          />
          <!-- 节点主体 -->
          <circle
            class="node-circle"
            :r="nodeRadius"
            :fill="getNodeFill(node)"
            :stroke="getNodeStroke(node)"
            stroke-width="2"
            filter="url(#node-shadow)"
          />
          <!-- 节点图标 -->
          <text
            class="node-icon"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="16"
          >
            {{ getNodeIcon(node.type) }}
          </text>
          <!-- 节点标签 -->
          <text
            class="node-label"
            :y="nodeRadius + 20"
            text-anchor="middle"
            font-size="12"
          >
            {{ node.label }}
          </text>
        </g>
      </g>
    </svg>

    <!-- 画布控制 -->
    <div class="topology-controls">
      <button class="control-btn" @click="zoomIn" :title="t('components.dataDisplay.topologyGraph.zoomIn')">
        <Icon name="plus" :size="16" />
      </button>
      <button class="control-btn" @click="zoomOut" :title="t('components.dataDisplay.topologyGraph.zoomOut')">
        <Icon name="minus" :size="16" />
      </button>
      <button class="control-btn" @click="fitToScreen" :title="t('components.dataDisplay.topologyGraph.fitToScreen')">
        <Icon name="maximize" :size="16" />
      </button>
      <button class="control-btn" @click="resetView" :title="t('components.dataDisplay.topologyGraph.reset')">
        <Icon name="rotate-ccw" :size="16" />
      </button>
    </div>

    <!-- 图例 -->
    <div class="topology-legend">
      <div class="legend-section">
        <span class="legend-title">{{ t('components.dataDisplay.topologyGraph.nodeStatus') }}</span>
        <div class="legend-item">
          <span class="legend-dot" style="background: hsl(var(--success))"></span>
          <span>{{ t('components.dataDisplay.topologyGraph.healthy') }}</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: hsl(var(--warning))"></span>
          <span>{{ t('components.dataDisplay.topologyGraph.warning') }}</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: hsl(var(--error))"></span>
          <span>{{ t('components.dataDisplay.topologyGraph.error') }}</span>
        </div>
      </div>
      <div class="legend-section">
        <span class="legend-title">{{ t('components.dataDisplay.topologyGraph.callLatency') }}</span>
        <div class="legend-item">
          <span class="legend-line thin"></span>
          <span>&lt; 50ms</span>
        </div>
        <div class="legend-item">
          <span class="legend-line medium"></span>
          <span>50-200ms</span>
        </div>
        <div class="legend-item">
          <span class="legend-line thick"></span>
          <span>&gt; 200ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Icon } from '../utility';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import type { NodeStatus, NodeType, TopologyNode, TopologyEdge } from './TopologyGraph.types';

const { uiT: t } = useUiT();

interface Props {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  width?: number;
  height?: number;
  nodeRadius?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 600,
  nodeRadius: 24
});

const emit = defineEmits<{
  nodeClick: [node: TopologyNode];
  nodeHover: [node: TopologyNode];
}>();

const containerRef = ref<HTMLElement>();
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const selectedNode = ref<string | null>(null);
const highlightedEdge = ref<string | null>(null);

const viewBox = computed(() => {
  const w = props.width / scale.value;
  const h = props.height / scale.value;
  const x = -translateX.value / scale.value;
  const y = -translateY.value / scale.value;
  return `${x} ${y} ${w} ${h}`;
});

const getNodeStatusColor = (status: NodeStatus): string => {
  const colors: Record<NodeStatus, string> = {
    healthy: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
    error: 'hsl(var(--error))'
  };
  return colors[status];
};

const getNodeFill = (node: TopologyNode): string => {
  if (node.type === 'gateway') return 'hsl(var(--primary))';
  if (node.type === 'database') return 'hsl(var(--info))';
  if (node.type === 'cache') return 'hsl(var(--warning))';
  return 'hsl(var(--surface))';
};

const getNodeStroke = (node: TopologyNode): string => {
  return getNodeStatusColor(node.status);
};

const getNodeIcon = (type: NodeType): string => {
  const icons: Record<NodeType, string> = {
    gateway: '🔀',
    service: '⚙️',
    database: '🗄️',
    cache: '⚡'
  };
  return icons[type];
};

const getEdgePath = (edge: TopologyEdge): string => {
  const source = props.nodes.find(n => n.id === edge.source);
  const target = props.nodes.find(n => n.id === edge.target);
  if (!source || !target) return '';

  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dr = Math.sqrt(dx * dx + dy * dy) * 0.3;

  return `M${source.x},${source.y}A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
};

const getEdgeWidth = (edge: TopologyEdge): number => {
  if (edge.latency < 50) return 1;
  if (edge.latency < 200) return 3;
  return 5;
};

const handleNodeClick = (node: TopologyNode) => {
  selectedNode.value = node.id;
  emit('nodeClick', node);
};

const handleNodeHover = (node: TopologyNode) => {
  emit('nodeHover', node);
};

const handleNodeLeave = () => {
  // 可选：取消hover状态
};

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true;
  dragStart.value = { x: e.clientX - translateX.value, y: e.clientY - translateY.value };
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  translateX.value = e.clientX - dragStart.value.x;
  translateY.value = e.clientY - dragStart.value.y;
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  scale.value = Math.max(0.5, Math.min(3, scale.value * delta));
};

const zoomIn = () => {
  scale.value = Math.min(3, scale.value * 1.2);
};

const zoomOut = () => {
  scale.value = Math.max(0.5, scale.value / 1.2);
};

const fitToScreen = () => {
  if (!containerRef.value || props.nodes.length === 0) return;

  const xs = props.nodes.map(n => n.x);
  const ys = props.nodes.map(n => n.y);
  const minX = Math.min(...xs) - props.nodeRadius * 2;
  const maxX = Math.max(...xs) + props.nodeRadius * 2;
  const minY = Math.min(...ys) - props.nodeRadius * 2;
  const maxY = Math.max(...ys) + props.nodeRadius * 2;

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const containerWidth = containerRef.value.clientWidth;
  const containerHeight = containerRef.value.clientHeight;

  const scaleX = containerWidth / contentWidth;
  const scaleY = containerHeight / contentHeight;
  scale.value = Math.min(scaleX, scaleY, 1) * 0.9;

  translateX.value = (containerWidth - contentWidth * scale.value) / 2 - minX * scale.value;
  translateY.value = (containerHeight - contentHeight * scale.value) / 2 - minY * scale.value;
};

const resetView = () => {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
};

onMounted(() => {
  fitToScreen();
});

defineExpose({
  zoomIn,
  zoomOut,
  fitToScreen,
  resetView
});
</script>

<script lang="ts">
export default { name: 'TopologyGraph' };
</script>

<style scoped>
.topology-graph {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  background: hsl(var(--surface-container-high));
  border-radius: 12px;
  overflow: hidden;
}

.topology-svg {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.topology-svg:active {
  cursor: grabbing;
}

.edge-path {
  fill: none;
  stroke: hsl(var(--border));
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.edge-path:hover,
.edge-highlighted {
  stroke: hsl(var(--primary));
}

.node-group {
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.node-group:hover {
  filter: brightness(1.1);
}

.node-group:hover .node-circle {
  filter: drop-shadow(0 4px 8px hsl(0 0% 0% / 0.12));
}

.node-selected .node-circle {
  stroke-width: 3;
  stroke: hsl(var(--primary));
}

.node-circle {
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.node-label {
  fill: hsl(var(--text));
  font-weight: 500;
  pointer-events: none;
}

.node-icon {
  pointer-events: none;
}

.topology-controls {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px;
  background: hsl(var(--surface));
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  color: hsl(var(--text-secondary));
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.control-btn:hover {
  background: hsl(var(--surface-container-high));
  border-color: hsl(var(--border-hover));
  color: hsl(var(--text));
}

.topology-legend {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: hsl(var(--surface));
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  font-size: 12px;
}

.legend-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-title {
  font-weight: 600;
  color: hsl(var(--text));
  margin-bottom: 2px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: hsl(var(--text-secondary));
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-line {
  width: 20px;
  height: 0;
  border-top: 2px solid hsl(var(--text-muted));
}

.legend-line.thin {
  border-top-width: 1px;
}

.legend-line.medium {
  border-top-width: 3px;
}

.legend-line.thick {
  border-top-width: 5px;
}
</style>
