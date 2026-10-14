<template>
  <UiRoot :locale-code="localeCode" :theme-style="themeStyle" presentation-mode="summary">
    <div class="type-gallery">
      <header class="type-gallery__header">
        <h1>类型验收矩阵</h1>
        <div class="type-gallery__controls">
          <label>
            主题
            <select v-model="themeStyle">
              <option value="editorial">editorial</option>
              <option value="tech">tech</option>
            </select>
          </label>
          <label>
            色模式
            <select v-model="colorMode">
              <option value="light">light</option>
              <option value="dark">dark</option>
            </select>
          </label>
          <label>
            视口
            <select v-model="viewport">
              <option value="desktop">desktop</option>
              <option value="tablet">tablet</option>
              <option value="mobile">mobile</option>
            </select>
          </label>
        </div>
      </header>

      <div class="type-gallery__frame" :class="`type-gallery__frame--${viewport}`">
        <section class="type-gallery__section">
          <h2>T0 基元</h2>
          <div class="type-gallery__row">
            <Button variant="primary">主按钮</Button>
            <Button variant="secondary">次按钮</Button>
            <Chip label="标签" closable />
            <Tooltip content="跨主题 Tooltip 样式">
              <Button variant="secondary">Tooltip</Button>
            </Tooltip>
          </div>
        </section>

        <section class="type-gallery__section">
          <h2>导航</h2>
          <Tabs v-model="activeTab" type="line">
            <TabPane tab="概览" value="overview">概览内容</TabPane>
            <TabPane tab="明细" value="detail">明细内容</TabPane>
            <TabPane tab="归档" value="archive" disabled>归档</TabPane>
          </Tabs>
        </section>

        <section class="type-gallery__section">
          <h2>录入</h2>
          <div class="type-gallery__stack">
            <Input v-model="formName" placeholder="名称" />
            <DatePicker v-model="pickedDate" placeholder="选择日期" clearable />
            <Upload v-model="uploadFiles" tip="拖拽或点击上传" />
          </div>
        </section>

        <section class="type-gallery__section">
          <h2>反馈</h2>
          <div class="type-gallery__row">
            <Button variant="primary" @click="showModal = true">打开 Modal</Button>
            <Button variant="secondary" @click="showDrawer = true">打开 Drawer</Button>
            <Button variant="secondary" @click="showToast">触发 Toast</Button>
          </div>
          <Modal v-model="showModal" title="表单提交示例" size="md">
            <Input v-model="formName" placeholder="名称" />
            <template #footer>
              <div class="ocp-form-action-bar">
                <Button variant="secondary" @click="showModal = false">取消</Button>
                <Button variant="primary" @click="showModal = false">保存</Button>
              </div>
            </template>
          </Modal>
          <Drawer v-model="showDrawer" title="抽屉" placement="right">
            <p>移动端全宽抽屉。</p>
          </Drawer>
        </section>

        <section class="type-gallery__section">
          <h2>筛选组合</h2>
          <FilterTagGroup v-model="filterVal" label="状态" :options="filterOptions" block />
          <ActiveFilterTags :filters="activeFilters" show-label block @clear-all="activeFilters = []" />
        </section>

        <section class="type-gallery__section">
          <h2>数据展示</h2>
          <MetricCard title="指标" :value="1284" suffix="次" />
          <Table :columns="tableColumns" :data="tableData" size="md" hoverable />
          <Empty description="暂无数据" />
        </section>
      </div>
    </div>
  </UiRoot>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  UiRoot,
  Button,
  Chip,
  Modal,
  Drawer,
  Input,
  Tooltip,
  Tabs,
  TabPane,
  DatePicker,
  Upload,
  FilterTagGroup,
  ActiveFilterTags,
  MetricCard,
  Table,
  Empty,
  toast,
  useTheme,
  type ThemeStyleId,
  type ActiveFilter,
} from '@ocpui/vue';

const { setThemeStyle, setColorMode: applyColorMode } = useTheme();

const localeCode = 'zh';
const themeStyle = ref<ThemeStyleId>('editorial');
const colorMode = ref<'light' | 'dark'>('light');
const viewport = ref<'desktop' | 'tablet' | 'mobile'>('desktop');

const showModal = ref(false);
const showDrawer = ref(false);
const formName = ref('');
const activeTab = ref('overview');
const pickedDate = ref<Date | null>(null);
const uploadFiles = ref([]);
const filterVal = ref<string[]>(['active']);
const filterOptions = [
  { label: '活跃', value: 'active' },
  { label: '归档', value: 'archived' },
];
const activeFilters = ref<ActiveFilter[]>([{ key: 'status', label: '状态', value: 'active', valueLabel: '活跃' }]);

const tableColumns = [
  { key: 'name', title: '名称' },
  { key: 'status', title: '状态' },
  { key: 'updated', title: '更新' },
];
const tableData = [
  { name: '条目 A', status: '活跃', updated: '2026-09-01' },
  { name: '条目 B', status: '归档', updated: '2026-08-28' },
  { name: '条目 C', status: '活跃', updated: '2026-08-15' },
];

function showToast() {
  toast.success('操作成功');
}

watch(themeStyle, (v) => setThemeStyle(v));
watch(colorMode, (v) => applyColorMode(v));
</script>

<style scoped>
.type-gallery {
  padding: var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
}

.type-gallery__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.type-gallery__controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.type-gallery__controls label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
}

.type-gallery__frame {
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
  padding: var(--space-4-md);
  margin: 0 auto;
  transition: width var(--duration-medium) var(--ease-standard);
}

.type-gallery__frame--desktop {
  width: 100%;
}

.type-gallery__frame--tablet {
  width: 768px;
  max-width: 100%;
}

.type-gallery__frame--mobile {
  width: 375px;
  max-width: 100%;
}

.type-gallery__section {
  margin-bottom: var(--space-6);
}

.type-gallery__section h2 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-3);
}

.type-gallery__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}

.type-gallery__stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 420px;
}
</style>
