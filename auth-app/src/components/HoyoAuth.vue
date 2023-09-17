<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getChallenge } from '../helpers/dbqueries'
import { supabase } from '../helpers/supabaseClient.ts'
import { initTest } from '../helpers/geetest';

const loading = ref(true)

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
  loading.value = false
  
});

</script>

<template>
  <div class="card">
    <v-btn variant="tonal" :loading="loading" @click="loading = true" disabled size="large" sm="6" md="4" id="hoyoAuth">
      Complete Captcha
    </v-btn>
    <v-alert
      id="alertSuccess"
      type="success"
      title="Success!"
      text="You have been sucessfully authenticated! You can now close this window."
    ></v-alert>
    <v-alert
      id="alertError"
      type="error"
      title="it blew up"
      text="Something went horribly wrong. Please contact Dish with a screenshot of the console."
    ></v-alert>
  </div>
</template>

<style scoped>
#hoyoAuth {
  margin: 2em;
  background-color: #cf2279;
}
#alertSuccess {
  display: none;
}
#alertError {
  display: none;
}
</style>
