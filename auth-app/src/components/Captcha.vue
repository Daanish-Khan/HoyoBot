<script setup lang="ts">
import { onMounted } from 'vue'
import { create_mmt } from '../helpers/geetest';

defineProps<{ msg: string }>()

onMounted(() => {
  const plugin = document.createElement('script');
  plugin.setAttribute(
    'src',
    '/src/utils/gt.js'
  );
  plugin.setAttribute(
    'type',
    'text/javascript'
  )
  plugin.async = true;
  document.head.appendChild(plugin);
  create_mmt('username', 'password');
})
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" id="login" hidden=true>Complete Captcha</button>
  </div>

</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
