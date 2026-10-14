<template>
  <AdminPage
    title="发布向导"
    subtitle="ocp-progressive-wizard + ocp-form-action-bar"
    presentation-mode="progressive"
    scene="editor"
  >
    <div class="ocp-progressive-wizard">
      <Steps :current="step" :steps="stepItems" />

      <div class="ocp-progressive-wizard__body playground-card">
        <template v-if="step === 0">
          <h3 class="playground-section-title">基本信息</h3>
          <div class="playground-form-stack">
            <Input v-model="form.title" label="标题" placeholder="条目标题" />
            <Input v-model="form.typeKey" label="类型" placeholder="epoch / event" />
          </div>
        </template>
        <template v-else-if="step === 1">
          <h3 class="playground-section-title">内容校验</h3>
          <p class="playground-muted">模拟维度校验与结构检查…</p>
          <StatusTag status="warning">2 项待确认</StatusTag>
        </template>
        <template v-else>
          <h3 class="playground-section-title">确认发布</h3>
          <Descriptions :items="summaryItems" />
        </template>
      </div>

      <div class="ocp-form-action-bar">
        <Button variant="secondary" :disabled="step === 0" @click="step -= 1">上一步</Button>
        <Button v-if="step < 2" @click="step += 1">下一步</Button>
        <Button v-else variant="primary" @click="submit">提交发布</Button>
      </div>
    </div>
  </AdminPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Button, Descriptions, Input, StatusTag, Steps } from '@ocpui/vue';
import { AdminPage } from '@ocpui/vue-admin';
import { useUiActionFeedback, useUiMotion } from '@ocpui/vue/system';

const action = useUiActionFeedback();
const { resolve } = useUiMotion();

const step = ref(0);
const form = reactive({ title: '', typeKey: 'epoch' });

const stepItems = [
  { title: '基本信息' },
  { title: '内容校验' },
  { title: '确认发布' },
];

const summaryItems = computed(() => [
  { label: '标题', value: form.title || '（未填）' },
  { label: '类型', value: form.typeKey },
  { label: '动效 tier', value: resolve('explain_progress', 'light').tier },
]);

async function submit() {
  const ok = await action.dialog.confirm({
    title: '确认发布',
    content: `发布「${form.title || '未命名'}」？`,
  });
  if (ok) {
    action.message.success('已提交发布（演示）');
    step.value = 0;
  }
}
</script>

<style scoped>
.playground-section-title {
  margin: 0 0 var(--space-3);
}

.playground-form-stack {
  display: grid;
  gap: var(--space-3);
  max-width: 420px;
}

.playground-muted {
  color: hsl(var(--muted-foreground));
}
</style>
