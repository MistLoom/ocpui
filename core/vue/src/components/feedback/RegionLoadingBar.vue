<!--
RegionLoadingBar 区域细线进度（非整页遮罩）

属性：
- value: 0–100；不传则为 indeterminate
- active: 是否显示
-->
<template>
  <div
    v-if="active"
    class="region-loading-bar"
    data-part="region-loading-bar"
    role="progressbar"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-valuenow="value == null ? undefined : Math.round(value)"
    :aria-busy="value == null ? true : undefined"
  >
    <div
      class="region-loading-bar__inner"
      :class="{ 'region-loading-bar__inner--indeterminate': value == null }"
      :style="value == null ? undefined : { width: `${Math.min(100, Math.max(0, value))}%` }"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    value?: number | null;
    active?: boolean;
  }>(),
  {
    value: null,
    active: true,
  },
);
</script>
