<template>
  <div class="game-container">
    <div class="turn-indicator">
      <div class="turn-text">TURN {{ String(currentTurn).padStart(2, '0') }}</div>
      <BattleLog :logs="battleLogs" />
    </div>

    <div class="battle-area">
      <img :src="background1" class="background-layer" alt="" />
      <img :src="background2" class="background-layer" alt="" />
      <img :src="background3" class="background-layer" alt="" />
      <img :src="background4" class="background-layer" alt="" />
      <div class="team team-left">
        <CharacterCard
          v-for="player in players"
          :key="player.id"
          :character="player"
          :highlight-type="getHighlightType(player.id)"
          :is-current-turn="isCurrentTurn(player.id, currentTurn, isPlayerPhase)"
          @click="onCharacterClick(player)"
        />
      </div>

      <div class="team team-right">
        <CharacterCard
          v-for="enemy in enemies"
          :key="enemy.id"
          :character="enemy"
          :highlight-type="getHighlightType(enemy.id)"
          :is-current-turn="isCurrentTurn(enemy.id, currentTurn, !isPlayerPhase)"
          @click="onCharacterClick(enemy)"
        />
      </div>
    </div>

    <div class="ui-panel">
      <div class="action-button-container">
        <button 
          class="action-button"
          :disabled="activeSkillId === null || !isPlayerTurn"
          @click="executeAction"
        >
          开始行动
        </button>
      </div>

      <div class="vertical-menu">
        <div 
          v-for="menu in menus" 
          :key="menu.id"
          class="menu-button"
          :class="{ active: activeMenu === menu.id }"
          @click="activeMenu = menu.id"
        >
          <div class="menu-icon">{{ menu.icon }}</div>
          <div>{{ menu.label }}</div>
        </div>
      </div>

      <div class="skill-list">
        <SkillItem
          v-for="skill in skills"
          :key="skill.id"
          :skill="skill"
          :is-active="activeSkillId === skill.id"
          @select="onSkillSelect"
        />
      </div>
    </div>

    <TargetLines :paths="targetPaths" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import CharacterCard from './components/CharacterCard.vue'
import SkillItem from './components/SkillItem.vue'
import BattleLog from './components/BattleLog.vue'
import TargetLines from './components/TargetLines.vue'
import { skillsData } from './data/skills.js'
import { enemySkillsData } from './data/enemySkills.js'
import { executeSkill } from './utils/skillExecutor.js'
import { getCurrentTurnPair, getCurrentTurnCharacter, isCurrentTurn, getEnemyForPlayer } from './utils/turnManager.js'
import swordIdleGif from './assets/enemy/Sword/sword_idle.gif'
import playerIdleGif from './assets/enemy/Player/idle.gif'
import background1 from './assets/background/RTB_v1.0/background.png'
import background2 from './assets/background/RTB_v1.0/background2.png'
import background3 from './assets/background/RTB_v1.0/background3.png'
import background4 from './assets/background/RTB_v1.0/background4.png'

// Game state
const currentTurn = ref(1)
const isPlayerPhase = ref(true)
const activeMenu = ref('skill')
const activeSkillId = ref(null)
const battleLogs = ref([
  '战斗开始',
  '现在是 P1 的回合'
])

const players = ref([
  { id: 'player-1', name: 'P1', hp: 280, maxHp: 400, mp: 170, maxMp: 200, vp: 510, maxVp: 510, sprite: playerIdleGif },
  { id: 'player-2', name: 'P2', hp: 240, maxHp: 400, mp: 180, maxMp: 200, vp: 360, maxVp: 450, sprite: playerIdleGif }
])

const enemies = ref([
  { 
    id: 'enemy-1', 
    name: 'E1', 
    hp: 120, 
    maxHp: 300, 
    mp: 10, 
    maxMp: 50, 
    vp: 240, 
    maxVp: 400,
    sprite: swordIdleGif
  },
  { 
    id: 'enemy-2', 
    name: 'E2', 
    hp: 90, 
    maxHp: 300, 
    mp: 50, 
    maxMp: 50, 
    vp: 200, 
    maxVp: 400,
    sprite: swordIdleGif
  },
  { 
    id: 'enemy-3', 
    name: 'E3', 
    hp: 150, 
    maxHp: 300, 
    mp: 30, 
    maxMp: 50, 
    vp: 280, 
    maxVp: 400,
    sprite: swordIdleGif
  },
  { 
    id: 'enemy-4', 
    name: 'E4', 
    hp: 135, 
    maxHp: 300, 
    mp: 40, 
    maxMp: 50, 
    vp: 220, 
    maxVp: 400,
    sprite: swordIdleGif
  }
])

const menus = ref([
  { id: 'skill', icon: '👊', label: 'スキル' },
  { id: 'item', icon: '🎒', label: 'アイテム' }
])

const skills = ref(skillsData)
const highlightMap = ref({})
const targetPaths = ref([])

