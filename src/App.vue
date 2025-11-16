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
          :is-current-turn="isCurrentTurn(player.id, currentTurn)"
          @click="onCharacterClick(player)"
        />
      </div>

      <div class="team team-right">
        <CharacterCard
          v-for="(enemy, index) in enemies.filter(e => e.hp > 0)"
          :key="`enemy-${index}-${enemy.id}`"
          :character="enemy"
          :highlight-type="getHighlightType(enemy.id)"
          :is-current-turn="isCurrentTurn(enemy.id, currentTurn)"
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
          行動開始
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
import { skillsData, warriorSkillsData } from './data/skills.js'
import { enemySkillsData } from './data/enemySkills.js'
import { executeSkill } from './utils/skillExecutor.js'
import { getCurrentTurnPair, getCurrentTurnCharacter, isCurrentTurn, getEnemyForPlayer, isPlayerTurn as checkIsPlayerTurn } from './utils/turnManager.js'
import swordIdleGif from './assets/enemy/Sword/sword_idle.gif'
import swordWalkGif from './assets/enemy/Sword/sword_walk.gif'
import swordAttackGif from './assets/enemy/Sword/sword_attack.gif'
import swordHitGif from './assets/enemy/Sword/sword_hit.gif'
import swordDeathGif from './assets/enemy/Sword/sword_death.gif'
import playerIdleGif from './assets/enemy/Player/Samura_idle.gif'
import samuraRunGif from './assets/enemy/Player/Samura_run.gif'
import samuraAttack1Gif from './assets/enemy/Player/Samura_attack1.gif'
import samuraAttack2Gif from './assets/enemy/Player/Samura_attack2.gif'
import samuraHitGif from './assets/enemy/Player/Samura_hit.gif'
import warriorIdleGif from './assets/enemy/Warrior/idle.gif'
import warriorAttack1Gif from './assets/enemy/Warrior/attack1.gif'
import warriorAttack2Gif from './assets/enemy/Warrior/attack2.gif'
import warriorAttack3Gif from './assets/enemy/Warrior/attack3.gif'
import warriorHitGif from './assets/enemy/Warrior/hit.gif'
import background1 from './assets/background/RTB_v1.0/background.png'
import background2 from './assets/background/RTB_v1.0/background2.png'
import background3 from './assets/background/RTB_v1.0/background3.png'
import background4 from './assets/background/RTB_v1.0/background4.png'

// Game state
const currentTurn = ref(1)
const activeMenu = ref('skill')
const activeSkillId = ref(null)
const battleLogs = ref([
  '戦闘開始',
  'P1のターン'
])

const players = ref([
  { id: 'player-1', name: 'P1', hp: 100, maxHp: 100, mp: 100, maxMp: 100, vp: 510, maxVp: 510, sprite: playerIdleGif },
  { id: 'player-2', name: 'P2', hp: 100, maxHp: 100, mp: 100, maxMp: 100, vp: 360, maxVp: 450, sprite: warriorIdleGif }
])

