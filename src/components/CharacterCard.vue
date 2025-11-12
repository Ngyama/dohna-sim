<template>
  <div 
    class="character"
    :class="{
      'target-yellow': highlightType === 'yellow',
      'target-green': highlightType === 'green'
    }"
  >
    <div v-if="isCurrentTurn" class="turn-arrow">↓</div>
    
    <div class="status-bar">
      <div class="status-item">
        <span class="status-label">HP</span>
        <div class="status-bar-fill hp-bar" :style="{ width: `${(character.hp / character.maxHp) * 100}%` }"></div>
        <span class="status-value">{{ character.hp }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">MP</span>
        <div class="status-bar-fill mp-bar" :style="{ width: `${(character.mp / character.maxMp) * 100}%` }"></div>
        <span class="status-value">{{ character.mp }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">VP</span>
        <div class="status-bar-fill vp-bar" :style="{ width: `${(character.vp / character.maxVp) * 100}%` }"></div>
        <span class="status-value">{{ character.vp }}</span>
      </div>
    </div>
    <div 
      class="character-box" 
      :id="character.id"
      :class="{
        'target-yellow': highlightType === 'yellow',
        'target-green': highlightType === 'green'
      }"
      @click="$emit('click', character)"
    >
      <img 
        v-if="character.sprite" 
        :src="character.sprite" 
        :alt="character.name"
        class="character-sprite"
      />
      <span v-else>{{ character.name }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  character: {
    type: Object,
    required: true
  },
  highlightType: {
    type: String,
    default: null
  },
  isCurrentTurn: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

