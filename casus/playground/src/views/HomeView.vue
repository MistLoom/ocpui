<template>
  <div class="playground-home">
    <section class="playground-home__hero">
      <h1>OCP UI 演示</h1>
      <p class="playground-home__lead">
        面向后台工作台的 Vue 3 组件库。先看一个完整的列表页：加载、空数据、出错、无权限等状态由列表组件统一处理，业务页不用各自写这些分支。
      </p>
      <div class="playground-home__links">
        <Button variant="primary" size="lg" @click="$router.push('/full/list')">从一个列表页开始</Button>
      </div>
      <p class="playground-home__hint">进入后点「刷新」看列表加载过程，点「系统同步」看全局加载与完成通知。</p>
    </section>

    <section class="playground-home__next" aria-labelledby="home-next">
      <h2 id="home-next">接下来可以看</h2>
      <div class="playground-home__modes">
        <article class="playground-home__mode-card">
          <h3>综合工作台</h3>
          <p>多个列表、图表和抽屉组合在一页，接近真实的运维后台。</p>
          <div class="playground-home__links">
            <Button variant="secondary" @click="$router.push('/full/command-center')">打开工作台</Button>
          </div>
        </article>
        <article class="playground-home__mode-card">
          <h3>单个组件</h3>
          <p>不接入整套运行时，按需引入单个组件，适合嵌入已有页面。</p>
          <div class="playground-home__links">
            <Button variant="secondary" @click="$router.push('/standalone/gallery')">浏览组件</Button>
          </div>
        </article>
      </div>
    </section>

    <details class="playground-home__more">
      <summary>更多演示</summary>
      <div class="playground-home__modes">
        <article class="playground-home__mode-card">
          <h3>更多后台页面</h3>
          <ul class="playground-home__list">
            <li><RouterLink to="/full/dashboard">指标面板</RouterLink></li>
            <li><RouterLink to="/full/table">可选中表格 + 分页</RouterLink></li>
            <li><RouterLink to="/full/progressive">分步流程</RouterLink></li>
            <li><RouterLink to="/full/interaction">全局搜索与批量操作</RouterLink></li>
          </ul>
        </article>
        <article class="playground-home__mode-card">
          <h3>文档阅读</h3>
          <ul class="playground-home__list">
            <li><RouterLink to="/standalone/doc-wiki">文档站（侧栏 + 搜索）</RouterLink></li>
            <li><RouterLink to="/standalone/doc-reader">单页阅读</RouterLink></li>
          </ul>
        </article>
        <article class="playground-home__mode-card">
          <h3>扩展演示 · 面向用户的内容应用</h3>
          <p>验证同一套组件在移动端与内容场景下的适配，不是本库的首要定位。</p>
          <ul class="playground-home__list">
            <li><RouterLink to="/full/consumer-app">内容应用</RouterLink></li>
            <li><RouterLink to="/standalone/consumer">相关组件</RouterLink></li>
          </ul>
        </article>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@ocpui/vue';
</script>