const enemies = ref([
  { 
    id: 'enemy-1', 
    name: 'E1', 
    hp: 100, 
    maxHp: 100, 
    mp: 100, 
    maxMp: 100, 
    vp: 240, 
    maxVp: 400,
    sprite: swordIdleGif,
    deathAnimationPlayed: false,
    spriteScales: {
      idle: { scale: 2.0, offsetY: 0 },
      walk: { scale: 2.0, offsetY: 0 },  
      attack: { scale: 2.0, offsetY: -30 },
      hit: { scale: 2.0, offsetY: 0 },    
      death: { scale: 2.0, offsetY: 0 }    
    }
  },
  { 
    id: 'enemy-2', 
    name: 'E2', 
    hp: 100, 
    maxHp: 100, 
    mp: 100, 
    maxMp: 100, 
    vp: 200, 
    maxVp: 400,
    sprite: swordIdleGif,
    deathAnimationPlayed: false,
    spriteScales: {
      idle: { scale: 2.0, offsetY: 0 },
      walk: { scale: 2.0, offsetY: 0 },
      attack: { scale: 2.0, offsetY: -30 },
      hit: { scale: 2.0, offsetY: 0 },
      death: { scale: 2.0, offsetY: 0 }
    }
  },
  { 
    id: 'enemy-3', 
    name: 'E3', 
    hp: 100, 
    maxHp: 100, 
    mp: 100, 
    maxMp: 100, 
    vp: 280, 
    maxVp: 400,
    sprite: swordIdleGif,
    deathAnimationPlayed: false,
    spriteScales: {
      idle: { scale: 2.0, offsetY: 0 },
      walk: { scale: 2.0, offsetY: 0 },
      attack: { scale: 2.0, offsetY: -30 },
      hit: { scale: 2.0, offsetY: 0 },
      death: { scale: 2.0, offsetY: 0 }
    }
  },
  { 
    id: 'enemy-4', 
    name: 'E4', 
    hp: 100, 
    maxHp: 100, 
    mp: 100, 
    maxMp: 100, 
    vp: 220, 
    maxVp: 400,
    sprite: swordIdleGif,
    deathAnimationPlayed: false,
    spriteScales: {
      idle: { scale: 2.0, offsetY: 0 },
      walk: { scale: 2.0, offsetY: 0 },
      attack: { scale: 2.0, offsetY: -30 },
      hit: { scale: 2.0, offsetY: 0 },
      death: { scale: 2.0, offsetY: 0 }
    }
  }
])

const menus = ref([
  { id: 'skill', icon: '👊', label: 'スキル' },
  { id: 'item', icon: '🎒', label: 'アイテム' }
])

const getAliveEnemies = () => {
  return enemies.value.filter(e => e.hp > 0)
}

// Convert skill targetIndices to actual enemy IDs
const getSkillTargets = (skill) => {
  if (skill.targetIndices) {
    const aliveEnemies = getAliveEnemies()
    return skill.targetIndices
      .map(index => aliveEnemies[index])
      .filter(enemy => enemy)
      .map(enemy => enemy.id)
  }
  // Fallback to old targets format for backward compatibility
  return skill.targets || []
}

const skills = computed(() => {
  // Only show skills during player turns
  if (!isPlayerTurn.value) {
    return []
  }
  
  // Turn 1 (player-1): use original skills
  // Turn 2 (player-2/warrior): use warrior skills
  const currentCharacterId = getCurrentTurnCharacter(currentTurn.value)
  const baseSkills = currentCharacterId === 'player-2' ? warriorSkillsData : skillsData
  
  // Map skills to include computed targets based on current alive enemies
  return baseSkills.map(skill => ({
    ...skill,
    targets: getSkillTargets(skill)
  }))
})
const highlightMap = ref({})
const targetPaths = ref([])

const getHighlightType = (characterId) => {
  return highlightMap.value[characterId] || null
}

const activeSkill = computed(() => {
  return skills.value.find(s => s.id === activeSkillId.value)
})

// Reset active skill when skills change
watch(() => currentTurn.value, () => {
  activeSkillId.value = null
  highlightMap.value = {}
  targetPaths.value = []
})

const currentTurnPair = computed(() => {
  return getCurrentTurnPair(currentTurn.value)
})

const currentTurnCharacter = computed(() => {
  return getCurrentTurnCharacter(currentTurn.value)
})

const isPlayerTurn = computed(() => {
  return checkIsPlayerTurn(currentTurn.value)
})

// Skill selection handler
const onSkillSelect = (skill) => {
  activeSkillId.value = skill.id
  updateHighlights()
  updateTargetLines()
}

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
  console.log('キャラクタークリック:', character.name)
}

// Show enemy hit animation
const showEnemyHitAnimation = async (enemy) => {
  if (!enemy || !enemy.id.startsWith('enemy-')) return
  
  enemy.sprite = swordHitGif
  await new Promise(resolve => setTimeout(resolve, 300))
}

// Show player hit animation
const showPlayerHitAnimation = async (player) => {
  if (!player || !player.id.startsWith('player-')) return
  
  if (player.id === 'player-1') {
    player.sprite = samuraHitGif
  } else if (player.id === 'player-2') {
    player.sprite = warriorHitGif
  } else {
    return
  }
  
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Restore to idle if still alive
  if (player.hp > 0) {
    player.sprite = player.id === 'player-1' ? playerIdleGif : warriorIdleGif
  }
}

