<script setup lang="ts">
import { onMounted } from 'vue'
import { loadCaptcha } from '../helpers/geetest';
import { getUsernamePassword } from '../helpers/dbqueries'
import { useRoute, useRouter } from 'vue-router';

defineProps<{ msg: string }>()
const route = useRoute();
const router = useRouter();

onMounted(async () => {
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
  
  const account = await getUsernamePassword(await getUrlQueryParams());
  loadCaptcha(account);
});

async function getUrlQueryParams() {    
  //router is async so we wait for it to be ready
  await router.isReady();
  //once its ready we can access the query params
  const sessionId = route.query["sessionid"]?.valueOf();
  if (typeof sessionId === 'string') {
    return parseInt(sessionId);
  }

  return 0;
};

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
