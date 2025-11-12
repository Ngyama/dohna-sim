<template>
  <div class="battle-log" ref="logRef">
    <div 
      v-for="(entry, index) in logs" 
      :key="index" 
      class="log-entry"
    >
      {{ entry }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  }
})

const logRef = ref(null)

// Auto scroll to bottom
watch(() => props.logs.length, async () => {
  await nextTick()
  if (logRef.value) {
    logRef.value.scrollTop = logRef.value.scrollHeight
  }
}, { immediate: true })
</script>