const showEnemyDeathAnimation = async (enemy) => {
  if (!enemy || !enemy.id.startsWith('enemy-') || enemy.deathAnimationPlayed) return
  
  enemy.deathAnimationPlayed = true
  enemy.sprite = swordDeathGif
  
  // Keep death animation, don't restore
  await new Promise(resolve => setTimeout(resolve, 500))
}

// Rearrange enemies: move alive enemies to front positions
const rearrangeEnemies = () => {
  // If last enemy (enemy-4) is dead, don't rearrange
  const lastEnemy = enemies.value[enemies.value.length - 1]
  if (lastEnemy && lastEnemy.hp <= 0) {
    return
  }
  
  const aliveEnemies = enemies.value.filter(e => e.hp > 0)
  const deadEnemies = enemies.value.filter(e => e.hp <= 0)
  
  enemies.value = [...aliveEnemies, ...deadEnemies]
}

const executeSlashAnimation = async (skill, targetId) => {
  const currentPlayer = players.value.find(p => p.id === currentTurnCharacter.value)
  const aliveEnemies = getAliveEnemies()
  const targetEnemy = skill.targetIndices 
    ? aliveEnemies[skill.targetIndices[0]]
    : enemies.value.find(e => e.id === targetId)
  
  if (!currentPlayer || !targetEnemy) return
  
  await nextTick()
  const playerBoxEl = document.getElementById(currentPlayer.id)
  const enemyBoxEl = document.getElementById(targetId)
  
  if (!playerBoxEl || !enemyBoxEl) return
  
  const playerCharacterEl = playerBoxEl.closest('.character')
  if (!playerCharacterEl) return
  
  const playerRect = playerBoxEl.getBoundingClientRect()
  const enemyRect = enemyBoxEl.getBoundingClientRect()
  
  const battleArea = document.querySelector('.battle-area')
  const battleAreaRect = battleArea.getBoundingClientRect()
  const playerLeft = playerRect.left - battleAreaRect.left
  const enemyLeft = enemyRect.left - battleAreaRect.left
  const moveDistance = enemyLeft - playerLeft - 100
  
  currentPlayer.sprite = samuraRunGif
  playerCharacterEl.style.transition = 'transform 0.6s ease-in-out'
  playerCharacterEl.style.transform = `translateX(${moveDistance}px)`
  
  await new Promise(resolve => setTimeout(resolve, 600))
  
  currentPlayer.sprite = samuraAttack1Gif
  await showEnemyHitAnimation(targetEnemy)
  
  const damage = 50
  targetEnemy.hp = Math.max(0, targetEnemy.hp - damage)
  addBattleLog(`${skill.name}が${targetEnemy.name}に${damage}ダメージ`)
  
  if (targetEnemy.hp <= 0) {
    addBattleLog(`${targetEnemy.name}は倒れた！`)
    await showEnemyDeathAnimation(targetEnemy)
    rearrangeEnemies()
  } else {
    targetEnemy.sprite = swordIdleGif
  }
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  currentPlayer.sprite = samuraRunGif
  playerCharacterEl.style.transform = 'translateX(0)'
  
  await new Promise(resolve => setTimeout(resolve, 600))
  
  currentPlayer.sprite = playerIdleGif
  playerCharacterEl.style.transition = ''
  playerCharacterEl.style.transform = ''
}

