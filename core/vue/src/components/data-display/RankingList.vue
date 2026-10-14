&lt;!--
排行榜组件

Props:
- title?: string - 排行榜标题，默认值：'排行榜'
- items: RankingItem[] - 排行项数据
- maxValue?: number - 最大值（用于计算百分比）
- defaultTop?: number - 默认显示数量，默认值：10
- topOptions?: { label: string; value: number }[] - 显示数量选项，默认值：[{ label: 'TOP 5', value: 5 }, { label: 'TOP 10', value: 10 }, { label: 'TOP 20', value: 20 }]
- clickable?: boolean - 是否可点击，默认值：false
- showAction?: boolean - 是否显示操作按钮，默认值：false
- actionText?: string - 操作按钮文本，默认值：'查看'
- valuePrefix?: string - 数值前缀
- valueSuffix?: string - 数值后缀
- precision?: number - 数值精度，默认值：0

Events:
- item-click: (item: RankingItem) - 点击排行项事件
- action: (item: RankingItem) - 操作按钮点击事件

Usage:
&lt;RankingList
  title="用户排行榜"
  :items="[
    // 示例数据，实际使用时应从 API 获取
    { id: '1', name: '张三', value: 1000, avatar: 'https://example.com/avatar1.jpg' },
    { id: '2', name: '李四', value: 800, avatar: 'https://example.com/avatar2.jpg' },
    { id: '3', name: '王五', value: 600, avatar: 'https://example.com/avatar3.jpg' }
  ]"
  :clickable="true"
  :showAction="true"
  actionText="详情"
  valueSuffix="分"
  @item-click="handleItemClick"
  @action="handleAction"
/&gt;

RankingItem 接口:
- id?: string - 唯一标识
- name: string - 名称
- avatar?: string - 头像
- value: number - 数值
- description?: string - 描述
- [key: string]: unknown - 其他属性
--&gt;
<template>
  <div class="ranking-list">
    <div class="ranking-header">
      <h3 class="ranking-title">{{ displayTitle }}</h3>
      <Select
        v-if="topOptions.length > 0"
        v-model="selectedTop"
        :options="topOptions"
        size="sm"
        class="top-select"
      />
    </div>
    <div class="ranking-content">
      <div
        v-for="(item, index) in displayItems"
        :key="item.id || index"
        class="ranking-item"
        :class="{
          'ranking-item--top1': index === 0,
          'ranking-item--top2': index === 1,
          'ranking-item--top3': index === 2,
          'ranking-item--clickable': clickable
        }"
        @click="handleItemClick(item)"
      >
        <div class="ranking-rank">
          <span
            v-if="index < 3"
            class="rank-badge"
            :class="`rank-badge--${index + 1}`"
          >
            {{ index + 1 }}
          </span>
          <span v-else class="rank-number">{{ index + 1 }}</span>
        </div>
        <div class="ranking-avatar">
          <Avatar :src="item.avatar" :size="36" :fallback="item.name.charAt(0)" />
        </div>
        <div class="ranking-info">
          <div class="ranking-name">{{ item.name }}</div>
          <div v-if="item.description" class="ranking-description">
            {{ item.description }}
          </div>
        </div>
        <div class="ranking-stats">
          <div class="ranking-value">{{ formatValue(item.value) }}</div>
          <div class="ranking-progress">
            <Progress
              :percent="getPercentage(item.value)"
              :stroke-width="4"
              :show-info="false"
              :stroke-color="getProgressColor(index)"
            />
          </div>
          <div class="ranking-percentage">{{ getPercentage(item.value) }}%</div>
        </div>
        <div v-if="showAction" class="ranking-action">
          <Button variant="text" size="sm" @click.stop="handleAction(item)">
            {{ displayActionText }}
          </Button>
        </div>
      </div>
    </div>
    <div v-if="items.length > displayCount" class="ranking-footer">
      <Button variant="text" size="sm" @click="showAll = !showAll">
        {{ showAll ? t('components.dataDisplay.rankingList.collapse') : t('components.dataDisplay.rankingList.viewMore', { count: items.length - displayCount }) }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Avatar, Button } from '../utility';
import Progress from './Progress.vue';
import { Select } from '../data-entry';
import { useUiT } from '@ocpui/vue/composables/useUiT';

const { uiT: t } = useUiT();

interface RankingItem {
  id?: string;
  name: string;
  avatar?: string;
  value: number;
  description?: string;
  [key: string]: unknown;
}

