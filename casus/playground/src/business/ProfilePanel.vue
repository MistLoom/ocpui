<template>
  <UiScenarioScope surface="detail" presentation-mode="summary">
    <div class="profile-panel">
      <header class="profile-panel__hero">
        <Avatar name="演示用户" size="xl" status="online" />
        <div class="profile-panel__identity">
          <h2>演示用户</h2>
          <p>编年史读者 · 跃迁纪元至今</p>
        </div>
      </header>

      <Grid :cols="{ xs: 3 }" gap="sm" class="profile-panel__stats">
        <GridItem v-for="stat in statItems" :key="stat.key">
          <div class="profile-panel__stat">
            <span class="profile-panel__stat-value">{{ stat.value }}</span>
            <span class="profile-panel__stat-label">{{ stat.label }}</span>
          </div>
        </GridItem>
      </Grid>

      <section class="profile-panel__section">
        <h3 class="profile-panel__heading">我的</h3>
        <List bordered size="small">
          <ListItem
            v-for="item in menuItems"
            :key="item.key"
            :title="item.label"
            :extra="item.extra"
            clickable
            @click="onMenu(item.key)"
          >
            <template #prefix>
              <Icon :name="item.icon" size="sm" />
            </template>
          </ListItem>
        </List>
      </section>

      <section class="profile-panel__section">
        <h3 class="profile-panel__heading">偏好</h3>
        <List bordered size="small">
          <ListItem title="主题" extra="editorial" clickable @click="onMenu('theme')">
            <template #prefix>
              <Icon name="palette" size="sm" />
            </template>
          </ListItem>
          <ListItem title="通知" extra="已开启" clickable @click="onMenu('notify')">
            <template #prefix>
              <Icon name="bell" size="sm" />
            </template>
          </ListItem>
        </List>
      </section>
    </div>
  </UiScenarioScope>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Avatar,
  Grid,
  GridItem,
  Icon,
  List,
  ListItem,
  UiScenarioScope,
  useUiActionFeedback,
} from '@ocpui/vue';
import { getProfileMenu, getProfileStats } from '@/mock/consumer';

const action = useUiActionFeedback();

const stats = getProfileStats();
const menuItems = getProfileMenu();

const statItems = computed(() => [
  { key: 'reads', label: '阅读', value: stats.reads },
  { key: 'favorites', label: '收藏', value: stats.favorites },
  { key: 'following', label: '关注', value: stats.following },
]);

function onMenu(key: string) {
  action.message.info(`打开：${key}`);
}
</script>

<style scoped>
.profile-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 560px;
  margin: 0 auto;
}

.profile-panel__hero {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-block: var(--space-2);
}

.profile-panel__identity h2 {
  margin: 0 0 0.25rem;
  font-size: 1.125rem;
}

.profile-panel__identity p {
  margin: 0;
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
}

.profile-panel__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.75rem 0.5rem;
  border-radius: 10px;
  background: hsl(var(--surface-container-low));
  border: 1px solid hsl(var(--border));
}

.profile-panel__stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.profile-panel__stat-label {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.profile-panel__section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-panel__heading {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
}
</style>
