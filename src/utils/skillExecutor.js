/**
 * Skill executor - handles skill execution logic
 */

/**
 * Execute a skill
 * @param {Object} skill - Skill object
 * @param {Array} players - Players array
 * @param {Array} enemies - Enemies array
 * @param {Function} addLog - Log function
 */
export function executeSkill(skill, players, enemies, addLog) {
  if (!skill) return

  addLog(`玩家使用了 ${skill.name}`)

  if (skill.type === 'heal') {
    executeHealSkill(skill, players, enemies, addLog)
  } else if (skill.type === 'attack') {
    executeAttackSkill(skill, players, enemies, addLog)
  }
}

/**
 * Execute heal skill
 */
function executeHealSkill(skill, players, enemies, addLog) {
  skill.targets.forEach(targetId => {
    const target = [...players, ...enemies].find(c => c.id === targetId)
    if (target) {
      const healAmount = Math.floor(target.maxHp * (skill.healPercent || 0.3))
      const oldHp = target.hp
      target.hp = Math.min(target.hp + healAmount, target.maxHp)
      const actualHeal = target.hp - oldHp

      if (actualHeal > 0) {
        addLog(`${target.name} 恢复了 ${actualHeal} 点HP`)
      }
    }
  })
}

/**
 * Execute attack skill
 */
function executeAttackSkill(skill, players, enemies, addLog) {
  skill.targets.forEach(targetId => {
    const target = enemies.find(e => e.id === targetId)
    if (target && target.hp > 0) {
      const baseDamage = skill.baseDamage || 100
      const damage = Math.floor(baseDamage * (0.9 + Math.random() * 0.2))

      target.hp = Math.max(0, target.hp - damage)
      addLog(`${skill.name} 对 ${target.name} 造成了 ${damage} 点伤害`)

      if (target.hp <= 0) {
        addLog(`${target.name} 被击败了！`)
      }
    }
  })
}

