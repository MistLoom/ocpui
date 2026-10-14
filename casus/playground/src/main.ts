import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@ocpui/vue/styles';
import '@ocpui/vue/styles/full';
import '@ocpui/vue/themes/editorial';
import './styles/app.css';

createApp(App).use(router).mount('#app');