interface Props {
  title?: string;
  items: RankingItem[];
  maxValue?: number;
  defaultTop?: number;
  topOptions?: { label: string; value: number }[];
  clickable?: boolean;
  showAction?: boolean;
  actionText?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  precision?: number;
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  items: () => [],
  defaultTop: 10,
  topOptions: () => [
    { label: 'TOP 5', value: 5 },
    { label: 'TOP 10', value: 10 },
    { label: 'TOP 20', value: 20 }
  ],
  clickable: false,
  showAction: false,
  actionText: undefined,
  valuePrefix: '',
  valueSuffix: '',
  precision: 0
});

const displayTitle = computed(() => props.title ?? t('components.dataDisplay.rankingList.title'));
const displayActionText = computed(() => props.actionText ?? t('components.dataDisplay.rankingList.actionText'));

const emit = defineEmits<{
  'item-click': [item: RankingItem];
  'action': [item: RankingItem];
}>();

const selectedTop = ref(props.defaultTop);
const showAll = ref(false);

const maxValue = computed(() => {
  return props.maxValue || Math.max(...props.items.map(item => item.value), 1);
});

const displayCount = computed(() => {
  return showAll.value ? props.items.length : selectedTop.value;
});

const displayItems = computed(() => {
  return props.items.slice(0, displayCount.value);
});

const formatValue = (value: number): string => {
  const formatted = value.toLocaleString('zh-CN', {
    minimumFractionDigits: props.precision,
    maximumFractionDigits: props.precision
  });
  return `${props.valuePrefix}${formatted}${props.valueSuffix}`;
};

const getPercentage = (value: number): number => {
  return Math.round((value / maxValue.value) * 100);
};

const getProgressColor = (index: number): string => {
  if (index === 0) return 'hsl(45, 90%, 50%)'; // 金色
  if (index === 1) return 'hsl(0, 0%, 70%)';   // 银色
  if (index === 2) return 'hsl(30, 60%, 50%)'; // 铜色
  return 'hsl(var(--primary))';
};

const handleItemClick = (item: RankingItem) => {
  if (props.clickable) {
    emit('item-click', item);
  }
};

const handleAction = (item: RankingItem) => {
  emit('action', item);
};
</script>

<style scoped>
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ranking-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--text));
  margin: 0;
}

.top-select {
  width: 100px;
}

.ranking-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: hsl(var(--surface-container-high) / 0.5);
  border-radius: 8px;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.ranking-item:hover {
  background: hsl(var(--surface-hover));
}

.ranking-item--clickable {
  cursor: pointer;
}

.ranking-item--top1 {
  background: linear-gradient(135deg, hsl(45 90% 50% / 0.1) 0%, hsl(45 90% 50% / 0.05) 100%);
  border: 1px solid hsl(45 90% 50% / 0.3);
}

.ranking-item--top2 {
  background: linear-gradient(135deg, hsl(0 0% 70% / 0.1) 0%, hsl(0 0% 70% / 0.05) 100%);
  border: 1px solid hsl(0 0% 70% / 0.3);
}

.ranking-item--top3 {
  background: linear-gradient(135deg, hsl(30 60% 50% / 0.1) 0%, hsl(30 60% 50% / 0.05) 100%);
  border: 1px solid hsl(30 60% 50% / 0.3);
}

.ranking-rank {
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rank-badge {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  color: hsl(var(--primary-foreground));
}

.rank-badge--1 {
  background: hsl(45 90% 50%);
}

.rank-badge--2 {
  background: hsl(0 0% 70%);
}

.rank-badge--3 {
  background: hsl(30 60% 50%);
}

.rank-number {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--text-muted));
}

.ranking-avatar {
  flex-shrink: 0;
}

.ranking-info {
  flex: 1;
  min-width: 0;
}

.ranking-name {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--text));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ranking-description {
  font-size: 12px;
  color: hsl(var(--text-muted));
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ranking-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 140px;
}

.ranking-value {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--text));
  white-space: nowrap;
}

.ranking-progress {
  flex: 1;
  min-width: 60px;
}

.ranking-percentage {
  font-size: 12px;
  color: hsl(var(--text-muted));
  min-width: 36px;
  text-align: right;
}

.ranking-action {
  flex-shrink: 0;
}

.ranking-footer {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

/* 响应式样式 */
@media (max-width: 767px) {
  .ranking-item {
    padding: 10px 12px;
    gap: 10px;
  }

  .ranking-stats {
    min-width: 100px;
    gap: 8px;
  }

  .ranking-progress {
    display: none;
  }

  .ranking-percentage {
    display: none;
  }
}
</style>
