&lt;!--
异常列表组件

Props:
- title: string - 组件标题，默认值：'异常操作检测'
- items: AbnormalItem[] - 异常项列表
- defaultDisplayCount: number - 默认显示数量，默认值：5
- batchMode: boolean - 是否开启批量模式，默认值：false
- showRules: boolean - 是否显示规则说明，默认值：true
- rulesDescription: string - 规则说明文本，默认值：'系统根据操作频率、时间、地点等因素自动检测异常行为'

Events:
- process: (item: AbnormalItem) - 处理异常项
- ignore: (item: AbnormalItem) - 忽略异常项
- view-detail: (item: AbnormalItem) - 查看异常项详情
- batch-process: (ids: string[]) - 批量处理选中的异常项

Usage:
&lt;AbnormalList
  :items="abnormalItems"
  :batchMode="true"
  @process="handleProcess"
  @ignore="handleIgnore"
  @view-detail="handleViewDetail"
  @batch-process="handleBatchProcess"
/&gt;
--&gt;
<template>
  <div class="abnormal-list">
    <div class="abnormal-header">
      <div class="abnormal-title-wrapper">
        <h3 class="abnormal-title">{{ title }}</h3>
        <Badge v-if="pendingCount > 0" :count="pendingCount" variant="error" />
      </div>
      <div class="abnormal-actions">
        <Button
          v-if="selectedItems.length > 0"
          variant="primary"
          size="sm"
          @click="handleBatchProcess"
        >
          {{ t('components.dataDisplay.abnormalList.batchProcess', { count: selectedItems.length }) }}
        </Button>
        <Tooltip v-if="showRules" :content="displayRulesDescription">
          <Icon name="help-circle" :size="16" class="rules-icon" />
        </Tooltip>
      </div>
    </div>

    <div class="abnormal-content">
      <div
        v-for="item in displayItems"
        :key="item.id"
        class="abnormal-item"
        :class="{
          'abnormal-item--high': item.riskLevel === 'high',
          'abnormal-item--medium': item.riskLevel === 'medium',
          'abnormal-item--processed': item.status === 'processed',
          'abnormal-item--ignored': item.status === 'ignored'
        }"
      >
        <div v-if="batchMode" class="abnormal-checkbox">
          <input
            type="checkbox"
            :checked="selectedItems.includes(item.id)"
            @change="toggleSelection(item.id)"
          />
        </div>

        <div class="abnormal-icon">
          <Icon
            :name="getRiskIcon(item.riskLevel)"
            :size="20"
            :class="`risk-icon--${item.riskLevel}`"
          />
        </div>

        <div class="abnormal-info">
          <div class="abnormal-main">
            <Tag :variant="getRiskVariant(item.riskLevel)" size="sm">
              {{ getRiskLabel(item.riskLevel) }}
            </Tag>
            <Tag :variant="getTypeVariant(item.type)" size="sm">
              {{ item.typeLabel }}
            </Tag>
            <span class="abnormal-time">{{ formatTime(item.timestamp) }}</span>
          </div>
          <div class="abnormal-user">
            <Avatar :src="item.userAvatar" :size="20" />
            <span>{{ item.username }}</span>
          </div>
          <div class="abnormal-description">{{ item.description }}</div>
        </div>

        <div class="abnormal-status">
          <Tag :variant="getStatusVariant(item.status)" size="sm">
            {{ getStatusLabel(item.status) }}
          </Tag>
        </div>

        <div class="abnormal-actions-row">
          <Button
            v-if="item.status === 'pending'"
            variant="text"
            size="sm"
            @click="handleProcess(item)"
          >
            {{ t('components.dataDisplay.abnormalList.process') }}
          </Button>
          <Button
            v-if="item.status === 'pending'"
            variant="text"
            size="sm"
            @click="handleIgnore(item)"
          >
            {{ t('components.dataDisplay.abnormalList.ignore') }}
          </Button>
          <Button variant="text" size="sm" @click="handleViewDetail(item)">
            {{ t('components.dataDisplay.abnormalList.viewDetail') }}
          </Button>
        </div>
      </div>
    </div>

    <div v-if="items.length > displayCount" class="abnormal-footer">
      <Button variant="text" size="sm" @click="showAll = !showAll">
        {{ showAll ? t('components.dataDisplay.abnormalList.collapse') : t('components.dataDisplay.abnormalList.viewMore', { count: items.length - displayCount }) }}
      </Button>
    </div>

    <div v-if="items.length === 0" class="abnormal-empty">
      <Empty :description="t('components.dataDisplay.abnormalList.emptyDescription')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Avatar, Button, Badge, Icon, Empty } from '../utility';
import Tag from './Tag.vue';
import { Tooltip } from '../feedback';
import { useUiT } from '@ocpui/vue/composables/useUiT';
import type { AbnormalItem } from './abnormal-list.types';

const { uiT: t } = useUiT();

