import { createApp } from 'vue'
import './style.css'
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
})

const router = createRouter({
    history: createWebHistory(),
    routes: [],
});

createApp(App).use(router).use(vuetify).mount('#app')
