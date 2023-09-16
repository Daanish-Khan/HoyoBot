<script setup lang="ts">
import { onMounted } from 'vue';
import HoyoAuth from './components/HoyoAuth.vue'
import DiscordAuth from './components/DiscordAuth.vue'
import { supabase } from './helpers/supabaseClient'
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const serverId = ref(0);
const isUserLoggedIn = ref(false);

onMounted(async() => {
  // Check if user is signed in
  const loginData = await supabase.auth.getUser();
  isUserLoggedIn.value = loginData.data.user != null;

  // Get server uuid
  serverId.value = await getUrlQueryParams();

  // ---- TESTING PURPOSES ONLY ----
  supabase.auth.signOut()
});


async function getUrlQueryParams() {    
  //router is async so we wait for it to be ready
  await router.isReady();
  //once its ready we can access the query params
  const serverid = route.query["serverid"]?.valueOf();
  if (typeof serverid === 'string') {
    return parseInt(serverid);
  }

  return 0;
};

</script>

<template>
  <div>
    <img src="./assets/hsr512.svg" class="logo hsr" alt="HSR logo" />
  </div>
  <h1>HoyoBot Login</h1>
  <DiscordAuth :serverId="serverId" v-if="!isUserLoggedIn" />
  <HoyoAuth v-else/>
</template>

<style scoped>
.logo {
  height: 25em;
  will-change: filter;
  transition: filter 300ms;
}
.logo.hsr:hover {
  filter: drop-shadow(0 0 2em #5020c2aa);
}
</style>
