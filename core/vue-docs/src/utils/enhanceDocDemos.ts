import { createApp, h, type App } from 'vue';
import { UiRoot } from '@ocpui/vue';
import { loadDocDemo } from 'virtual:ocp-doc-demos';

const demoApps = new WeakMap<HTMLElement, App>();

/** 为 Markdown 编译产物中的 demo 占位挂载 Vue 预览 */
export async function enhanceDocDemos(root: HTMLElement): Promise<void> {
  const blocks = root.querySelectorAll<HTMLElement>('.doc-demo[data-doc-demo-id]');

  await Promise.all(
    Array.from(blocks).map(async (block) => {
      if (block.dataset.docDemoMounted === 'true') {
        return;
      }

      const preview = block.querySelector<HTMLElement>('.doc-demo__preview');
      const demoId = block.dataset.docDemoId;
      if (!preview || !demoId) {
        return;
      }

      try {
        const DemoComponent = await loadDocDemo(demoId);
        const app = createApp({
          render: () =>
            h(
              UiRoot,
              {
                themeStyle: 'editorial',
                presentationMode: 'read',
                customClass: 'doc-demo-root',
              },
              () => h(DemoComponent),
            ),
        });
        app.mount(preview);
        demoApps.set(preview, app);
        block.dataset.docDemoMounted = 'true';
      } catch (cause) {
        preview.innerHTML = '<p class="doc-demo__error">Demo 加载失败</p>';
        console.error('[doc-demo]', demoId, cause);
      }
    }),
  );
}

/** 卸载已挂载的 demo 实例 */
export function teardownDocDemos(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('.doc-demo__preview').forEach((preview) => {
    const app = demoApps.get(preview);
    if (app) {
      app.unmount();
      demoApps.delete(preview);
    }
  });
  root.querySelectorAll<HTMLElement>('.doc-demo[data-doc-demo-id]').forEach((block) => {
    delete block.dataset.docDemoMounted;
  });
}
