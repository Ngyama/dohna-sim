<template>
  <div 
    class="skill-item" 
    :id="`skill-${skill.id}`"
    :class="{ active: isActive }"
    @click="$emit('select', skill)"
  >
    <div class="skill-info">
      <div class="skill-header">
        <span class="skill-name">{{ skill.name }}</span>
        <span class="skill-tags">{{ skill.tags }}</span>
        <span class="skill-cost">{{ skill.cost }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  skill: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select'])
</script>

