import { createApp } from 'vue';
import docgenPayload from 'virtual:ocp-docgen';
import App from './App.vue';
import { createDocRouter } from './router.js';

const manifest = docgenPayload.manifests?.[0];
if (!manifest) {
  throw new Error('[ocp-doc] manifest 为空，请检查 collections 配置');
}

const app = createApp(App);
app.use(createDocRouter(manifest, { editEnabled: Boolean(docgenPayload.editEnabled) }));
app.mount('#app');
