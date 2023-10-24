<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getChallenge, registeredWithToken, updateUser } from '../helpers/dbqueries'
import { supabase } from '../helpers/supabaseClient.ts'
import { initTest } from '../helpers/geetest';

const loading = ref(true)
const errorText = ref("Something went horribly wrong. Please contact Dish with a screenshot of the console.")
const successText = ref("You have been sucessfully authenticated! You can now close this window.")

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
  const discordId = (await supabase.auth.getUser()).data.user?.user_metadata["provider_id"]
  // Update user in db
  await updateUser(userId, discordId);

  const isRegisteredWithToken = await registeredWithToken(discordId);

  if (!isRegisteredWithToken) {
	// Get captcha challenge from db
	const challenge = await getChallenge(userId, errorText);

	initTest(challenge.data, challenge.session_id, userId!, successText);
  } else {
	successText.value = "Token registration completed! You may now close this window."
	document.getElementById("hoyoAuth")!.classList.add("v-btn--disabled");
	document.getElementById("hoyoAuth")!.setAttribute("disabled", "disabled");
	document.getElementById("hoyoAuth")!.textContent = "Done!";
	document.getElementById("success")!.style.display = "block";
	supabase.auth.signOut();
  }

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
      :text=successText
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
