<template>
  <UiRoot locale-code="zh" theme-style="editorial" presentation-mode="summary">
    <div class="combo-patterns">
      <header class="combo-patterns__header">
        <h1>组合模式验收</h1>
        <p>7 种 combination-patterns.css class 的可视对照</p>
      </header>

      <section class="combo-patterns__section">
        <h2>ocp-filter-row</h2>
        <div class="ocp-filter-row ocp-filter-row--labeled">
          <span class="ocp-filter-row__label">状态</span>
          <div class="ocp-filter-row__controls">
            <FilterTagGroup v-model="filterVal" size="sm" :options="filterOptions" />
            <ActiveFilterTags
              v-if="activeFilters.length"
              size="sm"
              :filters="activeFilters"
              @remove="removeFilter"
              @clear-all="activeFilters = []"
            />
          </div>
        </div>
      </section>

      <section class="combo-patterns__section">
        <h2>ocp-form-action-bar</h2>
        <div class="combo-patterns__demo-surface">
          <div class="ocp-form-action-bar">
            <Button variant="secondary">取消</Button>
            <Button variant="primary">保存</Button>
          </div>
        </div>
      </section>

      <section class="combo-patterns__section">
        <h2>ocp-list-page-stack + ocp-list-selection-bar</h2>
        <div class="ocp-list-page-stack">
          <SelectionToolbar
            :visible="selected"
            :count="1"
            :actions="[{ key: 'act', label: '批量操作' }]"
            position="bottom"
            @clear="selected = false"
          />
          <Table :columns="tableColumns" :data="tableData" size="sm" hoverable />
        </div>
      </section>

      <section class="combo-patterns__section">
        <h2>ocp-detail-panel + rail-left</h2>
        <div class="ocp-detail-panel ocp-detail-panel--rail-left">
          <aside class="ocp-detail-panel__aside">
            <Card title="列表轨">条目 A、条目 B</Card>
          </aside>
          <div class="ocp-detail-panel__main">
            <Descriptions :items="detailItems" bordered />
          </div>
        </div>
      </section>

      <section class="combo-patterns__section">
        <h2>ocp-detail-panel</h2>
        <div class="ocp-detail-panel">
          <div class="ocp-detail-panel__main">
            <Descriptions :items="detailItems" bordered />
          </div>
          <aside class="ocp-detail-panel__aside">
            <Card title="关联操作">
              <Button block variant="secondary">查看历史</Button>
            </Card>
          </aside>
        </div>
      </section>

      <section class="combo-patterns__section">
        <h2>ocp-chart-dashboard</h2>
        <div class="ocp-chart-dashboard">
          <MetricCard title="访问量" :value="1284" suffix="次" />
          <MetricCard title="转化率" :value="12.4" suffix="%" />
          <MetricCard title="待处理" :value="7" suffix="项" />
        </div>
      </section>

      <section class="combo-patterns__section">
        <h2>ocp-progressive-wizard</h2>
        <div class="ocp-progressive-wizard">
          <Steps :current="wizardStep" :steps="wizardSteps" />
          <div class="ocp-progressive-wizard__body">
            <Input v-model="wizardName" :placeholder="`步骤 ${wizardStep + 1} 输入`" />
          </div>
          <div class="ocp-form-action-bar">
            <Button variant="secondary" :disabled="wizardStep === 0" @click="wizardStep -= 1">上一步</Button>
            <Button @click="wizardStep = Math.min(2, wizardStep + 1)">下一步</Button>
          </div>
        </div>
      </section>
    </div>
  </UiRoot>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  UiRoot,
  Button,
  FilterTagGroup,
  ActiveFilterTags,
  SelectionToolbar,
  Table,
  Descriptions,
  Card,
  MetricCard,
  Steps,
  Input,
  type ActiveFilter,
} from '@ocpui/vue';

const filterVal = ref<string[]>(['pending']);
const filterOptions = [
  { label: '待审', value: 'pending' },
  { label: '已通过', value: 'approved' },
];
const activeFilters = ref<ActiveFilter[]>([
  { key: 'status', label: '待审', value: 'pending', valueLabel: '待审' },
]);

function removeFilter(filter: ActiveFilter) {
  activeFilters.value = activeFilters.value.filter((f) => f.key !== filter.key);
}

const selected = ref(true);

const tableColumns = [
  { key: 'name', title: '名称' },
  { key: 'status', title: '状态' },
];
const tableData = [
  { name: '条目 A', status: '待审' },
  { name: '条目 B', status: '已通过' },
];

const detailItems = [
  { label: 'ID', value: 'evt-001' },
  { label: '负责人', value: '张三' },
  { label: '更新时间', value: '2026-09-07' },
];

const wizardStep = ref(0);
const wizardSteps = [{ title: '填写' }, { title: '校验' }, { title: '确认' }];
const wizardName = ref('');
</script>

<style scoped>
.combo-patterns {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.combo-patterns__header h1 {
  margin: 0 0 var(--space-2);
}

.combo-patterns__header p {
  margin: 0;
  color: hsl(var(--muted-foreground));
}

.combo-patterns__section h2 {
  margin: 0 0 var(--space-4);
  font-size: 1rem;
}

.combo-patterns__demo-surface {
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
  overflow: hidden;
}
</style>
