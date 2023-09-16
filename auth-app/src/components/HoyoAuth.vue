<script setup lang="ts">
import { onMounted } from 'vue'
import { getChallenge } from '../helpers/dbqueries'
import { supabase } from '../helpers/supabaseClient.ts'
import { initTest } from '../helpers/geetest';

onMounted(async () => {

  // Add geetest helper function to window
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
  
  // Get captcha challenge from db
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const challenge = await getChallenge(userId);

  initTest(challenge.data, challenge.session_id, userId!);
  
});

</script>

<template>
  <div class="card">
    <button type="button" id="hoyoAuth" disabled=true>Complete Captcha</button>
  </div>
</template>

<style scoped>
#hoyoAuth {
  background: #7148FF;
}
</style>
