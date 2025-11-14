export function executeSkill(skill, players, enemies, addLog) {
  if (!skill) return

  addLog(`プレイヤーが${skill.name}を使用`)

  if (skill.type === 'heal') {
    executeHealSkill(skill, players, enemies, addLog)
  } else if (skill.type === 'attack') {
    executeAttackSkill(skill, players, enemies, addLog)
  }
}

function executeHealSkill(skill, players, enemies, addLog) {
  skill.targets.forEach(targetId => {
    const target = [...players, ...enemies].find(c => c.id === targetId)
    if (target) {
      const healAmount = Math.floor(target.maxHp * (skill.healPercent || 0.3))
      const oldHp = target.hp
      target.hp = Math.min(target.hp + healAmount, target.maxHp)
      const actualHeal = target.hp - oldHp

      if (actualHeal > 0) {
        addLog(`${target.name}のHPが${actualHeal}回復`)
      }
    }
  })
}

function executeAttackSkill(skill, players, enemies, addLog) {
  skill.targets.forEach(targetId => {
    const target = enemies.find(e => e.id === targetId)
    if (target && target.hp > 0) {
      const baseDamage = skill.baseDamage || 100
      const damage = Math.floor(baseDamage * (0.9 + Math.random() * 0.2))

      target.hp = Math.max(0, target.hp - damage)
      addLog(`${skill.name}が${target.name}に${damage}ダメージ`)

      if (target.hp <= 0) {
        addLog(`${target.name}は倒れた！`)
      }
    }
  })
}
