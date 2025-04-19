import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css'; // ← アイコンも使うなら
import { createApp } from 'vue';
import App from './App.vue';
import { createVuetify } from 'vuetify';

const vuetify = createVuetify();

createApp(App).use(vuetify).mount('#app');