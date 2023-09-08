<script setup lang="ts">
import { ref } from 'vue'
import { test }  from '../helpers/geetest.ts';

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click=test()>Complete Captcha</button>
  </div>

</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