const executeSweepAnimation = async (skill) => {
  const currentPlayer = players.value.find(p => p.id === currentTurnCharacter.value)
  
  const aliveEnemies = getAliveEnemies()
  const targetEnemiesList = skill.targetIndices
    ? skill.targetIndices.map(index => aliveEnemies[index]).filter(e => e)
    : skill.targets.map(id => enemies.value.find(e => e.id === id)).filter(e => e)
  
  if (!currentPlayer || targetEnemiesList.length < 2) return
  
  await nextTick()
  const playerBoxEl = document.getElementById(currentPlayer.id)
  const targetEnemies = targetEnemiesList.map(enemy => ({
    id: enemy.id,
    enemy: enemy,
    element: document.getElementById(enemy.id)
  })).filter(t => t.enemy && t.element)
  
  if (targetEnemies.length < 2) return
  
  // Find parent character element
  const playerCharacterEl = playerBoxEl.closest('.character')
  if (!playerCharacterEl) return
  
  const battleArea = document.querySelector('.battle-area')
  const battleAreaRect = battleArea.getBoundingClientRect()
  const playerRect = playerBoxEl.getBoundingClientRect()
  const playerLeft = playerRect.left - battleAreaRect.left
  
  // Calculate middle position between two targets
  const target1Rect = targetEnemies[0].element.getBoundingClientRect()
  const target2Rect = targetEnemies[1].element.getBoundingClientRect()
  const target1Left = target1Rect.left - battleAreaRect.left
  const target2Left = target2Rect.left - battleAreaRect.left
  const middleLeft = (target1Left + target2Left) / 2
  const moveDistance = middleLeft - playerLeft - 100 // 100px in front of middle position
  
  // Step 1: Change to run sprite and move to middle of targets
  currentPlayer.sprite = samuraRunGif
  playerCharacterEl.style.transition = 'transform 0.6s ease-in-out'
  playerCharacterEl.style.transform = `translateX(${moveDistance}px)`
  
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Step 2: Change to attack sprite
  currentPlayer.sprite = samuraAttack2Gif
  
  // Execute damage to all targets (id=2: fixed 30 damage)
  const damage = 30
  for (const { enemy } of targetEnemies) {
    // Show enemy hit animation
    await showEnemyHitAnimation(enemy)
    
    enemy.hp = Math.max(0, enemy.hp - damage)
    addBattleLog(`${skill.name}が${enemy.name}に${damage}ダメージ`)
    
    if (enemy.hp <= 0) {
      addBattleLog(`${enemy.name}は倒れた！`)
      await showEnemyDeathAnimation(enemy)
    } else {
      // Restore to idle if still alive
      enemy.sprite = swordIdleGif
    }
  }
  
  // Rearrange enemies after all attacks
  rearrangeEnemies()
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Step 3: Change back to run sprite and move back
  currentPlayer.sprite = samuraRunGif
  playerCharacterEl.style.transform = 'translateX(0)'
  
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Step 4: Restore idle sprite
  currentPlayer.sprite = playerIdleGif
  playerCharacterEl.style.transition = ''
  playerCharacterEl.style.transform = ''
}

const executeWarriorSlashAnimation = async (skill, targetId) => {
  const currentPlayer = players.value.find(p => p.id === currentTurnCharacter.value)
  const aliveEnemies = getAliveEnemies()
  const targetEnemy = skill.targetIndices 
    ? aliveEnemies[skill.targetIndices[0]]
    : enemies.value.find(e => e.id === targetId)
  
  if (!currentPlayer || !targetEnemy) return
  
  await nextTick()
  const playerBoxEl = document.getElementById(currentPlayer.id)
  const enemyBoxEl = document.getElementById(targetId)
  
  if (!playerBoxEl || !enemyBoxEl) return
  
  // Find parent character element
  const playerCharacterEl = playerBoxEl.closest('.character')
  if (!playerCharacterEl) return
  
  const playerRect = playerBoxEl.getBoundingClientRect()
  const enemyRect = enemyBoxEl.getBoundingClientRect()
  
  // Calculate target position (in front of enemy, accounting for team-left position)
  const battleArea = document.querySelector('.battle-area')
  const battleAreaRect = battleArea.getBoundingClientRect()
  const playerLeft = playerRect.left - battleAreaRect.left
  const enemyLeft = enemyRect.left - battleAreaRect.left
  const moveDistance = enemyLeft - playerLeft - 100 // 100px in front of enemy
  
  // Step 1: Change to idle sprite (as run) and move to enemy
  currentPlayer.sprite = warriorIdleGif
  playerCharacterEl.style.transition = 'transform 0.6s ease-in-out'
  playerCharacterEl.style.transform = `translateX(${moveDistance}px)`
  
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Step 2: Change to attack sprite
  currentPlayer.sprite = warriorAttack1Gif
  
  // Show enemy hit animation
  await showEnemyHitAnimation(targetEnemy)
  
  // Execute damage (id=101: fixed 40 damage)
  const damage = 40
  targetEnemy.hp = Math.max(0, targetEnemy.hp - damage)
  addBattleLog(`${skill.name}が${targetEnemy.name}に${damage}ダメージ`)
  
  if (targetEnemy.hp <= 0) {
    addBattleLog(`${targetEnemy.name}は倒れた！`)
    await showEnemyDeathAnimation(targetEnemy)
    rearrangeEnemies()
  } else {
    // Restore to idle if still alive
    targetEnemy.sprite = swordIdleGif
  }
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Step 3: Change back to idle sprite and move back
  currentPlayer.sprite = warriorIdleGif
  playerCharacterEl.style.transform = 'translateX(0)'
  
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Step 4: Restore idle sprite
  currentPlayer.sprite = warriorIdleGif
  playerCharacterEl.style.transition = ''
  playerCharacterEl.style.transform = ''
}

