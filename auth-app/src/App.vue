<script setup lang="ts">
import { onMounted } from 'vue';
import HoyoAuth from './components/HoyoAuth.vue'
import DiscordAuth from './components/DiscordAuth.vue'
import { supabase } from './helpers/supabaseClient'
import { ref } from 'vue';

const isUserLoggedIn = ref(false);

onMounted(async() => {
  // Check if user is signed in
  const loginData = await supabase.auth.getUser();
  isUserLoggedIn.value = loginData.data.user != null;

});

</script>

<template>
  <div>
    <img src="./assets/hsr512.svg" class="logo hsr" alt="HSR logo" />
  </div>
  <h1>HoyoBot Login</h1>
  <DiscordAuth v-if="!isUserLoggedIn" />
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
