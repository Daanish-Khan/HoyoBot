<script setup lang="ts">
import { supabase } from '../helpers/supabaseClient.ts'
import { ref } from 'vue';

const props = defineProps<{ serverId: number }>()
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
    await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
            redirectTo: 'http://localhost:5173/?serverid=' + props.serverId
        }
    })
}
</script>

<template>
  <div class="card">
    <v-btn variant="tonal" :loading="loading" size="large" sm="6" md="4" @click="handleLogin" id="discordAuth">
      Login with Discord
    </v-btn>
  </div>
</template>

<style scoped>
#discordAuth {
  margin: 2em;
  background-color: #7289da;
}
</style>
