<template>
  <section class="ocp-admin-panel" :class="customClass">
    <header v-if="hasHead" class="ocp-admin-panel-head">
      <div class="ocp-admin-panel-head-copy">
        <h3 v-if="title" class="ocp-admin-panel-title">{{ title }}</h3>
        <p v-if="subtitle" class="ocp-admin-panel-sub">{{ subtitle }}</p>
        <slot name="head" />
      </div>
      <div v-if="$slots.extra || linkLabel" class="ocp-admin-panel-actions">
        <slot name="extra">
          <button
            v-if="linkLabel"
            type="button"
            class="ocp-admin-panel-link"
            @click="emit('link')"
          >
            {{ linkLabel }}
          </button>
        </slot>
      </div>
    </header>
    <div class="ocp-admin-panel-body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="ocp-admin-panel-foot">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

interface Props {
  title?: string;
  subtitle?: string;
  linkLabel?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  linkLabel: '',
  customClass: '',
});

const emit = defineEmits<{ link: [] }>();
const slots = useSlots();

const hasHead = computed(
  () => Boolean(props.title || props.subtitle || slots.head || slots.extra || props.linkLabel),
);
</script>

<script lang="ts">
export default { name: 'DashboardPanel' };
</script>

<style scoped>
.ocp-admin-panel-foot {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
</style>