const executeWarriorSweepAnimation = async (skill) => {
  const currentPlayer = players.value.find(p => p.id === currentTurnCharacter.value)
  
  const aliveEnemies = getAliveEnemies()
  const targetEnemiesList = skill.targetIndices
    ? skill.targetIndices.map(index => aliveEnemies[index]).filter(e => e)
    : skill.targets.map(id => enemies.value.find(e => e.id === id)).filter(e => e)
  
  if (!currentPlayer || targetEnemiesList.length < 2) return
  
  await nextTick()
  const playerBoxEl = document.getElementById(currentPlayer.id)
  const targetEnemies = targetEnemiesList.map(enemy => ({
    id: enemy.id,
    enemy: enemy,
    element: document.getElementById(enemy.id)
  })).filter(t => t.enemy && t.element)
  
  if (targetEnemies.length < 2) return
  
  // Find parent character element
  const playerCharacterEl = playerBoxEl.closest('.character')
  if (!playerCharacterEl) return
  
  const battleArea = document.querySelector('.battle-area')
  const battleAreaRect = battleArea.getBoundingClientRect()
  const playerRect = playerBoxEl.getBoundingClientRect()
  const playerLeft = playerRect.left - battleAreaRect.left
  
  // Calculate middle position between two targets
  const target1Rect = targetEnemies[0].element.getBoundingClientRect()
  const target2Rect = targetEnemies[1].element.getBoundingClientRect()
  const target1Left = target1Rect.left - battleAreaRect.left
  const target2Left = target2Rect.left - battleAreaRect.left
  const middleLeft = (target1Left + target2Left) / 2
  const moveDistance = middleLeft - playerLeft - 100 // 100px in front of middle position
  
  // Step 1: Change to idle sprite (as run) and move to middle of targets
  currentPlayer.sprite = warriorIdleGif
  playerCharacterEl.style.transition = 'transform 0.6s ease-in-out'
  playerCharacterEl.style.transform = `translateX(${moveDistance}px)`
  
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Step 2: Change to attack sprite
  currentPlayer.sprite = warriorAttack2Gif
  
  // Execute damage to all targets (id=102: fixed 30 damage)
  const damage = 30
  for (const { enemy } of targetEnemies) {
    // Show enemy hit animation
    await showEnemyHitAnimation(enemy)
    
    enemy.hp = Math.max(0, enemy.hp - damage)
    addBattleLog(`${skill.name}が${enemy.name}に${damage}ダメージ`)
    
    if (enemy.hp <= 0) {
      addBattleLog(`${enemy.name}は倒れた！`)
      await showEnemyDeathAnimation(enemy)
    } else {
      // Restore to idle if still alive
      enemy.sprite = swordIdleGif
    }
  }
  
  // Rearrange enemies after all attacks
  rearrangeEnemies()
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Step 3: Change back to idle sprite and move back
  currentPlayer.sprite = warriorIdleGif
  playerCharacterEl.style.transform = 'translateX(0)'
  
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Step 4: Restore idle sprite
  currentPlayer.sprite = warriorIdleGif
  playerCharacterEl.style.transition = ''
  playerCharacterEl.style.transform = ''
}

