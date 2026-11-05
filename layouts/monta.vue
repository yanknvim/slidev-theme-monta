<script setup lang="ts">
// `layout: monta` is an explicit alias for the theme's default slide.
import MontaDefault from './default.vue'
</script>

<template>
  <MontaDefault>
    <slot />
  </MontaDefault>
</template>
