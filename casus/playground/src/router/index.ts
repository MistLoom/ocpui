import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    {
      path: '/full',
      component: () => import('@/layouts/FullModeLayout.vue'),
      children: [
        { path: '', redirect: '/full/command-center' },
        {
          path: 'command-center',
          name: 'full-command-center',
          component: () => import('@/views/full/CommandCenterView.vue'),
          meta: { title: '运营指挥台' },
        },
        {
          path: 'consumer-app',
          name: 'full-consumer-app',
          component: () => import('@/views/full/ConsumerAppView.vue'),
          meta: { title: '跨端内容应用' },
        },
        {
          path: 'list',
          name: 'full-list',
          component: () => import('@/views/full/ListScenarioView.vue'),
          meta: { title: '列表场景' },
        },
        {
          path: 'dashboard',
          name: 'full-dashboard',
          component: () => import('@/views/full/DashboardScenarioView.vue'),
          meta: { title: '仪表场景' },
        },
        {
          path: 'table',
          name: 'full-table',
          component: () => import('@/views/full/TableScenarioView.vue'),
          meta: { title: '表格场景' },
        },
        {
          path: 'progressive',
          name: 'full-progressive',
          component: () => import('@/views/full/ProgressiveScenarioView.vue'),
          meta: { title: '分步场景' },
        },
        {
          path: 'interaction',
          name: 'full-interaction',
          component: () => import('@/views/full/InteractionScenarioView.vue'),
          meta: { title: '交互场景' },
        },
      ],
    },
    {
      path: '/standalone',
      component: () => import('@/layouts/StandaloneModeLayout.vue'),
      children: [
        { path: '', redirect: '/standalone/gallery' },
        {
          path: 'gallery',
          name: 'standalone-gallery',
          component: () => import('@/views/standalone/WidgetGalleryView.vue'),
          meta: { title: '组件画廊' },
        },
        {
          path: 'combination-patterns',
          name: 'standalone-combination-patterns',
          component: () => import('@/views/standalone/CombinationPatternsView.vue'),
          meta: { title: '组合模式验收' },
        },
        {
          path: 'type-gallery',
          name: 'standalone-type-gallery',
          component: () => import('@/views/standalone/TypeGalleryView.vue'),
          meta: { title: '类型验收矩阵' },
        },
        {
          path: 'consumer',
          name: 'standalone-consumer',
          component: () => import('@/views/standalone/ConsumerWidgetsView.vue'),
          meta: { title: 'C 端组件' },
        },
        {
          path: 'embedded',
          name: 'standalone-embedded',
          component: () => import('@/views/standalone/EmbeddedPanelView.vue'),
          meta: { title: '局部嵌入' },
        },
        {
          path: 'doc-wiki',
          name: 'standalone-doc-wiki',
          component: () => import('@/views/standalone/DocWikiView.vue'),
          meta: { title: '文档 Wiki' },
        },
        {
          path: 'doc-reader',
          name: 'standalone-doc-reader',
          component: () => import('@/views/standalone/DocReaderView.vue'),
          meta: { title: '文档阅读' },
        },
        {
          path: 'doc-editor',
          name: 'standalone-doc-editor',
          component: () => import('@/views/standalone/DocEditorView.vue'),
          meta: { title: '文档编辑' },
        },
      ],
    },
  ],
});

export default router;
