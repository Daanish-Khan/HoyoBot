<script setup lang="ts">
  import { supabase } from '../helpers/supabaseClient.ts'
  import { ref } from 'vue';

  const loading = ref(false)

  const handleLogin = async () => {
    loading.value = true
    await supabase.auth.signInWithOAuth({
        provider: 'discord',
		options: {
			redirectTo: 'http://localhost:3000/'
		}
    })
  }
</script>

<template>
  <div class="card">
    <v-btn variant="tonal" prepend-icon="custom:discordIcon" size="large" sm="6" md="4" id="discordAuth" @click="handleLogin" :loading="loading">
      Login with Discord
    </v-btn>
  </div>
</template>

<style scoped>
  #discordAuth {
    background-color: #7289da;
  }
</style>
