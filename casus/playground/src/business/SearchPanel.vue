<template>
  <UiScenarioScope surface="detail" presentation-mode="scan">
    <div class="search-panel">
      <div class="search-panel__input">
        <Input
          ref="inputRef"
          v-model="query"
          size="md"
          clearable
          placeholder="搜索条目、纪元、人物…"
          @keydown.enter="submitSearch"
        >
          <template #prefix>
            <Icon name="search" size="sm" />
          </template>
        </Input>
      </div>

      <section class="search-panel__filters">
        <FilterTagGroup
          v-model="category"
          :options="categoryOptions"
          size="sm"
        />
      </section>

      <template v-if="!query.trim()">
        <section class="search-panel__section">
          <h3 class="search-panel__heading">最近搜索</h3>
          <div class="search-panel__chips">
            <Chip
              v-for="term in recentTerms"
              :key="term"
              size="sm"
              clickable
              @click="query = term"
            >
              {{ term }}
            </Chip>
          </div>
        </section>

        <section class="search-panel__section">
          <h3 class="search-panel__heading">浏览分类</h3>
          <List bordered size="small">
            <ListItem
              v-for="cat in browseCategories"
              :key="cat.key"
              :title="cat.label"
              :description="cat.hint"
              :extra="String(cat.count)"
              clickable
              @click="category = cat.key"
            >
              <template #prefix>
                <Icon :name="cat.icon" size="sm" />
              </template>
            </ListItem>
          </List>
        </section>
      </template>

      <section v-else class="search-panel__section">
        <h3 class="search-panel__heading">
          搜索结果
          <span class="search-panel__count">{{ results.length }}</span>
        </h3>
        <List v-if="results.length > 0" bordered size="small">
          <ListItem
            v-for="item in results"
            :key="item.id"
            :title="item.title"
            :description="item.description"
            clickable
            @click="onSelect(item)"
          >
            <template #prefix>
              <Icon :name="categoryIcon(item.category)" size="sm" />
            </template>
            <template #suffix>
              <Tag size="sm" variant="default">{{ categoryLabel(item.category) }}</Tag>
            </template>
          </ListItem>
        </List>
        <Empty v-else description="未找到匹配内容，试试其他关键词" />
      </section>
    </div>
  </UiScenarioScope>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  Chip,
  Empty,
  FilterTagGroup,
  Icon,
  Input,
  List,
  ListItem,
  Tag,
  UiScenarioScope,
  useUiActionFeedback,
} from '@ocpui/vue';
import {
  getRecentSearches,
  getSearchCatalog,
  searchCatalog,
  type SearchEntry,
} from '@/mock/consumer';

const action = useUiActionFeedback();

const inputRef = ref<{ focus?: () => void } | null>(null);
const query = ref('');
const category = ref('全部');
const recentTerms = getRecentSearches();

const categoryOptions = [
  { label: '全部', value: '全部' },
  { label: '条目', value: 'entry' },
  { label: '纪元', value: 'epoch' },
  { label: '人物', value: 'person' },
];

const catalog = getSearchCatalog();

const browseCategories = computed(() => [
  {
    key: 'entry',
    label: '编年条目',
    hint: '事件、协议、档案',
    icon: 'file-text',
    count: catalog.filter((i) => i.category === 'entry').length,
  },
  {
    key: 'epoch',
    label: '纪元',
    hint: 'E2401–E2403 分期',
    icon: 'layers',
    count: catalog.filter((i) => i.category === 'epoch').length,
  },
  {
    key: 'person',
    label: '人物',
    hint: '研究者与分析师',
    icon: 'user',
    count: catalog.filter((i) => i.category === 'person').length,
  },
]);

const results = computed(() => searchCatalog(query.value, category.value));

function categoryIcon(cat: SearchEntry['category']) {
  const map = { entry: 'file-text', epoch: 'layers', person: 'user' };
  return map[cat];
}

function categoryLabel(cat: SearchEntry['category']) {
  const map = { entry: '条目', epoch: '纪元', person: '人物' };
  return map[cat];
}

function submitSearch() {
  if (results.value.length > 0) {
    onSelect(results.value[0]);
  }
}

function onSelect(item: SearchEntry) {
  action.message.info(`打开：${item.title}`);
}

function focus() {
  inputRef.value?.focus?.();
}

defineExpose({ focus });
</script>

<style scoped>
.search-panel {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  max-width: 640px;
  margin: 0 auto;
}

.search-panel__input {
  padding-block: var(--space-1);
}

.search-panel__filters {
  padding-block: var(--space-1);
}

.search-panel__section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-panel__heading {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.search-panel__count {
  font-weight: 500;
  color: hsl(var(--primary));
}

.search-panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pill-gap);
}
</style>
