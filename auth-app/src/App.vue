<script setup lang="ts">
import Captcha from './components/Captcha.vue'
</script>

<template>
  <div>
    <img src="./assets/hsr512.svg" class="logo hsr" alt="HSR logo" />
  </div>
  <Captcha msg="HoyoBot Login" />
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
