import { createApp } from 'vue'
import './style.css'
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue'
import { customSVGs } from './components/customSvgs';

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    sets: {
      custom: customSVGs,
    }
  }
})

const router = createRouter({
    history: createWebHistory(),
    routes: [],
});

createApp(App).use(router).use(vuetify).mount('#app')