const executeWarriorChopAnimation = async (skill, targetId) => {
  const currentPlayer = players.value.find(p => p.id === currentTurnCharacter.value)
  const aliveEnemies = getAliveEnemies()
  const targetEnemy = skill.targetIndices 
    ? aliveEnemies[skill.targetIndices[0]]
    : enemies.value.find(e => e.id === targetId)
  
  if (!currentPlayer || !targetEnemy) return
  
  await nextTick()
  const playerBoxEl = document.getElementById(currentPlayer.id)
  const enemyBoxEl = document.getElementById(targetId)
  
  if (!playerBoxEl || !enemyBoxEl) return
  
  // Find parent character element
  const playerCharacterEl = playerBoxEl.closest('.character')
  if (!playerCharacterEl) return
  
  const playerRect = playerBoxEl.getBoundingClientRect()
  const enemyRect = enemyBoxEl.getBoundingClientRect()
  
  // Calculate target position (in front of enemy, accounting for team-left position)
  const battleArea = document.querySelector('.battle-area')
  const battleAreaRect = battleArea.getBoundingClientRect()
  const playerLeft = playerRect.left - battleAreaRect.left
  const enemyLeft = enemyRect.left - battleAreaRect.left
  const moveDistance = enemyLeft - playerLeft - 100 // 100px in front of enemy
  
  // Step 1: Change to idle sprite (as run) and move to enemy
  currentPlayer.sprite = warriorIdleGif
  playerCharacterEl.style.transition = 'transform 0.6s ease-in-out'
  playerCharacterEl.style.transform = `translateX(${moveDistance}px)`
  
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Step 2: Change to attack sprite
  currentPlayer.sprite = warriorAttack3Gif
  
  // Show enemy hit animation
  await showEnemyHitAnimation(targetEnemy)
  
  // Execute damage (id=103: fixed 60 damage)
  const damage = 60
  targetEnemy.hp = Math.max(0, targetEnemy.hp - damage)
  addBattleLog(`${skill.name}が${targetEnemy.name}に${damage}ダメージ`)
  
  if (targetEnemy.hp <= 0) {
    addBattleLog(`${targetEnemy.name}は倒れた！`)
    await showEnemyDeathAnimation(targetEnemy)
    rearrangeEnemies()
  } else {
    // Restore to idle if still alive
    targetEnemy.sprite = swordIdleGif
  }
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Step 3: Change back to idle sprite and move back
  currentPlayer.sprite = warriorIdleGif
  playerCharacterEl.style.transform = 'translateX(0)'
  
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Step 4: Restore idle sprite
  currentPlayer.sprite = warriorIdleGif
  playerCharacterEl.style.transition = ''
  playerCharacterEl.style.transform = ''
}

const executeAction = async () => {
  if (!activeSkill.value) return
  
  if (!isPlayerTurn.value) {
    addBattleLog('あなたのターンではありません！')
    return
  }
  
  const skill = activeSkill.value
  
  // Handle slash skill with animation (id:1)
  if (skill.id === 1 && skill.name === '斬撃') {
    await executeSlashAnimation(skill, skill.targets?.[0])
  }
  else if (skill.id === 2 && skill.name === '薙ぎ払い') {
    await executeSweepAnimation(skill)
  }
  // Handle warrior slash skill with animation (id:101)
  else if (skill.id === 101 && skill.name === '斬撃') {
    await executeWarriorSlashAnimation(skill, skill.targets?.[0])
  }
  else if (skill.id === 102 && skill.name === '薙ぎ払い') {
    await executeWarriorSweepAnimation(skill)
  }
  else if (skill.id === 103 && skill.name === '下段斬り') {
    await executeWarriorChopAnimation(skill, skill.targets?.[0])
  }
  else {
    // Other skills execute normally
    executeSkill(
      skill,
      players.value,
      enemies.value,
      addBattleLog
    )
  }
  
  highlightMap.value = {}
  targetPaths.value = []
  activeSkillId.value = null
  
  // Move to next turn
  nextTurn()
}

