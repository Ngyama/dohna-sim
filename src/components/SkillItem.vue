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
      </div>
      <div class="skill-description">{{ skill.description }}</div>
      <div class="skill-cost">{{ skill.cost }}</div>
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