interface Props {
  title?: string;
  items: AbnormalItem[];
  defaultDisplayCount?: number;
  batchMode?: boolean;
  showRules?: boolean;
  rulesDescription?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  items: () => [],
  defaultDisplayCount: 5,
  batchMode: false,
  showRules: true,
  rulesDescription: undefined,
});

const displayTitle = computed(() => props.title ?? t('components.dataDisplay.abnormalList.title'));
const displayRulesDescription = computed(() => props.rulesDescription ?? t('components.dataDisplay.abnormalList.rulesDescription'));

const emit = defineEmits<{
  'process': [item: AbnormalItem];
  'ignore': [item: AbnormalItem];
  'view-detail': [item: AbnormalItem];
  'batch-process': [ids: string[]];
}>();

const showAll = ref(false);
const selectedItems = ref<string[]>([]);

const pendingCount = computed(() => {
  return props.items.filter(item => item.status === 'pending').length;
});

const displayCount = computed(() => {
  return showAll.value ? props.items.length : props.defaultDisplayCount;
});

const displayItems = computed(() => {
  return props.items.slice(0, displayCount.value);
});

const getRiskIcon = (level: string): string => {
  switch (level) {
    case 'high': return 'alert-triangle';
    case 'medium': return 'alert-circle';
    case 'low': return 'info';
    default: return 'info';
  }
};

const getRiskVariant = (level: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (level) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'default';
  }
};

const getRiskLabel = (level: string): string => {
  const keyMap: Record<string, string> = {
    high: 'high',
    medium: 'medium',
    low: 'low',
  };
  const key = keyMap[level] || 'unknown';
  return t(`components.dataDisplay.abnormalList.riskLabels.${key}`);
};

const getTypeVariant = (type: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (type) {
    case 'frequent': return 'primary';
    case 'offhours': return 'warning';
    case 'location': return 'error';
    case 'permission': return 'error';
    default: return 'default';
  }
};

const getStatusVariant = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case 'pending': return 'warning';
    case 'processed': return 'success';
    case 'ignored': return 'default';
    default: return 'default';
  }
};

const getStatusLabel = (status: string): string => {
  const keyMap: Record<string, string> = {
    pending: 'pending',
    processed: 'processed',
    ignored: 'ignored',
  };
  const key = keyMap[status] || 'unknown';
  return t(`components.dataDisplay.abnormalList.statusLabels.${key}`);
};

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const toggleSelection = (id: string) => {
  const index = selectedItems.value.indexOf(id);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(id);
  }
};

const handleProcess = (item: AbnormalItem) => {
  emit('process', item);
};

const handleIgnore = (item: AbnormalItem) => {
  emit('ignore', item);
};

const handleViewDetail = (item: AbnormalItem) => {
  emit('view-detail', item);
};

const handleBatchProcess = () => {
  emit('batch-process', selectedItems.value);
  selectedItems.value = [];
};
</script>

<style scoped>
.abnormal-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.abnormal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.abnormal-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.abnormal-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--text));
  margin: 0;
}

.abnormal-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rules-icon {
  color: hsl(var(--text-muted));
  cursor: help;
}

.abnormal-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.abnormal-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: hsl(var(--surface-container-high) / 0.5);
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: background-color var(--duration-normal) var(--ease-standard), color var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard), box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard), opacity var(--duration-normal) var(--ease-standard);
}

.abnormal-item:hover {
  background: hsl(var(--surface-hover));
}

.abnormal-item--high {
  border-left-color: hsl(var(--error));
  background: hsl(var(--error) / 0.05);
}

.abnormal-item--medium {
  border-left-color: hsl(var(--warning));
  background: hsl(var(--warning) / 0.05);
}

.abnormal-item--processed {
  opacity: 0.7;
}

.abnormal-item--ignored {
  opacity: 0.5;
}

.abnormal-checkbox {
  padding-top: 2px;
}

.abnormal-checkbox input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.abnormal-icon {
  flex-shrink: 0;
  padding-top: 2px;
}

.risk-icon--high {
  color: hsl(var(--error));
}

.risk-icon--medium {
  color: hsl(var(--warning));
}

.risk-icon--low {
  color: hsl(var(--info));
}

.abnormal-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.abnormal-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.abnormal-time {
  font-size: 12px;
  color: hsl(var(--text-muted));
}

.abnormal-user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: hsl(var(--text-secondary));
}

.abnormal-description {
  font-size: 13px;
  color: hsl(var(--text));
  line-height: 1.5;
}

.abnormal-status {
  flex-shrink: 0;
}

.abnormal-actions-row {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.abnormal-footer {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.abnormal-empty {
  padding: 32px 0;
}

/* 响应式样式 */
@media (max-width: 767px) {
  .abnormal-item {
    flex-wrap: wrap;
    padding: 10px 12px;
  }

  .abnormal-actions-row {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid hsl(var(--border));
  }
}
</style>
