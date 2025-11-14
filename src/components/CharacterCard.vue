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
      <div v-if="character.id.startsWith('player-')" class="status-item">
        <span class="status-label">MP</span>
        <div class="status-bar-fill mp-bar" :style="{ width: `${(character.mp / character.maxMp) * 100}%` }"></div>
        <span class="status-value">{{ character.mp }}</span>
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
        :style="getSpriteStyle()"
      />
      <span v-else>{{ character.name }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
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

const getAnimationType = (sprite) => {
  if (!sprite) return 'idle'
  const spritePath = sprite.toString()
  if (spritePath.includes('idle')) return 'idle'
  if (spritePath.includes('walk') || spritePath.includes('run')) return 'walk'
  if (spritePath.includes('attack')) return 'attack'
  if (spritePath.includes('hit')) return 'hit'
  if (spritePath.includes('death')) return 'death'
  return 'idle'
}

const getSpriteStyle = () => {
  if (props.character.id.startsWith('enemy-') && props.character.spriteScales) {
    const animType = getAnimationType(props.character.sprite)
    const config = props.character.spriteScales[animType]
    
    let scale = 2.5
    let offsetY = 0
    
    if (typeof config === 'number') {
      scale = config
    } else if (config && typeof config === 'object') {
      scale = config.scale || 2.5
      offsetY = config.offsetY || 0
    }
    
    return {
      transform: `scaleX(-${scale}) scaleY(${scale}) translateY(${offsetY}px)`,
      width: 'auto',
      height: 'auto',
      maxWidth: 'none',
      maxHeight: 'none',
      objectFit: 'none',
      display: 'block',
      imageRendering: 'pixelated'
    }
  }
  return {}
}
</script>