const getHighlightType = (characterId) => {
  return highlightMap.value[characterId] || null
}

const activeSkill = computed(() => {
  return skills.value.find(s => s.id === activeSkillId.value)
})

const currentTurnPair = computed(() => {
  return getCurrentTurnPair(currentTurn.value)
})

const currentTurnCharacter = computed(() => {
  return getCurrentTurnCharacter(currentTurn.value, isPlayerPhase.value)
})

const isPlayerTurn = computed(() => {
  return isPlayerPhase.value
})

// Skill selection handler
const onSkillSelect = (skill) => {
  activeSkillId.value = skill.id
  updateHighlights()
  updateTargetLines()
}

// Update character highlights based on selected skill
const updateHighlights = () => {
  highlightMap.value = {}
  
  if (!activeSkill.value) return
  
  const skill = activeSkill.value
  
  if (skill.type === 'heal') {
    skill.targets.forEach(targetId => {
      highlightMap.value[targetId] = 'green'
    })
  } else if (skill.type === 'attack') {
    skill.targets.forEach(targetId => {
      highlightMap.value[targetId] = 'yellow'
    })
  }
}

// Update target indicator lines
const updateTargetLines = () => {
  if (!activeSkill.value || activeSkill.value.type === 'heal') {
    targetPaths.value = []
    return
  }
  
  const skill = activeSkill.value
  
  nextTick(() => {
    const paths = []
    
    skill.targets.forEach((targetId) => {
      const skillEl = document.getElementById(`skill-${skill.id}`)
      const targetEl = document.getElementById(targetId)
      
      if (!skillEl || !targetEl) return
      
      const skillRect = skillEl.getBoundingClientRect()
      const targetRect = targetEl.getBoundingClientRect()
      
      const startX = skillRect.right
      const startY = skillRect.top + skillRect.height / 2
      const endX = targetRect.left + targetRect.width / 2
      const endY = targetRect.bottom
      const midX = endX
      const midY = startY
      
      const pathData = `M ${startX} ${startY} L ${midX} ${midY} L ${endX} ${endY}`
      paths.push(pathData)
    })
    
    targetPaths.value = paths
  })
}

const onCharacterClick = (character) => {
  console.log('角色被点击:', character.name)
}

// Execute player action
const executeAction = () => {
  if (!activeSkill.value) return
  
  if (!isPlayerPhase.value) {
    addBattleLog('现在不是你的回合！')
    return
  }
  
  executeSkill(
    activeSkill.value,
    players.value,
    enemies.value,
    addBattleLog
  )
  
  isPlayerPhase.value = false
  highlightMap.value = {}
  targetPaths.value = []
  activeSkillId.value = null
  
  setTimeout(() => {
    executeEnemyTurn()
  }, 500)
}

// Execute enemy turn
const executeEnemyTurn = () => {
  const currentEnemy = enemies.value.find(e => e.id === currentTurnPair.value.enemy)
  
  if (!currentEnemy || currentEnemy.hp <= 0) {
    nextTurn()
    return
  }
  
  const slashSkill = enemySkillsData.slash
  const alivePlayers = players.value.filter(p => p.hp > 0)
  
  if (alivePlayers.length === 0) {
    addBattleLog('所有玩家都被击败了！')
    return
  }
  
  const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)]
  
  addBattleLog(`${currentEnemy.name} 使用了 ${slashSkill.name}`)
  
  const baseDamage = slashSkill.baseDamage
  const damage = Math.floor(baseDamage * (0.9 + Math.random() * 0.2))
  
  target.hp = Math.max(0, target.hp - damage)
  addBattleLog(`${slashSkill.name} 对 ${target.name} 造成了 ${damage} 点伤害`)
  
  if (target.hp <= 0) {
    addBattleLog(`${target.name} 被击败了！`)
  }
  
  nextTurn()
}

// Advance to next turn
const nextTurn = () => {
  currentTurn.value++
  isPlayerPhase.value = true
  
  const nextPlayer = players.value.find(p => p.id === currentTurnPair.value.player)
  if (nextPlayer && nextPlayer.hp <= 0) {
    setTimeout(() => {
      nextTurn()
    }, 300)
  }
}

const addBattleLog = (message) => {
  battleLogs.value.push(message)
}

const clearBattleLog = () => {
  battleLogs.value = []
}

const handleResize = () => {
  updateTargetLines()
}

watch(activeSkillId, () => {
  updateHighlights()
  updateTargetLines()
})

onMounted(() => {
  updateHighlights()
  updateTargetLines()
  window.addEventListener('resize', handleResize)
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (activeSkill.value && isPlayerTurn.value) {
        executeAction()
      }
    }
  })
  
  if (!isPlayerPhase.value) {
    isPlayerPhase.value = true
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

defineExpose({
  addBattleLog,
  clearBattleLog,
  updateTurn: (turn) => { currentTurn.value = turn }
})
</script>

