<template>
  <div class="target-line">
    <svg>
      <path 
        v-for="(path, index) in paths" 
        :key="index"
        class="target-path" 
        :d="path"
      />
    </svg>
  </div>
</template>

<script setup>
defineProps({
  paths: {
    type: Array,
    default: () => []
  }
})
</script>

