<!--
TabPane 组件

功能：标签页内容面板，配合 Tabs 组件使用

公开属性：
- tab: string - 标签页标题
- value: string - 标签页唯一标识
- disabled: boolean - 是否禁用

事件：
- 无

使用方式：
<template>
  <Tabs v-model:value="activeTab">
    <TabPane tab="标签1" value="1">
      内容1
    </TabPane>
    <TabPane tab="标签2" value="2">
      内容2
    </TabPane>
  </Tabs>
</template>

<script setup>
import { ref } from 'vue';
import Tabs from './Tabs.vue';
import TabPane from './TabPane.vue';

const activeTab = ref('1');
</script>
-->
<template>
  <div 
    v-show="isActive" 
    class="tab-pane"
    :id="`tabpanel-${key}`"
    role="tabpanel"
    :aria-hidden="!isActive"
    :aria-labelledby="`tab-${key}`"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, Ref, ref } from 'vue';
import { TABS_ACTIVE_KEY, TABS_REGISTRATION_KEY } from '@ocpui/vue/types';
import { useComponentId } from '../../composables/useComponentId';

interface Props {
  tab?: string;
  value?: string;
  disabled?: boolean;
  label?: string;
  name?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tab: '',
  value: '',
  disabled: false,
  label: '',
  name: ''
});

const activeKey = inject<Ref<string>>(TABS_ACTIVE_KEY, ref(''));
const tabsApi = inject<{
  register: (key: string, label: string, disabled?: boolean) => void;
  unregister: (key: string) => void;
}>(TABS_REGISTRATION_KEY, { register: () => {}, unregister: () => {} });

// 未显式提供 key 时用稳定 id 兜底（原 tab-Date.now() 在 computed 内每次求值都变，注册不稳定）
const fallbackKey = useComponentId('tab');
const key = computed(() => props.value || props.name || props.tab || fallbackKey);
const label = computed(() => props.tab || props.label || props.value || props.name);

const isActive = computed(() => {
  return activeKey.value === key.value;
});

onMounted(() => {
  if (key.value) {
    tabsApi?.register(key.value, label.value, props.disabled);
  }
});

onUnmounted(() => {
  if (key.value) {
    tabsApi?.unregister(key.value);
  }
});
</script>

<style scoped>
.tab-pane {
  width: 100%;
  padding: 16px;
}
</style>
