<script setup lang="ts">
import { supabase } from '../helpers/supabaseClient.ts'

const props = defineProps<{ serverId: number }>()

const handleLogin = async () => {
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
    <button type="button" id="discordAuth" @click="handleLogin">Login with Discord</button>
  </div>
</template>

<style scoped>
</style>
