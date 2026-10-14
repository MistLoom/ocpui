# 叶脉 · 管理端错误态 UI 迁移指南

## 背景

叶脉 · 管理端历史错误处理普遍采用 `try/catch + error.handle() + message.error()` Toast 模式，页面加载失败时仅顶部 Toast 一闪而过，**无可见错误态、无重试入口**。用户若错过 Toast 则面对空白或残缺页面，无法自救。

`ErrorStateBlock` 组件提供统一的"可见 + 可重试 + 可返回"错误态，逐步替换 20+ 页面的 Toast-only 模式。

## 组件契约

`@ocpui/vue/feedback/ErrorStateBlock.vue`

### Props

| Prop          | 类型             | 默认值 | 说明                                       |
| ------------- | ---------------- | ------ | ------------------------------------------ |
| `title`       | `string`         | i18n   | 错误标题，缺省走 i18n 默认标题             |
| `description` | `string`         | i18n   | 错误描述，缺省走 i18n 默认描述             |
| `errorMessage`| `string`         | —      | 后端原始错误消息，透传展示（便于排查）     |
| `size`        | `'sm' \| 'md'`   | `'md'` | `sm` 卡片内紧凑；`md` 页面级               |
| `backTo`      | `string`         | —      | 返回目标路径，提供时显示"返回"按钮         |
| `backLabel`   | `string`         | i18n   | 返回按钮文案                               |

### Emits

| Event   | 载荷 | 说明                       |
| ------- | ---- | -------------------------- |
| `retry` | 无   | 用户点击"重试"按钮时触发   |

### 视觉规范

- 错误色：`hsl(var(--error))`（图标、边框、背景 tint）
- 标题色：`hsl(var(--text))`
- 描述色：`hsl(var(--text-secondary))`
- 原始消息：等宽字体 + `hsl(var(--surface-inset))` 背景，便于排查
- 全部使用叶脉 · 管理端 hsl 主题变量，**禁止硬编码颜色**
- `size=md`：垂直居中布局，56px 图标，页面级留白
- `size=sm`：水平紧凑布局，24px 图标，卡片内嵌

## 迁移模式

### 反模式（禁止）

```vue
<!-- ❌ 仅 Toast，无可见错误态 -->
<script setup>
async function loadData() {
  try {
    data.value = await api.fetch();
  } catch (err) {
    error.handle(err, { context: 'xxx.loadData' }); // 默认弹 Toast 一闪而过
  }
}
</script>
```

```vue
<!-- ❌ Toast + 跳转，剥夺用户自救能力 -->
<script setup>
async function loadData() {
  try {
    data.value = await api.fetch();
  } catch (err) {
    message.error('加载失败');
    router.push(LIST_PATH); // 跳走，用户无法重试
  }
}
</script>
```

### 正模式：页面级错误态

```vue
<template>
  <div class="page">
    <PageHeader />

    <Card v-if="data">
      <!-- 正常内容 -->
    </Card>

    <ErrorStateBlock
      v-else-if="dataError"
      :error-message="dataError.message"
      :back-to="LIST_PATH"
      @retry="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { AppError } from '@/logic/common/error-handling';
import { useFeedback } from '@ocpui/vue/feedback';
import { ErrorStateBlock } from '@ocpui/vue';

const { error } = useFeedback();
const data = ref<DataDto | null>(null);
const dataError = ref<AppError | null>(null);

async function loadData(): Promise<void> {
  dataError.value = null;
  try {
    data.value = await api.fetch();
  } catch (err) {
    // 关键：showToast:false —— 错误态 UI 即用户反馈，不重复弹 Toast
    dataError.value = error.handle(
      err,
      { context: 'module.loadData' },
      { showToast: false },
    );
  }
}
</script>
```

### 正模式：卡片内错误态

```vue
<template>
  <Card>
    <template #title>子资源列表</template>

    <ErrorStateBlock
      v-if="subError"
      size="sm"
      :error-message="subError.message"
      @retry="loadSub"
    />
    <Table v-else :data="subRows" />
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { AppError } from '@/logic/common/error-handling';
import { useFeedback } from '@ocpui/vue/feedback';
import { ErrorStateBlock } from '@ocpui/vue';

const { error } = useFeedback();
const subError = ref<AppError | null>(null);

async function loadSub(): Promise<void> {
  subError.value = null;
  try {
    subRows.value = await api.fetchSub();
  } catch (err) {
    subError.value = error.handle(
      err,
      { context: 'module.loadSub' },
      { showToast: false },
    );
  }
}
</script>
```

## 迁移决策表

| 场景               | 错误态 size | backTo           | 说明                                   |
| ------------------ | ----------- | ---------------- | -------------------------------------- |
| 页面主数据加载失败 | `md`        | 上级列表路径     | 整页无法用，提供重试 + 返回            |
| 业务级 404（不存在）| `md`        | 上级列表路径     | 重试无益但保留，backTo 为主操作        |
| Card 内子资源失败  | `sm`        | 不提供           | 仅重试，主页面仍可用                   |
| 表单提交失败       | 不迁移      | —                | 保留 Toast（用户发起的操作，Toast 合适）|
| 权限不足           | 不迁移      | —                | 走 `ForbiddenPage`，非 ErrorStateBlock |

## 关键规则

1. **页面加载错误必须显示 ErrorStateBlock**，禁止仅 Toast
2. **`error.handle` 必须传 `{ showToast: false }`**，避免 Toast 与错误态 UI 重复
3. **重试前清空 error ref**（`dataError.value = null`），避免重试成功后残留旧错误态
4. **表单操作不迁移**（用户发起的提交，Toast 反馈合适）
5. **错误态必须可重试**，`@retry` 绑定到加载函数
6. **errorMessage 透传后端原始消息**（`AppError.message`），便于排查

## 迁移清单（待逐步推进）

以下页面存在同类 Toast-only 模式，按优先级迁移（不在 CMS-UX-001 scope 内）：

- `pages/ai-capability/**`
- `pages/collection/**`
- `pages/intelligence/**`
- `pages/info-lib/**`
- `pages/content/**`
- `pages/governance/boards/**`
- `pages/settings/**`

迁移步骤：

1. 识别页面中的 `loadXxx` 函数（onMounted/onChange 触发的数据加载）
2. 添加 `xxxError: Ref<AppError | null>` ref
3. `loadXxx` catch 块改为 `error.handle(err, ctx, { showToast: false })` 并赋值给 error ref
4. 模板在数据展示区添加 `<ErrorStateBlock v-if="xxxError" ... @retry="loadXxx" />`
5. **保留表单操作的 Toast**（仅迁移页面加载错误）
6. 验证：断网/接口 500 时页面显示错误态 + 可重试

## 参考

- 组件：`@ocpui/vue` 反馈通道与 `LoadState` / `ErrorState` 相关原语
- 列表/详情 Shell 组合：`@ocpui/vue-admin` 与 [playground 演示](../../../../casus/playground/README.md)
- i18n key：`components.feedback.errorStateBlock.*`、`common.retry`（消费方 locale 包内定义）
