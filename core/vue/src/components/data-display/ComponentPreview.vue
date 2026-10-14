<template>
  <div class="component-preview-container">
    <div class="preview-header">
      <h3 class="preview-title">{{ title }}</h3>
      <p class="preview-description">{{ description }}</p>
    </div>
    <div class="preview-content">
      <slot></slot>
    </div>
    <div v-if="showControls" class="preview-controls">
      <slot name="controls"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  showControls: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.component-preview-container {
  background: hsl(var(--background));
  border-radius: 12px;
  border: 1px solid hsl(var(--border));
  padding: 24px;
  width: 100%;
}

.preview-header {
  margin-bottom: 24px;
}

.preview-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: hsl(var(--text));
}

.preview-description {
  font-size: 0.875rem;
  opacity: 0.7;
  margin-bottom: 0;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 120px;
}

.preview-controls {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid hsl(var(--border));
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 预览布局辅助类 */
:deep(.preview-row) {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

:deep(.preview-col) {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

:deep(.preview-label) {
  font-size: 0.75rem;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
  margin-bottom: 8px;
}

:deep(.preview-grid-2) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
}

:deep(.preview-grid-3) {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
}

:deep(.preview-grid-4) {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .component-preview-container {
    padding: 16px;
  }
  
  .preview-header {
    margin-bottom: 16px;
  }
  
  .preview-content {
    min-height: 100px;
  }
  
  .preview-controls {
    margin-top: 16px;
    padding-top: 12px;
  }
  
  :deep(.preview-row) {
    gap: 12px;
  }
  
  :deep(.preview-col) {
    gap: 12px;
  }
  
  :deep(.preview-grid-2),
  :deep(.preview-grid-3),
  :deep(.preview-grid-4) {
    grid-template-columns: 1fr;
  }
}
</style>