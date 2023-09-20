<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getChallenge, updateUser } from '../helpers/dbqueries'
import { supabase } from '../helpers/supabaseClient.ts'
import { initTest } from '../helpers/geetest';

const loading = ref(true)
const errorText = ref("Something went horribly wrong. Please contact Dish with a screenshot of the console.")

onMounted(async () => {

  // Add geetest helper function to window
  const plugin = document.createElement('script');
  plugin.setAttribute(
    'src',
    '/gt.js'
  );
  plugin.setAttribute(
    'type',
    'text/javascript'
  )
  plugin.async = true;
  document.head.appendChild(plugin);

  const userId = (await supabase.auth.getUser()).data.user?.id;

  // Update user in db
  const result = await updateUser(userId, (await supabase.auth.getUser()).data.user?.user_metadata["provider_id"]);
  console.log(result)
  // Get captcha challenge from db
  const challenge = await getChallenge(userId, errorText);

  initTest(challenge.data, challenge.session_id, userId!);
  loading.value = false
  
});

</script>

<template>
  <div class="card">
    <v-btn variant="tonal" disabled size="large" sm="6" md="4" id="hoyoAuth" :loading="loading" @click="loading = true">
      Complete Captcha
    </v-btn>
    <v-alert
      class="alertSuccess"
      id="success"
      type="success"
      title="Success!"
      text="You have been sucessfully authenticated! You can now close this window."
    ></v-alert>
    <v-alert
      class="alertError"
      id="error"
      type="error"
      title="it blew up"
      :text=errorText
    ></v-alert>
  </div>
</template>

<style scoped>
#hoyoAuth {
  background-color: #cf2279;
}
.alertSuccess {
  display: none;
}
.alertError {
  display: none;
}
</style>
