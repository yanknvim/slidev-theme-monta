<script setup lang="ts">
import { handleBackground } from '@slidev/client'
import { computed } from 'vue'
import MontaStage from '../components/MontaStage.vue'

const props = defineProps({
  background: {
    type: String,
    default: undefined,
  },
})

const style = computed(() => handleBackground(props.background))
</script>

<template>
  <div class="slidev-layout intro monta" :style="style">
    <MontaStage>
      <slot />
    </MontaStage>
  </div>
</template>