const executeEnemyAttackAnimation = async (enemy, targetPlayer) => {
  if (!enemy || !targetPlayer) return
  
  await nextTick()
  const enemyBoxEl = document.getElementById(enemy.id)
  const playerBoxEl = document.getElementById(targetPlayer.id)
  
  if (!enemyBoxEl || !playerBoxEl) return
  
  // Find parent character element
  const enemyCharacterEl = enemyBoxEl.closest('.character')
  if (!enemyCharacterEl) return
  
  const enemyRect = enemyBoxEl.getBoundingClientRect()
  const playerRect = playerBoxEl.getBoundingClientRect()
  
  // Calculate target position (in front of player, accounting for team-right position)
  // Enemy is on the right, player is on the left, so enemy moves left (negative direction)
  const battleArea = document.querySelector('.battle-area')
  const battleAreaRect = battleArea.getBoundingClientRect()
  const enemyLeft = enemyRect.left - battleAreaRect.left
  const playerRight = playerRect.right - battleAreaRect.left
  const moveDistance = playerRight - enemyLeft + 100 // 100px in front of player (negative value, moving left)
  
  // Step 1: Change to walk sprite and move to player
  enemy.sprite = swordWalkGif
  enemyCharacterEl.style.transition = 'transform 0.6s ease-in-out'
  enemyCharacterEl.style.transform = `translateX(${moveDistance}px)`
  
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Step 2: Change to attack sprite
  enemy.sprite = swordAttackGif
  
  // Show player hit animation
  await showPlayerHitAnimation(targetPlayer)
  
  // Execute damage (enemy: fixed 10 damage)
  const slashSkill = enemySkillsData.slash
  const damage = 10
  
  targetPlayer.hp = Math.max(0, targetPlayer.hp - damage)
  addBattleLog(`${enemy.name}が${slashSkill.name}を使用`)
  addBattleLog(`${slashSkill.name}が${targetPlayer.name}に${damage}ダメージ`)
  
  if (targetPlayer.hp <= 0) {
    addBattleLog(`${targetPlayer.name}は倒れた！`)
  }
  
  // Wait longer for attack animation to complete
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Step 3: Change back to walk sprite and move back
  enemy.sprite = swordWalkGif
  enemyCharacterEl.style.transform = 'translateX(0)'
  
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Step 4: Restore idle sprite
  enemy.sprite = swordIdleGif
  enemyCharacterEl.style.transition = ''
  enemyCharacterEl.style.transform = ''
}

const executeEnemyTurn = async () => {
  // Get current turn enemy ID
  const currentEnemyId = getCurrentTurnCharacter(currentTurn.value)
  
  // Check if it's actually an enemy turn
  if (!currentEnemyId.startsWith('enemy-')) {
    return
  }
  
  const currentEnemy = enemies.value.find(e => e.id === currentEnemyId)
  
  if (!currentEnemy || currentEnemy.hp <= 0) {
    nextTurn()
    return
  }
  
  const alivePlayers = players.value.filter(p => p.hp > 0)
  
  if (alivePlayers.length === 0) {
    addBattleLog('全てのプレイヤーが倒れた！')
    return
  }
  
  // Randomly select a target player
  const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)]
  
  // Execute attack animation
  await executeEnemyAttackAnimation(currentEnemy, target)
  
  nextTurn()
}

const nextTurn = () => {
  currentTurn.value++
  
  // Check if next turn character is alive, skip if dead
  const nextCharacterId = getCurrentTurnCharacter(currentTurn.value)
  let nextCharacter = null
  
  if (nextCharacterId.startsWith('player-')) {
    nextCharacter = players.value.find(p => p.id === nextCharacterId)
  } else {
    nextCharacter = enemies.value.find(e => e.id === nextCharacterId)
  }
  
  // Skip dead characters
  if (nextCharacter && nextCharacter.hp <= 0) {
    setTimeout(() => {
      nextTurn()
    }, 300)
    return
  }
  
  // If it's an enemy turn, execute it automatically
  if (!checkIsPlayerTurn(currentTurn.value)) {
    setTimeout(() => {
      executeEnemyTurn()
    }, 500)
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

